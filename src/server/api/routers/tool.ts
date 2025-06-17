import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { createToolSchema, toolNameSchema } from "@/lib/validators/tool"; // Import createToolSchema
import { argumentSchema, type Argument } from "@/types/tool";
import { generateObject } from "ai"; // Import generateObject
import { getModel } from "@/utils/model"; // Import getModel
import { zodToJsonSchema } from "zod-to-json-schema"; // Import zodToJsonSchema

const toolBaseSchema = z.object({
  name: toolNameSchema,
  description: z.string().optional(),
  prompt: z.string().min(1),
  args: z.array(argumentSchema).optional(),
});

const toolCreateSchema = toolBaseSchema
  .extend({
    project_id: z.string().uuid(),
  })
  .refine(
    (data) => {
      if (data.args && data.args.length > 0) {
        for (const arg of data.args) {
          const placeholder = `{${arg.name}}`;
          if (!data.prompt.includes(placeholder)) {
            return false; // Validation fails
          }
        }
      }
      return true; // Validation passes
    },
    {
      message:
        "Prompt must contain placeholders for all arguments in the format {argumentName}.",
      path: ["prompt"], // Attach error to the prompt field
    },
  );

const toolUpdateSchema = toolBaseSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .refine(
    (data) => {
      if (data.prompt === undefined) return true; // Allow updates without prompt field
      if (data.args && data.args.length > 0) {
        for (const arg of data.args) {
          const placeholder = `{${arg.name}}`;
          if (!data.prompt.includes(placeholder)) {
            return false; // Validation fails
          }
        }
      }
      return true; // Validation passes
    },
    {
      message:
        "Prompt must contain placeholders for all arguments in the format {argumentName}.",
      path: ["prompt"], // Attach error to the prompt field
    },
  );

const toolImportInputSchema = z.object({
  project_id: z.string().uuid(),
  tools: z.array(toolBaseSchema),
});

const toolMoveSchema = z.object({
  toolIds: z.array(z.string().uuid()),
  targetProjectId: z.string().uuid(),
});

export const toolRouter = createTRPCRouter({
  create: protectedProcedure
    .input(toolCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the project here

      const tool = await db.tool.create({
        data: {
          project_id: input.project_id,
          name: input.name,
          description: input.description,
          prompt: input.prompt,
          args: input.args,
        },
      });
      return tool;
    }),

  importTools: protectedProcedure
    .input(toolImportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      // 1. Check for duplicate names within the incoming batch
      const incomingToolNames = input.tools.map((tool) => tool.name);
      const uniqueIncomingToolNames = new Set(incomingToolNames);
      if (uniqueIncomingToolNames.size !== incomingToolNames.length) {
        const duplicates = incomingToolNames.filter(
          (name, index) => incomingToolNames.indexOf(name) !== index,
        );
        throw new Error(
          `Duplicate tool names found in the import batch: ${[
            ...new Set(duplicates),
          ].join(", ")}.`,
        );
      }

      // 2. Check for existing tool names in the database for this project
      const existingTools = await db.tool.findMany({
        where: {
          project_id: input.project_id,
          name: {
            in: incomingToolNames,
          },
        },
        select: {
          name: true,
        },
      });

      if (existingTools.length > 0) {
        const existingNames = existingTools.map((tool) => tool.name);
        throw new Error(
          `Tools with these names already exist in this project: ${existingNames.join(
            ", ",
          )}.`,
        );
      }

      // 3. Create tools in a transaction
      const createdTools = await db.$transaction(
        input.tools.map((tool) =>
          db.tool.create({
            data: {
              project_id: input.project_id,
              name: tool.name,
              description: tool.description,
              prompt: tool.prompt,
              args: tool.args,
            },
          }),
        ),
      );

      return createdTools;
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the tool/agent here

      const tool = await db.tool.findUnique({
        where: { id: input.id },
      });
      return tool;
    }),

  getByProjectId: protectedProcedure
    .input(
      z.object({
        project_id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the agent here

      const tools = await db.tool.findMany({
        where: { project_id: input.project_id },
        orderBy: { created_at: "desc" },
      });
      return tools;
    }),

  update: protectedProcedure
    .input(toolUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the tool/agent here

      const dataToUpdate: {
        name?: string;
        description?: string;
        prompt?: string;
        args?: Argument[]; // Use Argument[] for Json type
        updated_at: Date;
      } = {
        updated_at: new Date(),
      };
      if (input.name !== undefined) {
        dataToUpdate.name = input.name;
      }
      if (input.description !== undefined) {
        dataToUpdate.description = input.description;
      }
      if (input.prompt !== undefined) {
        dataToUpdate.prompt = input.prompt;
      }
      if (input.args !== undefined) {
        dataToUpdate.args = input.args;
      }

      const tool = await db.tool.update({
        where: { id: input.id },
        data: dataToUpdate,
      });
      return tool;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the tool/agent here

      await db.tool.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  toggleActive: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        is_active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const tool = await db.tool.update({
        where: { id: input.id },
        data: {
          is_active: input.is_active,
          updated_at: new Date(),
        },
      });
      return tool;
    }),

  getAllByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const projects = await db.project.findMany({
      where: { created_by_user_id: userId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const tools = await db.tool.findMany({
      where: {
        project_id: {
          in: projectIds,
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Explicitly cast args to Argument[]
    const parsedTools = tools.map((tool) => ({
      ...tool,
      args: (tool.args ?? []) as Argument[],
    }));

    return parsedTools;
  }),

  generateToolFromAI: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        prompt: z.string().min(1, "Prompt is required"),
        model: z.string().min(1, "Model is required"),
        apiKeys: z.record(z.string(), z.string()), // Add apiKeys to input schema
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      // Verify user has access to the project
      const project = await db.project.findUnique({
        where: { id: input.projectId },
        select: { created_by_user_id: true },
      });

      if (!project || project.created_by_user_id !== userId) {
        throw new Error(
          "Unauthorized: Project not found or not owned by user.",
        );
      }

      const [provider] = input.model.split("/");

      let selectedModel;
      let selectedApiKey;

      switch (provider) {
        case "google":
          selectedApiKey = input.apiKeys.google;
          if (!selectedApiKey) {
            throw new Error("Google AI API Key is missing.");
          }
          selectedModel = getModel(input.model, selectedApiKey);
          break;
        case "deepseek":
          selectedApiKey = input.apiKeys.deepseek;
          if (!selectedApiKey) {
            throw new Error("DeepSeek AI API Key is missing.");
          }
          selectedModel = getModel(input.model, selectedApiKey);
          break;
        case "openai":
          selectedApiKey = input.apiKeys.openai;
          if (!selectedApiKey) {
            throw new Error("OpenAI API Key is missing.");
          }
          selectedModel = getModel(input.model, selectedApiKey);
          break;
        case "anthropic":
          selectedApiKey = input.apiKeys.anthropic;
          if (!selectedApiKey) {
            throw new Error("Anthropic API Key is missing.");
          }
          selectedModel = getModel(input.model, selectedApiKey);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }

      const model = selectedModel; // Use the selectedModel

      const toolSchemaJson = zodToJsonSchema(createToolSchema, {
        target: "jsonSchema7",
      });

      const systemPrompt = `
You are an expert prompt engineer specializing in creating highly effective, single-use LLM prompt templates. Your task is to generate a concise, production-ready prompt template for an MCP tool based on the TEMPLATE_PURPOSE provided by the user.

## High-Performance Definition
A high-performance prompt achieves:
- **>90% single-attempt success rate** across different LLMs
- **Consistent, predictable outputs** with minimal variation
- **Clear success/failure criteria** that can be objectively measured
- **Robust edge case handling** for various input types and qualities
- **Minimal token usage** while maintaining effectiveness

## Required Template Components

### 1. LLM Role & Context
- Define a specific, expert role (e.g., "You are a senior data analyst with 10+ years of experience")
- Establish clear task boundaries and expectations
- Include relevant domain knowledge or constraints

### 2. Input Specification
- Use a distinct, clear placeholder: [USER_INPUT]
- Specify input format expectations and limitations
- Include input validation or preprocessing instructions if needed

### 3. Processing Instructions
- Break complex tasks into numbered steps when appropriate
- Use positive framing ("Analyze X by doing Y" vs "Don't forget to analyze X")
- Include reasoning methodology (step-by-step, frameworks, criteria)
- Specify how to handle insufficient or unclear input

### 4. Output Definition
- **Format**: Specify exact structure (paragraph, JSON, XML, bullet points, etc.)
- **Length**: Define word/character limits or ranges
- **Style**: Tone, audience level, technical depth
- **Required Elements**: Mandatory sections, data points, or analysis components
- **Validation Criteria**: How the LLM should verify its own output quality

### 5. Quality Assurance
- Include self-check instructions
- Define when to request clarification vs. make reasonable assumptions
- Specify error handling for edge cases

## Best Practices to Implement

### Structure Guidelines
- Use clear heading for multi-part responses: ## Analysis, ### recommendation, ### summary, etc
- Front-load critical constraints and requirements
- Use "Chain of Thought" prompting for complex reasoning tasks
- Include output examples when format is non-standard

### Language Optimization
- Use action verbs and specific terminology
- Avoid ambiguous words like "good," "appropriate," "reasonable"
- Include positive and negative examples when helpful
- Specify measurable criteria where possible


## Output Instructions

Generate a complete prompt template that:
1. **Follows the component structure above**
2. **Is immediately usable** without modification
3. **Includes specific validation criteria**
4. **Optimizes for the stated TEMPLATE_PURPOSE**
5. **Uses clear, unambiguous language**
6. **Incorporates relevant best practices**

Before outputting, verify your template includes:
- [ ] Specific expert role definition
- [ ] Clear [USER_INPUT] placeholder
- [ ] Numbered processing steps (if complex)
- [ ] Exact output format specification
- [ ] Self-validation instructions
- [ ] Measurable success criteria
- [ ] Edge case handling guidance


Deliverable: The tool definition must strictly adhere to the following JSON schema:

<JSON_SCHEMA>
${JSON.stringify(toolSchemaJson, null, 2)}
</JSON_SCHEMA>

Output a JSON object with exactly these fields:
- name: snake_case function name derived from the prompt purpose
- description: Clear, concise description of what the function does (1-2 sentences)
- args: Array of parameter objects, each with name, type, and description
- prompt: Template string with HTML-style tag placeholders in separate blocks

Requirements:
- Use snake_case for function names
- Parameter types should be 'string', 'number', 'boolean', or 'array'
- Descriptions should be clear and professional
- Prompt templates must be in markdown format
- Prompt templates must use HTML-style tags with parameters in separate blocks
- Each parameter should have its own tag block (e.g., <parameter_name>\n{parameter_name}\n</parameter_name>)
- Output valid JSON only, no additional text

Example:
User Prompt: "A tool that converts Fahrenheit to Celsius."
Generated Tool:
{
  "name": "fahrenheit_to_celsius",
  "description": "Converts temperature from Fahrenheit to Celsius.",
  "prompt": "Convert {fahrenheit} degrees Fahrenheit to Celsius.",
  "args": [
    {
      "name": "fahrenheit",
      "description": "The temperature in Fahrenheit.",
      "type": "number"
    }
  ]
}`;

      const { object } = await generateObject({
        model,
        prompt: input.prompt,
        system: systemPrompt.trim(),
        schema: createToolSchema,
      });

      return object;
    }),

  moveTools: protectedProcedure
    .input(toolMoveSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      // Verify user has access to the target project
      const targetProject = await db.project.findUnique({
        where: { id: input.targetProjectId },
        select: { created_by_user_id: true },
      });

      if (!targetProject || targetProject.created_by_user_id !== userId) {
        throw new Error(
          "Unauthorized: Target project not found or not owned by user.",
        );
      }

      // Verify user has access to all tools and they belong to the same original project
      // This is important to prevent moving tools from projects the user doesn't own
      const toolsToMove = await db.tool.findMany({
        where: {
          id: { in: input.toolIds },
        },
        select: { id: true, project_id: true },
      });

      if (toolsToMove.length !== input.toolIds.length) {
        throw new Error("One or more tools not found.");
      }

      // Ensure all tools belong to projects owned by the user
      const projectIdsOfTools = new Set(toolsToMove.map((t) => t.project_id));
      const projectsOwnedByUser = await db.project.findMany({
        where: {
          id: { in: Array.from(projectIdsOfTools) },
          created_by_user_id: userId,
        },
        select: { id: true },
      });

      if (projectsOwnedByUser.length !== projectIdsOfTools.size) {
        throw new Error(
          "Unauthorized: One or more tools belong to projects not owned by the user.",
        );
      }

      // Perform the update in a transaction
      await db.$transaction(
        input.toolIds.map((toolId) =>
          db.tool.update({
            where: { id: toolId },
            data: { project_id: input.targetProjectId },
          }),
        ),
      );

      return { success: true, movedCount: input.toolIds.length };
    }),
});

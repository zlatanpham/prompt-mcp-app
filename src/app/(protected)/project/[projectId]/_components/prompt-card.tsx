import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { XIcon } from "lucide-react";
import type { Prompt } from "@prisma/client";

interface Props {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const PromptCard = (props: Props) => {
  const { prompt, onDelete, onEdit, className } = props;
  const numberOfLines = prompt.content.split("\n").length;

  return (
    <div
      className={clsx(
        "flex-col justify-between rounded-lg border bg-white p-3 hover:border-gray-300",
        "group relative flex h-36 cursor-pointer",
        className,
      )}
      onClick={() => onEdit()}
    >
      <header className="flex items-center justify-between">
        <div className="flex w-full items-center justify-between">
          <span className="line-clamp-1 text-xs font-medium">
            {prompt.name}
          </span>
          <div className="absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              className="h-6 w-6 cursor-pointer rounded-full"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when deleting
                onDelete();
              }}
            >
              <XIcon className="!h-3 !w-3" />
            </Button>
          </div>
        </div>
      </header>
      <div className="mt-2">
        <pre className="line-clamp-2 font-mono text-[10px] whitespace-pre-wrap">
          {numberOfLines} {numberOfLines > 1 ? "lines" : "line"}
        </pre>
      </div>
      <footer className="mt-auto">
        <Badge variant="outline" className="text-[10px] uppercase">
          Text
        </Badge>
      </footer>
    </div>
  );
};

export default PromptCard;

# Project Brief

## Project Name

AI Writer Application

## Core Requirements

- Rename "Prompt" to "Tool" across the application.
- Update database schema:
  - Rename `Prompt` model to `Tool`.
  - Remove `tool_name` field from `Tool` model.
  - Make `name` field unique in `Tool` model.
- Update tRPC routes to reflect the "Tool" model.
- Update React components to reflect the "Tool" model and new naming conventions.

## Goals

- Ensure end-to-end typesafety after schema and route changes.
- Maintain a clean and consistent codebase.
- Provide a functional application with the new "Tool" terminology.

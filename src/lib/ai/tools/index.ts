import { RegisteredTool } from './types';
import { calculatorTool } from './calculator';
import { fileReadTool, fileWriteTool, fileListTool } from './files';
import { webSearchTool, webSearchToolDev } from './web-search';

const isDev = process.env.NODE_ENV === 'development';

export const availableTools: RegisteredTool[] = [
  calculatorTool,
  fileReadTool,
  fileWriteTool,
  fileListTool,
  isDev ? webSearchToolDev : webSearchTool,
];

export const toolDefinitions = availableTools.map((t) => t.definition);

export function getTool(name: string): RegisteredTool | undefined {
  return availableTools.find((t) => t.definition.name === name);
}

export function getToolsByNames(names: string[]): RegisteredTool[] {
  return names.map((n) => getTool(n)).filter((t): t is RegisteredTool => t !== undefined);
}
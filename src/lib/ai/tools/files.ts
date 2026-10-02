import { RegisteredTool, ToolContext, ToolResult } from './types';
import { prisma } from '@/lib/prisma';

const FILE_READ_DEFINITION = {
  name: 'file_read',
  description: 'Read the contents of a file from the workspace.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative path to the file from workspace root' },
    },
    required: ['path'],
  },
};

const FILE_WRITE_DEFINITION = {
  name: 'file_write',
  description: 'Write content to a file in the workspace. Creates directories as needed.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative path to the file from workspace root' },
      content: { type: 'string', description: 'Content to write to the file' },
    },
    required: ['path', 'content'],
  },
};

const FILE_LIST_DEFINITION = {
  name: 'file_list',
  description: 'List files and directories in a given path.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative path to list (default: workspace root)', default: '.' },
    },
  },
};

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || process.cwd();

function resolvePath(relativePath: string): string {
  const path = require('path');
  const resolved = path.resolve(WORKSPACE_ROOT, relativePath);
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error('Path traversal not allowed');
  }
  return resolved;
}

export const fileReadTool: RegisteredTool = {
  definition: FILE_READ_DEFINITION,
  executor: async (args: { path: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const fs = require('fs/promises');
      const fullPath = resolvePath(args.path);
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        success: true,
        result: { path: args.path, content, size: content.length },
        metadata: { type: 'file_read' },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File read failed',
      };
    }
  },
};

export const fileWriteTool: RegisteredTool = {
  definition: FILE_WRITE_DEFINITION,
  executor: async (args: { path: string; content: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const fullPath = resolvePath(args.path);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, args.content, 'utf-8');
      return {
        success: true,
        result: { path: args.path, bytesWritten: Buffer.byteLength(args.content, 'utf-8') },
        metadata: { type: 'file_write' },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File write failed',
      };
    }
  },
};

export const fileListTool: RegisteredTool = {
  definition: FILE_LIST_DEFINITION,
  executor: async (args: { path?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const fullPath = resolvePath(args.path || '.');
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const items = entries.map((entry: any) => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: path.join(args.path || '.', entry.name),
      }));
      return {
        success: true,
        result: { path: args.path || '.', items },
        metadata: { type: 'file_list' },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File list failed',
      };
    }
  },
};
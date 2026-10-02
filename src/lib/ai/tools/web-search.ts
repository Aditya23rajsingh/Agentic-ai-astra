import { RegisteredTool, ToolContext, ToolResult } from './types';

const WEB_SEARCH_DEFINITION = {
  name: 'web_search',
  description: 'Search the web for current information. Use for real-time data, news, prices, or recent events.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query (be specific and detailed)' },
      maxResults: { type: 'number', description: 'Maximum results to return (default: 5)', default: 5 },
    },
    required: ['query'],
  },
};

export const webSearchTool: RegisteredTool = {
  definition: WEB_SEARCH_DEFINITION,
  executor: async (args: { query: string; maxResults?: number }, context: ToolContext): Promise<ToolResult> => {
    try {
      const { query, maxResults = 5 } = args;
      
      // In production, integrate with a real search API (SerpAPI, Bing, Google Custom Search, etc.)
      // For now, return a structured response indicating the tool needs API configuration
      return {
        success: false,
        error: 'Web search requires API configuration. Set up SERP_API_KEY or similar in environment.',
        metadata: { query, maxResults, note: 'Configure a search provider API key to enable this tool' },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web search failed',
      };
    }
  },
};

export const webSearchToolDev: RegisteredTool = {
  definition: WEB_SEARCH_DEFINITION,
  executor: async (args: { query: string; maxResults?: number }, context: ToolContext): Promise<ToolResult> => {
    // Development mock - replace with real implementation
    return {
      success: true,
      result: {
        query: args.query,
        results: [
          { title: `Result for: ${args.query}`, url: 'https://example.com', snippet: 'This is a mock search result. Configure a real search API for production.' },
        ],
        note: 'Mock result - replace with real search API',
      },
      metadata: { mock: true },
    };
  },
};
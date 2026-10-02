import { RegisteredTool, ToolContext, ToolResult } from './types';

const CALCULATOR_DEFINITION = {
  name: 'calculator',
  description: 'Perform mathematical calculations. Supports basic arithmetic, advanced functions, and constants.',
  parameters: {
    type: 'object',
    properties: {
      expression: { type: 'string', description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "sin(pi/2)")' },
    },
    required: ['expression'],
  },
};

const MATH_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
  phi: (1 + Math.sqrt(5)) / 2,
};

const MATH_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  abs: Math.abs,
  acos: Math.acos,
  acosh: Math.acosh,
  asin: Math.asin,
  asinh: Math.asinh,
  atan: Math.atan,
  atan2: Math.atan2,
  atanh: Math.atanh,
  cbrt: Math.cbrt,
  ceil: Math.ceil,
  cos: Math.cos,
  cosh: Math.cosh,
  exp: Math.exp,
  expm1: Math.expm1,
  floor: Math.floor,
  log: Math.log,
  log10: Math.log10,
  log1p: Math.log1p,
  log2: Math.log2,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  random: Math.random,
  round: Math.round,
  sign: Math.sign,
  sin: Math.sin,
  sinh: Math.sinh,
  sqrt: Math.sqrt,
  tan: Math.tan,
  tanh: Math.tanh,
  trunc: Math.trunc,
};

function safeEval(expression: string): number {
  const sanitized = expression
    .replace(/[^0-9+\-*/()., \t\n\r\w]/g, '')
    .replace(/\b(pi|e|tau|phi)\b/g, (match) => String(MATH_CONSTANTS[match.toLowerCase()]));

  const funcNames = Object.keys(MATH_FUNCTIONS).join('|');
  const funcRegex = new RegExp(`\\b(${funcNames})\\s*\\(`, 'g');
  
  try {
    const func = new Function(...Object.keys(MATH_CONSTANTS), ...Object.keys(MATH_FUNCTIONS), `return ${sanitized}`);
    return func(...Object.values(MATH_CONSTANTS), ...Object.values(MATH_FUNCTIONS));
  } catch {
    throw new Error('Invalid mathematical expression');
  }
}

export const calculatorTool: RegisteredTool = {
  definition: CALCULATOR_DEFINITION,
  executor: async (args: { expression: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const { expression } = args;
      const result = safeEval(expression);
      return {
        success: true,
        result: { expression, result },
        metadata: { type: 'calculation' },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      };
    }
  },
};
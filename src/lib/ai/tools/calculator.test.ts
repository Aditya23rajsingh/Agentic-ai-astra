import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatorTool } from '@/lib/ai/tools/calculator';

describe('calculatorTool', () => {
  const mockContext = {
    userId: 'test-user',
    conversationId: 'test-conv',
    taskRunId: 'test-task',
  };

  it('evaluates basic arithmetic', async () => {
    const result = await calculatorTool.executor({ expression: '2 + 2' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.result).toEqual({ expression: '2 + 2', result: 4 });
  });

  it('evaluates complex expressions', async () => {
    const result = await calculatorTool.executor({ expression: '(10 + 5) * 3 - 4 / 2' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.result?.result).toBe(43);
  });

  it('handles math constants', async () => {
    const result = await calculatorTool.executor({ expression: 'pi * 2' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.result?.result).toBeCloseTo(Math.PI * 2);
  });

  it('handles math functions', async () => {
    const result = await calculatorTool.executor({ expression: 'sqrt(16) + sin(pi/2)' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.result?.result).toBeCloseTo(4 + 1);
  });

  it('handles invalid expressions', async () => {
    const result = await calculatorTool.executor({ expression: '2 + + 2' }, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects malicious input', async () => {
    const result = await calculatorTool.executor({ expression: 'require("fs").readFileSync("/etc/passwd")' }, mockContext);
    expect(result.success).toBe(false);
  });
});
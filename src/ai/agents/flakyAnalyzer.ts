export interface BuildSummary {
  runId: string;
  tests: Record<string, string>;
}

export interface FlakyResult {
  counts: { flaky: number; failing: number; total: number };
  flaky: string[];
  summary?: string;
}

export async function analyzeFlaky(
  _prev: BuildSummary,
  _curr: BuildSummary,
  _hasApiKey: boolean,
): Promise<FlakyResult> {
  return {
    counts: { flaky: 0, failing: 0, total: 0 },
    flaky: [],
    summary: 'Stub flaky analyzer — no LLM configured.',
  };
}

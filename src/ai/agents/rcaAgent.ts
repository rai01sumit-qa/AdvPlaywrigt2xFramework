export interface RcaVerdict {
  severity: string;
  priority: string;
  rootCause: string;
  fixes: string[];
}

export async function analyzeFailure(_input: {
  title: string;
  file: string;
  error: string;
  stack?: string;
}): Promise<RcaVerdict> {
  return {
    severity: 'low',
    priority: 'p3',
    rootCause: 'Stub RCA agent — no LLM configured.',
    fixes: [],
  };
}

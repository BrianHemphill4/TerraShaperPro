export interface TestCase {
  name: string;
  url: string;
  actions: TestAction[];
  assertions: TestAssertion[];
  maxRetries?: number;
}

export interface TestAction {
  type: 'click' | 'type' | 'navigate' | 'wait' | 'hover' | 'select';
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface TestAssertion {
  type: 'visible' | 'text' | 'attribute' | 'url' | 'title';
  selector?: string;
  expected?: string;
  attribute?: string;
}

export interface TestResult {
  testName: string;
  status: 'pass' | 'fail';
  attempts: number;
  duration: number;
  failures: FailureDetail[];
  screenshots: Screenshot[];
}

export interface FailureDetail {
  attempt: number;
  timestamp: string;
  error: string;
  assertion?: TestAssertion;
  action?: TestAction;
  screenshot?: string;
}

export interface Screenshot {
  path: string;
  timestamp: string;
  context: string;
}

export interface TestReport {
  startTime: string;
  endTime: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
}
import * as fs from 'fs';
import * as path from 'path';
import { TestCase, TestResult, TestReport, FailureDetail, Screenshot } from './types';

export class PlaywrightTestRunner {
  private screenshotDir: string;
  private reportDir: string;
  
  constructor() {
    this.screenshotDir = path.join(process.cwd(), 'test-screenshots');
    this.reportDir = path.join(process.cwd(), 'test-reports');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.screenshotDir, this.reportDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runTestSuite(testCases: TestCase[]): Promise<TestReport> {
    const startTime = new Date().toISOString();
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runTestCase(testCase);
      results.push(result);
    }

    const endTime = new Date().toISOString();
    const report: TestReport = {
      startTime,
      endTime,
      totalTests: testCases.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      results
    };

    await this.saveReport(report);
    return report;
  }

  private async runTestCase(testCase: TestCase): Promise<TestResult> {
    const maxRetries = testCase.maxRetries || 3;
    const startTime = Date.now();
    const failures: FailureDetail[] = [];
    const screenshots: Screenshot[] = [];
    let attempts = 0;
    let passed = false;

    while (attempts < maxRetries && !passed) {
      attempts++;
      console.log(`Running test: ${testCase.name} (Attempt ${attempts}/${maxRetries})`);
      
      try {
        // Navigate to URL
        await this.navigate(testCase.url);
        
        // Execute actions
        for (const action of testCase.actions) {
          await this.executeAction(action);
        }

        // Run assertions
        for (const assertion of testCase.assertions) {
          await this.runAssertion(assertion);
        }

        passed = true;
        console.log(`✓ Test passed: ${testCase.name}`);
        
        // Take success screenshot
        const successScreenshot = await this.takeScreenshot(
          `${testCase.name}-success-attempt${attempts}`
        );
        screenshots.push({
          path: successScreenshot,
          timestamp: new Date().toISOString(),
          context: 'success'
        });
        
      } catch (error) {
        console.log(`✗ Test failed: ${testCase.name} (Attempt ${attempts})`);
        
        // Capture failure details
        const screenshotPath = await this.takeScreenshot(
          `${testCase.name}-failure-attempt${attempts}`
        );
        
        const failure: FailureDetail = {
          attempt: attempts,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
          screenshot: screenshotPath
        };
        
        failures.push(failure);
        screenshots.push({
          path: screenshotPath,
          timestamp: new Date().toISOString(),
          context: `failure-attempt${attempts}`
        });

        if (attempts < maxRetries) {
          console.log(`Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    const duration = Date.now() - startTime;
    
    return {
      testName: testCase.name,
      status: passed ? 'pass' : 'fail',
      attempts,
      duration,
      failures,
      screenshots
    };
  }

  private async navigate(url: string): Promise<void> {
    // This would use Playwright MCP to navigate
    console.log(`Navigating to: ${url}`);
    // Implementation would call mcp__playwright__browser_navigate
  }

  private async executeAction(action: any): Promise<void> {
    console.log(`Executing action: ${action.type}`);
    // Implementation would use appropriate Playwright MCP actions
  }

  private async runAssertion(assertion: any): Promise<void> {
    console.log(`Running assertion: ${assertion.type}`);
    // Implementation would use Playwright MCP to verify elements
  }

  private async takeScreenshot(name: string): Promise<string> {
    const timestamp = Date.now();
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    console.log(`Taking screenshot: ${filename}`);
    // Implementation would use mcp__playwright__browser_take_screenshot
    
    return filepath;
  }

  private async saveReport(report: TestReport): Promise<void> {
    const timestamp = Date.now();
    const filename = `test-report-${timestamp}.json`;
    const filepath = path.join(this.reportDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`Report saved: ${filepath}`);
    
    // Also save a latest.json for easy access
    const latestPath = path.join(this.reportDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
  }
}
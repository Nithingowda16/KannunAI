import { runUnitTests } from './unitTests';
import { runSecurityTests } from './securityTests';
import { runAccessibilityTests } from './accessibilityTests';
import { runE2EUserJourneyTests } from './e2eUserJourneyTests';

export async function executeFullTestSuite(): Promise<{
  totalPassed: number;
  totalFailed: number;
  allLogs: string[];
}> {
  const unit = runUnitTests();
  const sec = runSecurityTests();
  const a11y = runAccessibilityTests();
  const e2e = await runE2EUserJourneyTests();

  const totalPassed = unit.passed + sec.passed + a11y.passed + e2e.passed;
  const totalFailed = unit.failed + sec.failed + a11y.failed + e2e.failed;
  const allLogs = [...unit.logs, ...sec.logs, ...a11y.logs, ...e2e.logs];

  console.log(`\n=== KANNUNAI AUTOMATED QUALITY-GATE TEST SUITE REPORT ===`);
  console.log(`Total Passed: ${totalPassed} | Total Failed: ${totalFailed}\n`);
  allLogs.forEach((log) => console.log(log));
  console.log(`===========================================================\n`);

  if (totalFailed > 0 && typeof process !== 'undefined') {
    process.exitCode = 1;
  } else if (typeof process !== 'undefined') {
    process.exitCode = 0;
  }

  return { totalPassed, totalFailed, allLogs };
}

// Auto-run if executed directly as entry script
executeFullTestSuite();

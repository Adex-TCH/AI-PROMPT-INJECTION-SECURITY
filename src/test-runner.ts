import { runAllTests } from './tests.js';

const results = runAllTests();
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'}  ${result.name}`);
  console.log(`      expected: ${result.expected}`);
  console.log(`      actual:   ${result.actual}`);
}
const passed = results.filter((result) => result.passed).length;
console.log(`\n${passed}/${results.length} checks passed.`);
if (passed !== results.length) throw new Error('One or more security simulation checks failed.');

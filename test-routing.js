// Test script for verifying language routing
const testUrls = [
  { url: 'http://localhost:3001/', expected: 'Should load az content without /az prefix' },
  { url: 'http://localhost:3001/az', expected: 'Should redirect to / (removing /az)' },
  { url: 'http://localhost:3001/az/credits', expected: 'Should redirect to /credits' },
  { url: 'http://localhost:3001/en', expected: 'Should keep /en prefix' },
  { url: 'http://localhost:3001/en/credits', expected: 'Should keep /en/credits' },
  { url: 'http://localhost:3001/ru', expected: 'Should keep /ru prefix' },
  { url: 'http://localhost:3001/ru/credits', expected: 'Should keep /ru/credits' },
  { url: 'http://localhost:3001/credits', expected: 'Should load az content at /credits' },
  { url: 'http://localhost:3001/about', expected: 'Should load az content at /about' },
];

console.log('Testing language routing configuration:\n');
testUrls.forEach(test => {
  console.log(`URL: ${test.url}`);
  console.log(`Expected: ${test.expected}\n`);
});

console.log('\nTo verify:');
console.log('1. Open browser and check each URL');
console.log('2. Verify language switcher works correctly');
console.log('3. Check that navigation links work as expected');
const fs = require('fs')

// Read Jest JSON output from a file
const jestOutput = JSON.parse(fs.readFileSync('./jest-results.json', 'utf8'))

// Extract and display failed tests
const failedTests = jestOutput.testResults
  .flatMap(result =>
    result.assertionResults
      .filter(assertion => assertion.status === 'failed')
      .map(assertion => ({
        name: assertion.fullName || assertion.title,
        path: result.name,
        message: assertion.failureMessages.join('\n')
      }))
  )

console.info('Failed Tests Summary:')
console.info('====================')
failedTests.forEach((test, index) => {
  console.info(`${index + 1}. ${test.name}`)
  console.info(`   File: ${test.path}`)
  console.info('')
})

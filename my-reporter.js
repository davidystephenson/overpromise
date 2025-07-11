const reporter = function (options) {
  const { issues } = options

  for (const entry of Object.entries(issues)) {
    const [category, records] = entry
    const _private = category.startsWith('_')
    if (_private) continue
    if (records instanceof Set) {
      if (records.size === 0) continue
      const files = [...records]
      const message = `knip ${category}: ${files.length} files`
      console.error(message)
      for (const file of files) {
        if (typeof file === 'string') {
          console.info(file)
        } else {
          console.info(file.filePath)
        }
      }
    } else {
      const recordEntries = Object.entries(records)
      const issueCount = recordEntries.reduce((acc, [file, fileIssues]) => acc + Object.values(fileIssues).length, 0)
      if (issueCount === 0) continue
      const message = `knip ${category}: ${recordEntries.length} files, ${issueCount} issues`
      console.error(message)
      for (const [file, fileIssues] of recordEntries) {
        for (const issue of Object.values(fileIssues)) {
          console.info(`${file}:${issue.line}: ${issue.symbol}`)
        }
      }
    }
  }
}

export default reporter

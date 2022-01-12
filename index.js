const { resolve } = require('path')
const fs = require('fs-extra')

const tStart = Date.now()
const rootPath = process.cwd()
const [grepArg] = process.argv.slice(2)
const regex = new RegExp(grepArg.replace(/(\.|\/)/, $m => `\\${$m}`))
const grep = regex.test.bind(regex)

const isIgnored = file => /\.(png|jpg|jpeg|svg|ico|git)$/.test(file)

const checkMatch = path => fs.readFile(path, 'utf8').then(content => [path, grep(content)])

const isDir = (...pathSegments) => {
  const path = resolve(...pathSegments)
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory()
}

const isSymLink = (path, doc) => fs.lstat(resolve(path, doc)).then(stats => [doc, stats.isSymbolicLink()])

const docTriage = (path, documents) =>
  Promise.all(documents.map(doc => isSymLink(path, doc)))
    .then(linkResults => linkResults.filter(([doc, isLink]) => !isLink && !isIgnored(doc)).map(([doc]) => doc))
    .then(docs =>
      docs.reduce(
        ([files, dirs], doc) => {
          if (isDir(path, doc)) return [files, [...dirs, doc]]
          return [[...files, doc], dirs]
        },
        [[], []]
      )
    )

const walkDirs = path =>
  fs
    .readdir(path)
    .then(documents =>
      docTriage(path, documents).then(([files, dirs]) =>
        Promise.all(files.map(doc => resolve(path, doc)).map(checkMatch)).then(fileResults =>
          Promise.all(dirs.map(doc => resolve(path, doc)).map(walkDirs)).then(dirResults => [
            ...fileResults,
            ...dirResults.flat()
          ])
        )
      )
    )

walkDirs(rootPath)
  .then(results => [
    results.reduce((matchedFiles, [path, match]) => (match ? [...matchedFiles, path] : matchedFiles), []),
    results.length
  ])
  .then(([matchedFiles, totalFiles]) => {
    const tEnd = (Date.now() - tStart) * 0.001
    const { length } = matchedFiles
    console.log(`${totalFiles} files searched in ${tEnd.toFixed(2)} seconds`)
    console.log(`${length || 'No'} file${!length || length > 1 ? 's' : ''} found with matching term\n--`)

    if (length) console.log(matchedFiles.map(file => file.replace(`${rootPath}/`, '')).join('\n'))
  })

#! /usr/bin/env node

const fs = require('fs')
const argv = process.argv

/**
 * Example:
 * node generator.js --filename demo --column 'column 1' string 1000 --column 'column 2' number 500
 */

// Record performance (TODO: using nodejs performance API when it's stable)
const startTimestamp = Date.now(),
      clearIntervalKey = setInterval(() => process.stdout.write('.'), 500)

// Build paramMap
// Store the example process.argv as
// {
//   filename: [
//     ['demo']
//   ],
//   column: [
//     ['column 1', '1000', 'string'],
//     ['column 2', '500', 'number']
//   ]
// }
let paramMap = {}
const paramRegExp = /^--(\w+)$/
argv.reduce((group, arg) => {
  let argMatched = arg.match(paramRegExp)

  if (argMatched) {
    // Find a new param
    paramMap[argMatched[1]] = paramMap[argMatched[1]] || []
    group = []
    paramMap[argMatched[1]].push(group)
  }
  else {
    group.push(arg)
  }

  return group
}, [])

/**
 * Get param by the given param key
 * 
 * @param {String} paramKey 
 */
const getParamGroup = (paramKey) => {
  if (paramMap[paramKey]) {
    return paramMap[paramKey]
  }
  
  return null
}

const columns = getParamGroup('column') || [],
      columnCount = columns.length,
      rowCount = Math.max.apply(null, [0].concat(columns.map(column => parseInt(column[2] || 0, 10)))),
      seed = getParamGroup('seed') ? getParamGroup('seed')[0][0] : 1

let filename = (getParamGroup('filename') && getParamGroup('filename')[0][0]) || startTimestamp.toString()
console.log(`Generating dataset ${filename} with ${columnCount} columns and ${rowCount} rows.`)

// Generate data
/**
 * Generate pseudo random data like '0.123456789'
 *  
 * @param {Integer} index 
 */
const seedRandom = (index) => `0.${Math.sin(seed + index).toString().substr(6)}`

/**
 * Get array of random data based on given data type and data cound
 * 
 * @param {String} dataType 
 * @param {String} dataCount 
 */
const getRandomDataByTypeAndCount = (dataType, dataCount) => {
  let result = []

  switch (dataType) {
    case 'string': 
      while (dataCount--) result.push(seedRandom(dataCount))
      break

    case 'number': 
      while (dataCount--) result.push(seedRandom(dataCount) * 7)
      break

    case 'boolean':
      while (dataCount--) result.push(seedRandom(dataCount) * 1 > 0.5)
      break

    default:
      while (dataCount--) result.push(seedRandom(dataCount))
  }

  return result
}

let data = []
columns.forEach((column, columnIndex) => {
  const [columnHeader = `column ${columnIndex}`, dataCount = '0', dataType = 'string'] = column
  let columnData = [columnHeader]

  columnData = columnData.concat(getRandomDataByTypeAndCount(dataType, parseInt(dataCount, 10)))
  data.push(columnData)
})

// Zip the data (matrix rotation)
let zippedData = []
data.forEach((columnData, columnDataIndex) => {
  columnData.forEach((d, dIndex) => {
    zippedData[dIndex] = zippedData[dIndex] || []
    zippedData[dIndex][columnDataIndex] = d
  })

  // Make up the missed rows
  let missed = rowCount - (columnData.length - 1)
  while (missed > 0) {
    let missedIndex = columnData.length + missed - 1
    zippedData[missedIndex] = zippedData[missedIndex] || []
    zippedData[missedIndex][columnDataIndex] = null
    missed--
  }
})

// Try to write file. Will append timestamp while file exists
while (fs.existsSync(`${filename}.csv`)) {
  console.log('File exists! Will append timestamp to the generated file.')
  filename += `-${Date.now()}`
}

fs.writeFile(`${filename}.csv`, zippedData.join('\n'), (err) => {
  clearInterval(clearIntervalKey)

  if (err) {
    throw err
  }

  console.log(`\nFile generated at current directory in ${Date.now() - startTimestamp} ms.`)
})
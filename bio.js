const { argv } = require('node:process')
const fs = require('fs')
const csvjson = require('csvjson')

class Bio {
  constructor(name, sex, age, height, weight) {
    this.name = name
    this.sex = sex
    this.age = age
    this.height = height
    this.weight = weight
  }
}

function create(newBio, csvDataList) {
  const upperCasedSex = newBio.sex.toUpperCase()
  if (csvDataList.has(newBio.name)) {
    return null
  } return new Bio(newBio.name, upperCasedSex, newBio.age, newBio.height, newBio.weight)
}

function read(name, csvDataList) {
  return csvDataList.get(name)
}

function update(name, [...restData], csvDataList) {
  const [sex, ...bioData] = restData
  const bioMap = csvDataList
  if (bioMap.has(name)) {
    bioMap.set(name, new Bio(name, sex.toUpperCase(), ...bioData))
    return bioMap
  } return null
}

function deleteBio(name, csvDataList) {
  const map = csvDataList
  if (map.has(name)) {
    map.delete(name)
    return map
  } return null
}

function readCSV(filePath) {
  try {
    const csvData = fs.readFileSync(filePath, { encoding: 'utf8' })
    const bioArray = csvjson.toArray(csvData).splice(1)
    const bioMap = new Map()

    for (let i = 0; i < bioArray.length; i += 1) {
      const [name, ...restData] = bioArray[i]
      bioMap.set(name, new Bio(name, ...restData))
    } return bioMap
  } catch (err) {
    return null
  }
}

function writeCSV(filePath, csvDataList) {
  const options = {
    delimiter: ',',
    headers: 'none',
  }

  const bioArray = []
  csvDataList.forEach((value) => bioArray.push(value))

  let formattedCSV = '"name",\t\t"sex",\t\t"age",\t\t"height",\t\t"weight"\n'

  const rawCSV = csvjson.toCSV(bioArray, options)
  const csvSplit = rawCSV.split('\n')
  for (let i = 1; i < csvSplit.length; i += 1) {
    const [name, sex, age, height, weight] = csvSplit[i].split(',')
    formattedCSV += `"${name}",\t\t"${sex}",\t\t${age},\t\t\t${height},\t\t\t${weight}\n`
  }

  try {
    fs.writeFileSync(filePath, formattedCSV)
    return true
  } catch (err) {
    return false
  }
}

function validateCreateUpdate(sex, age, height, weight, argLength) {
  if (argLength !== 8) { return 'Invalid Argument Count.' }
  if (!'FfMm'.includes(sex)) { return 'Incorrect Sex.' }
  if (age <= 0) { return 'Invalid Age' }
  if (typeof age !== 'number' && isNaN(age)) { return 'Age Not A Number.' }
  if (age > 0 && age < 18) { return 'Minors Are Not Permitted.' }
  if (height <= 0) { return 'Invalid Height.' }
  if (typeof height !== 'number' && isNaN(height)) { return 'Height Not A Number.' }
  if (weight <= 0) { return 'Invalid Weight' }
  if (typeof weight !== 'number' && isNaN(weight)) { return 'Weight Not A Number.' }
  return null
}

function formatName(name) {
  if (typeof name === 'string') {
    return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase()
  } return null
}

const [, , command, name, ...restArgs] = argv
const titleCasedName = formatName(name)
if (titleCasedName === null) {
  console.log('Invalid Argument: Provide Name.')
}

const filePath = 'biostats.csv'
const csvDataList = readCSV(filePath)
if (csvDataList === null) {
  console.log('Unable to Retrieve CSV Data.')
}

if (csvDataList != null && command != null && titleCasedName != null) {
  switch (command.toLowerCase()) {
    case '-c': {
      const checkValues = validateCreateUpdate(...restArgs, argv.length)
      if (checkValues != null) {
        console.log(checkValues)
      } else if (create(new Bio(titleCasedName, ...restArgs), csvDataList) == null) {
        console.log('The Record Already Exists.')
      } else {
        const bioRecord = create(new Bio(titleCasedName, ...restArgs), csvDataList)
        const updatedCsvDataList = csvDataList.set(titleCasedName, bioRecord)
        if (writeCSV(filePath, updatedCsvDataList) !== true) {
          console.log('There Was An Error In Updating the CSV File.')
        }
      }
      break
    }

    case '-r': {
      if (argv.length === 4) {
        const record = read(titleCasedName, csvDataList)
        if (record === undefined) {
          console.log('Record Does Not Exist.')
        } else {
          const sexFull = record.sex === 'M' ? 'Male' : 'Female'
          const printRecord = `
          Bio Information

          Name:                   ${record.name}
          Sex:                    ${sexFull}
          Age:                    ${record.age}
          Height in Inches:       ${Math.round(record.height * 100) / 100}
          Height in Centimeters:  ${Math.round((record.height * 2.54) * 100) / 100}
          Weight in Pounds:       ${Math.round(record.weight * 100) / 100}
          Weight in Kilos:        ${Math.round((record.weight / 2.205) * 100) / 100}
          `
          console.log(printRecord)
        }
      } else {
        console.log('Invalid Argument Count.')
      }

      break
    }
    case '-u': {
      const checkValues = validateCreateUpdate(...restArgs, argv.length)
      if (checkValues != null) {
        console.log(checkValues)
      } else {
        const updatedCsvDataList = update(titleCasedName, [...restArgs], csvDataList)
        if (updatedCsvDataList === null) {
          console.log('Record Does Not Exist.')
        } else {
          writeCSV(filePath, updatedCsvDataList)
        }
      }
      break
    }

    case '-d': {
      if (argv.length === 4) {
        const updatedMap = deleteBio(titleCasedName, csvDataList)
        if (updatedMap === null) {
          console.log('Record Does Not Exist.')
        } else {
          writeCSV(filePath, updatedMap)
        }
      } else {
        console.log('Please Input Only 2 Arguments')
      }
      break
    }

    default:
      console.log('Please Provide An Appropriate Command Flag.')
      break
  }
}

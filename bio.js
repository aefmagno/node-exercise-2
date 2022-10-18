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

  create(newBio, csvDataList) {
    const titleCasedName = newBio.name.charAt(0).toUpperCase() + newBio.name.substr(1).toLowerCase()
    const upperCasedSex = newBio.sex.toUpperCase()
    const UpperCasedName = newBio.name.toUpperCase()
    const bioRecord = csvDataList.find((record) => record.name.toUpperCase() === UpperCasedName)

    if (bioRecord === undefined) {
      return new Bio(titleCasedName, upperCasedSex, newBio.age, newBio.height, newBio.weight)
    } return null
  }

  update(name, [...restData], csvDataList) {
    const titleCasedName = name.charAt(0).toUpperCase() + name.substr(1).toLowerCase()
    const [sex, ...bioData] = restData
    const updatedCsvDataList = csvDataList
    const UpperCasedName = name.toUpperCase()
    const find = csvDataList.find((record) => record.name.toUpperCase() === UpperCasedName)
    const index = csvDataList.indexOf(find)

    if (index === -1) {
      return null
    } updatedCsvDataList[index] = new Bio(titleCasedName, sex.toUpperCase(), ...bioData)
    return updatedCsvDataList
  }

  read(name, csvDataList) {
    const upperCasedName = name.toUpperCase()
    const bioRecord = csvDataList.find((record) => record.name.toUpperCase() === upperCasedName)

    if (bioRecord === undefined) {
      return null
    } return bioRecord
  }

  delete(name, csvDataList) {
    const upperCasedName = name.toUpperCase()
    const bioRecord = csvDataList.find((record) => record.name.toUpperCase() === upperCasedName)

    if (bioRecord === undefined) {
      return null
    } return csvDataList.filter((record) => record.name.toUpperCase() !== upperCasedName)
  }

  readCSV(filePath) {
    try {
      const csvData = fs.readFileSync(filePath, { encoding: 'utf8' })
      const [, ...csvDataArray] = csvjson.toArray(csvData)

      return csvDataArray.map(
        ([name, sex, ...element]) => new Bio(name, sex, ...element),
      )
    } catch (err) {
      return null
    }
  }

  writeCSV(filePath, csvDataList) {
    const options = {
      delimiter: ',',
      headers: 'key',
    }

    const rawCSV = csvjson.toCSV(csvDataList, options)
    const csvSplit = rawCSV.split('\n')
    let formattedCSV = '"name",\t\t"sex",\t\t"age",\t\t"height",\t\t"weight"\n'

    for (let i = 1; i < csvSplit.length; i += 1) {
      const [name, sex, age, height, weight] = csvSplit[i].split(',')
      formattedCSV += `"${name}",\t\t"${sex}",\t\t${age},\t\t\t${height},\t\t\t\t${weight}\n`
    }
    try {
      fs.writeFileSync(filePath, formattedCSV)
      return true
    } catch (err) {
      return false
    }
  }
}

function recordValueValidation(sex, age, height, weight, argLength) {
  if (argLength !== 8) { return 'Invalid Argument Count.' }
  if (!'FfMm'.includes(sex)) { return 'Incorrect Sex.' }
  if (typeof age !== 'number' && isNaN(age)) { return 'Age Not A Number.' }
  if (age > 0 && age < 18) { return 'Minors Are Not Permitted.' }
  if (typeof height !== 'number' && isNaN(height)) { return 'Height Not A Number.' }
  if (typeof weight !== 'number' && isNaN(weight)) { return 'Weight Not A Number.' }
  return null
}

const [, , command, name, ...restArgs] = argv

const bio = new Bio()

const filePath = 'biostats.csv'
const csvDataList = bio.readCSV(filePath)

if (csvDataList != null && command != null) {
  switch (command.toLowerCase()) {
    case '-c': {
      const checkValues = recordValueValidation(...restArgs, argv.length)
      if (checkValues != null) {
        console.log(checkValues)
      } else if (bio.create(new Bio(name, ...restArgs), csvDataList) == null) {
        console.log('The Record Already Exists.')
      } else {
        const bioRecord = bio.create(new Bio(name, ...restArgs), csvDataList)
        const updatedCsvDataList = [...csvDataList, bioRecord]
        if (bio.writeCSV(filePath, updatedCsvDataList) !== true) {
          console.log('There Was An Error In Updating the CSV File.')
        }
      }
      break
    }

    case '-r': {
      if (argv.length === 4) {
        const record = bio.read(name, csvDataList)
        if (record === null) {
          console.log('Record Does Not Exist.')
        } else {
          const sexFull = record.sex === 'M' ? 'male' : 'female'
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
      const checkValues = recordValueValidation(...restArgs, argv.length)
      if (checkValues != null) {
        console.log(checkValues)
      } else {
        const updatedCsvDataList = bio.update(name, [...restArgs], csvDataList)
        if (updatedCsvDataList === null) {
          console.log('Record Does Not Exist.')
        } else {
          bio.writeCSV(filePath, updatedCsvDataList)
        }
      }
      break
    }

    case '-d': {
      if (argv.length === 4) {
        const [, , , bioName] = argv
        if (bio.delete(bioName, csvDataList) == null) {
          console.log('Record Does Not Exist.')
        } else {
          bio.writeCSV(filePath, bio.delete(bioName, csvDataList))
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

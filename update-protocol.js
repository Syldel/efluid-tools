import btoa from 'btoa'
import { dirname } from 'path'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import yauzl from 'yauzl'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({path: path.join(__dirname, '.env')})

let username = ''
let password = ''
let relativePath = ''
let pomXmlPath = `${relativePath}pom.xml`
let tmpJarPath = `${relativePath}target/protocol.jar`
let openApiPath = `${relativePath}target/tmp/protocol/META-INF/openapi.json`
let artifactUrl = 'https://eartifact.efluid.uem.lan/artifactory/libs-snapshot/com/efluid/efluid-mapefluid-protocol'

const coloredText = (color, text) => {
  let prefix = ''
  switch (color) {
    case 'FgRed':
      prefix = '\x1b[31m'
      break;
    case 'FgGreen':
      prefix = '\x1b[32m'
      break;
    case 'FgYellow':
      prefix = '\x1b[33m'
      break;
    case 'FgBlue':
      prefix = '\x1b[34m'
      break;
    case 'FgMagenta':
      prefix = '\x1b[35m'
      break;
    case 'FgCyan':
      prefix = '\x1b[36m'
      break;
    default:
      // 'FgWhite'
      prefix = '\x1b[37m'
  }
  const suffix = '\x1b[0m'
  return `${prefix}${text}${suffix}`
}

const coloredLog = (color, text) => {
  console.log(coloredText(color, text))
}

const httpsFetch = async (url) => {
  console.log(`fetch ${url}`)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      redirect: 'follow',
      agent: null,
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      },
      timeout: 5000
    })
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1
    // console.log('fetch response', response.status, response.statusText)
    return response
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1
    coloredLog('FgRed', 'fetch error: ' + error)
  }
}

const recordFile = async (res, destPath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destPath)
    res.body.on('error', reject)
    fileStream.on('finish', resolve)
    res.body.pipe(fileStream)
  })
}

const unzip = async (srcPath, unzipPath) => {
  // console.log('unzip', srcPath)
  return new Promise((resolve, reject) => {
    yauzl.open(srcPath, {lazyEntries: true}, (err, zipfile) => {
      if (err) throw err
      zipfile.readEntry()
      zipfile.on('entry', (entry) => {
        // console.log('entry', entry.fileName)

        if (/openapi\.json$/.test(entry.fileName)) {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) throw err
            readStream.on('end', () => {
              // zipfile.readEntry()
              resolve()
            })
            readStream.pipe(fs.createWriteStream(unzipPath))
          })
        } else {
          zipfile.readEntry()
        }
      })
      zipfile.on('end', () => {
        console.log('unzip end')
        resolve()
      })
    })
  })
}

const readFile = async (filepath) => {
  return await fs.promises.readFile(filepath, {encoding: 'utf8'})
}

const readPomXmlFile = async () => {
  let xmlData
  try {
    xmlData = await readFile(pomXmlPath)
  } catch (err) {
    console.log(err)
    return null
  }
  const regexp = /<parent[^ ]*>[^ ]*<version[^ ]*>[ ]*([^ <]*)[ ]*<\/version[^ ]*>[^]*<\/parent[^ ]*>/
  const regexResult = xmlData.match(regexp)
  return regexResult.length >= 2 ? regexResult[1] : null
}

const getArtifactPage = async () => {
  const response = await httpsFetch(artifactUrl)
  if (!response) {
    coloredLog('FgRed', 'artefact page not found!')
    return null
  }
  return await response.text()
}

const extractVersions = (pageData, pomXmlVersion) => {
  const regexp = />[ ]*([^ </]*)[/ ]*<[a\s/>]*([\w-]* [0-9:]*)/g
  const version = pomXmlVersion.replace('-SNAPSHOT', '')
  console.log(
    'Version: ' +
    coloredText('FgYellow', version)
  )
  const goodVersions = []
  let match
  do {
    match = regexp.exec(pageData)
    if (match && match.length > 1 && match[1].includes(version)) {
      goodVersions.push({version: match[1], date: new Date(match[2])})
    }
  } while (match)
  goodVersions.sort((obj1, obj2) => obj2.date.getTime() - obj1.date.getTime())
  console.log(
    'Version la plus récente: ' +
    coloredText('FgYellow', goodVersions[0].date.toLocaleString())
  )
  return goodVersions[0].version
}

const lookForJarLink = async () => {
  const pomXmlVersion = await readPomXmlFile()
  console.log('pom.xml parent snapshot version:', pomXmlVersion)

  if (pomXmlVersion) {
    const artifactPageData = await getArtifactPage()
    if (artifactPageData) {
      if (JSON.parse(artifactPageData).errors) {
        console.log(artifactPageData)
        return
      }
      const lastVersion = extractVersions(artifactPageData, pomXmlVersion)
      if (lastVersion) {
        return `${artifactUrl}/${lastVersion}/efluid-mapefluid-protocol-${lastVersion}.jar`
      }
    }
  }
  return
}

const downloadAndUnzipJar = async (url) => {
  const response = await httpsFetch(url)

  await recordFile(response, tmpJarPath)
  coloredLog('FgGreen', `download to ${tmpJarPath} OK`)

  await unzip(tmpJarPath, openApiPath)
  coloredLog('FgGreen', `unzip ${tmpJarPath} to ${openApiPath} OK`)
}

const getEnv = () => {
  if (
    !process.env.EFLUID_USERNAME ||
    !process.env.EFLUID_PASSWORD
  ) {
    console.log('Define the .env file!')
    return
  }

  username = process.env.EFLUID_USERNAME ? process.env.EFLUID_USERNAME : username
  password = process.env.EFLUID_PASSWORD ? process.env.EFLUID_PASSWORD : password
  relativePath = process.env.RELATIVE_PATH ? process.env.RELATIVE_PATH : relativePath
  pomXmlPath = process.env.POM_XML_PATH ? `${relativePath}${process.env.POM_XML_PATH}` : pomXmlPath
  tmpJarPath = process.env.TMP_JAR_PATH ? `${relativePath}${process.env.TMP_JAR_PATH}` : tmpJarPath
  openApiPath = process.env.OPEN_API_PATH ? `${relativePath}${process.env.OPEN_API_PATH}` : openApiPath
  artifactUrl = process.env.ARTIFACT_URL ? process.env.ARTIFACT_URL : artifactUrl
}

const init = async () => {
  getEnv()
  if (username?.length === 0 || password?.length === 0) {
    console.log('Define login!')
    return
  }

  const lastVersionUrl = await lookForJarLink()
  if (lastVersionUrl) {
    await downloadAndUnzipJar(lastVersionUrl)
    coloredLog('FgGreen', 'openapi.json file successfully updated!\n')
  }
}

init()
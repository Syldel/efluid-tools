import btoa from 'btoa'
import fetch from 'node-fetch'
import fs from 'fs'
import yauzl from 'yauzl'

const username = ''
const password = ''
const relativePath = '../efluid/mapefluid/frontend/'
const pomXmlPath = `${relativePath}pom.xml`
const tmpJarPath = `${relativePath}target/protocol.jar`
const openApiPath = `${relativePath}target/tmp/protocol/META-INF/openapi.json`
const artifactUrl = 'https://eartifact.efluid.uem.lan/artifactory/libs-snapshot/com/efluid/efluid-mapefluid-protocol'

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
    console.log('fetch error', error)
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
    console.log('artefact page not found!')
    return null
  }
  return await response.text()
}

const extractVersions = (pageData, pomXmlVersion) => {
  const regexp = />[ ]*([^ </]*)[/ ]*<[a\s/>]*([\w-]* [0-9:]*)/g
  const version = pomXmlVersion.replace('-SNAPSHOT', '')
  const goodVersions = []
  let match
  do {
    match = regexp.exec(pageData)
    if (match && match.length > 1 && match[1].includes(version)) {
      goodVersions.push({version: match[1], date: new Date(match[2])})
    }
  } while (match)
  goodVersions.sort((obj1, obj2) => obj2.date.getTime() - obj1.date.getTime())
  return goodVersions[0].version
}

const lookForJarLink = async () => {
  const pomXmlVersion = await readPomXmlFile()
  console.log('pom.xml parent snapshot version:', pomXmlVersion)

  if (pomXmlVersion) {
    const artifactPageData = await getArtifactPage()
    if (artifactPageData) {
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
  console.log(`download to ${tmpJarPath} OK`)

  await unzip(tmpJarPath, openApiPath)
  console.log(`unzip ${tmpJarPath} to ${openApiPath} OK`)
}

const init = async () => {
  if (username?.length === 0 || password?.length === 0) {
    console.log('Define login!')
    return
  }

  const lastVersionUrl = await lookForJarLink()
  if (lastVersionUrl) {
    await downloadAndUnzipJar(lastVersionUrl)
  }
}

init()

# Efluid tools

### Requirements

You need to have node

### 1. Installation

Install required node packages

```
npm install
```

### 2. Create a ".env" file (at the root) with theses values :

Set your username and password

```
EFLUID_USERNAME = ""
EFLUID_PASSWORD = ""
RELATIVE_PATH = "../efluid/mapefluid/frontend/"
POM_XML_PATH = "pom.xml"
TMP_JAR_PATH = "target/protocol.jar"
OPEN_API_PATH = "target/tmp/protocol/META-INF/openapi.json"
ARTIFACT_URL = "https://eartifact.efluid.uem.lan/artifactory/libs-snapshot/com/efluid/efluid-mapefluid-protocol"
```

### 4. Symlink

```
npm link
```

Now you can directly use "etools" command from the other projects

(If you work on the "bin" system, maybe you should unlink and link again)

### 3. Using : Update the protocol

```
npm start
```

Or

```
npm run update
```

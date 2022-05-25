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
RELATIVE_PATH = ""
POM_XML_PATH = "pom.xml"
TMP_JAR_PATH = "target/protocol.jar"
OPEN_API_PATH = "target/tmp/protocol/META-INF/openapi.json"
ARTIFACT_URL = "https://******/******/******-protocol"
```

### 3. Symlink

```
npm link
```

### 4. How to use

From everywhere, you can do :

```
etools
```

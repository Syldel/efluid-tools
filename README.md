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

### 5. VSCode settings

Look "settings.json" file example

### 6. Define your copy.sh PATHS

Create copy-paths.sh file and set :
Define your PATHS

```
#!/usr/bin/env bash

root_path="/Users/----/workspace/----"

# COMPOSANTS

archi_composants_path="/archi/javascript/projets/packages/composants/base/src/main/js"
mapefluid_composants_path="/efluid/mapefluid/frontend/node_modules/@efluid/composant/src/main/js"

# FICHE

archi_fiche_path="/archi/javascript/projets/packages/core/fiche/src/main/js"
mapefluid_fiche_path="/efluid/mapefluid/frontend/node_modules/@efluid/fiche/src/main/js"

# OUTIL

archi_outil_path="/archi/javascript/projets/packages/core/outil/src/main/js"
mapefluid_outil_path="/efluid/mapefluid/frontend/node_modules/@efluid/outil/src/main/js"

```

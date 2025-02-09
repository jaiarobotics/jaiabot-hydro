#!/bin/bash

# Where is your package.json?
PACKAGE_JSON_DIR=$1

if [ -z "${PACKAGE_JSON_DIR}" ]; then
    PACKAGE_JSON_DIR="."
fi

echo 🟢 Installing npm dependencies in ${PACKAGE_JSON_DIR}

pushd ${PACKAGE_JSON_DIR} > /dev/null
    # Shut up unless there's an error!
    npm install --no-audit --no-progress --silent || npm install --no-audit --no-progress --quiet
popd > /dev/null

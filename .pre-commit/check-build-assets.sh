#!/bin/bash

npm run build

if [[ `git diff readthedocsext/` ]]
then
    echo "ERROR: assets are out of date. Make sure to run 'npm run build' on your branch."
    exit 1
fi

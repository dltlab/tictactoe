#!/usr/bin/env bash

echo "Stopping the testrpc ethereum node"
pgrep -f "node_modules/.bin/testrpc" | xargs kill -9

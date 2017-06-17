#!/usr/bin/env bash
rm -rf ./build
truffle migrate 
npm run build
truffle serve

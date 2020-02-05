#!/usr/bin/env node
'use strict';
console.log(JSON.stringify(require('../lib').generate(process.argv.slice(2))));

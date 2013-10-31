#!/usr/bin/env node

var config = require('../config.json'),
    lib = require('../lib')(config);

lib.cleanup(console.log);
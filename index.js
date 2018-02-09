#! /usr/bin/env node

const path = require('path');
const colors = require('colors');
const { parse, showHelp } = require('./src/js/commandLine');

const config = parse();
if (config.error) {
    console.error(colors.red(config.error));
    process.exit(1);
}

require(path.join(__dirname, 'src/main'));

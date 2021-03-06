#!/usr/bin/env node

const program = require('commander'); // npm i commander -D
const config = require('../package.json');
program
  .version(config.version, '-v, --version')
  .usage('<command> [项目名称]')
  .command('init', 'init project')
  // .command('update', 'update project from newest template')
  .parse(process.argv);

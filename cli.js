#!/usr/bin/env node
const yargs = require('yargs')
const path = require('path')
const exportData = require('./lib/export')

const runExport = async argv => {
  if (argv.dir === null) {
    argv.dir = path.join(__dirname, argv.org)
  }
  mkdirp.sync(argv.dir)
  exportData(argv)
}

const runStatus = async argv => {
  console.log(await exportData.checkMigrationStatus(argv.org))
}

const runCSV = async arg => {
  if (argv.dir === null) {
    argv.dir = path.join(__dirname, argv.org)
  }
  mkdirp.sync(argv.dir)
  exportData(argv)
}

const args = yargs
.command('pull [org]', 'export org data', (yargs) => {
  yargs.positional('org', {
    describe: 'Name of the org you want to pull',
    required: true
  })
  .option('dir', {
    describe: 'Output directory, defaults to org name',
    alias: 'd',
    default: null
  })
}, runExport)
.command('status [org]', 'get status information on org migrations', (yargs) => {
  yargs.positional('org', {
    describe: 'Name of the org you want to check',
    required: true
  })
}, runStatus)
.command('metrics [inputDir]', 'output csv files for org metrics', (yargs) => {
  yargs.positional('input', {
    describe: 'Name of the directory of exported migration tarballs',
    required: true
  })
  .option('dir', {
    describe: 'Output directory, defaults to ${inputDir}_metrics',
    alias: 'd',
    default: null
  })
}, runCSV)
.option('verbose', {
  describe: 'Verbose output mode',
  alias: 'v',
  default: false
})
.scriptName("github-org-metrics")
.argv

if (!args._.length) {
  yargs.showHelp()
}


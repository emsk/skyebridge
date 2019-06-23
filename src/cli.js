#!/usr/bin/env node
'use strict';

const program = require('commander');
const ora = require('ora');
const pkg = require('../package.json');
const Generator = require('./generator');

if (process.argv.length === 2) {
  process.argv.push('--help');
}

program
  .name('skyebridge')
  .version(pkg.version, '-v, --version')
  .option('-i, --input <input>', 'input file path (JSON in which a flow is defined)')
  .option('-o, --output <output>', 'output file path (HTML in which a diagram is drawn)')
  .option('-t, --title <title>', 'content of <title></title> in the HTML', 'Flow Diagram')
  .option('-m, --minify', 'minify the HTML')
  .action(async cmd => {
    const spinner = ora({text: 'Generating diagram', stream: process.stdout}).start();

    try {
      const generator = new Generator(cmd);
      generator.validateCommandOptions();

      await generator.readJSON();
      generator.validateRawData();

      generator.parseJSON();
      generator.validateParsedData();

      await generator.generateHTML();

      await generator.minifyHTML();

      await generator.writeHTML();
    } catch (error) {
      spinner.stream = process.stderr;
      spinner.fail(error.message);
      process.exit(1);
    }

    spinner.succeed('Done');
    process.exit(0);
  })
  .parse(process.argv);

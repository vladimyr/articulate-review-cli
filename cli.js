#!/usr/bin/env node

'use strict';

const { Section } = require('./lib/progress');
const createZipStream = require('.');
const fs = require('fs');
const Gauge = require('gauge');
const green = require('ansi-green');
const red = require('ansi-red');
const meow = require('meow');
const path = require('path');
const pkg = require('./package.json');

const help = `
Usage
  $ ${pkg.name} <storyId> <archivePath>

Options
  --help, -h      Show help
  --version, -v   Show version number

Homepage:     ${green(pkg.homepage)}
Report issue: ${green(pkg.bugs.url)}`;

const flags = {
  help: { alias: 'h' },
  version: { alias: 'v' }
};

const isMacOS = process.platform === 'darwin';
const message = (emoji, msg) => isMacOS ? `${emoji} ${msg}` : msg;

const Status = {
  [Section.READ]: message('🔍', 'Reading remote data'),
  [Section.DOWNLOAD]: message('⏬', 'Downloading storyline files'),
  [Section.PACKAGE]: message('📦', 'Creating storyline package')
};

(async () => {
  const cli = meow(help, { flags });
  const [storyId, archivePath] = cli.input;
  ensures(cli, storyId, 'storyId');
  ensures(cli, archivePath, 'archivePath');
  console.log(`Downloading storyline from ${green('Articulate Review')}...`);
  const gauge = new Gauge();
  const stream = await createZipStream(storyId, onProgress);
  stream.on('finish', onFinish);
  stream.pipe(fs.createWriteStream(archivePath));

  function onProgress(value, section) {
    const status = Status[section] || '';
    gauge.show(status, value);
    gauge.pulse();
  }

  function onFinish() {
    gauge.hide();
    const dest = path.relative(process.cwd(), archivePath);
    console.log(`Storyline ${green(storyId)} successfully downloaded to ${green(dest)}`);
  }
})();

function ensures(cli, val, name) {
  if (val) return;
  console.error(message('🚨', `${red('Error:')} Missing argument <${name}>`));
  cli.showHelp();
}

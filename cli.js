#!/usr/bin/env node

'use strict';

const createArchiveStream = require('.');
const fs = require('fs');
const green = require('ansi-green');
const meow = require('meow');
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

(async () => {
  const cli = meow(help, { flags });
  const [storyId, archivePath] = cli.input;
  const stream = await createArchiveStream(storyId);
  stream.pipe(fs.createWriteStream(archivePath));
})();

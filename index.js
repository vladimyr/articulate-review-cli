'use strict';

const { promisify } = require('util');
const { ZipFile } = require('yazl');
const debug = require('debug');
const download = require('./lib/download');
const rimraf = promisify(require('rimraf'));
const tempy = require('tempy');

module.exports = async function createArchiveStream(storyId) {
  const tempDir = tempy.directory();
  const results = await download(storyId, tempDir);
  const archive = new ZipFile();
  results.forEach(result => {
    if (!result.isFulfilled) return;
    const { localPath, path } = result.value;
    archive.addFile(localPath, path);
    debug('packager')('adding %s: %s', path, localPath);
  });
  archive.end();
  return archive.outputStream.on('finish', () => rimraf(tempDir));
};

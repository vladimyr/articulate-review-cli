'use strict';

const { promisify } = require('util');
const { ZipFile } = require('yazl');
const debug = require('debug');
const download = require('./lib/download');
const progress = require('./lib/progress');
const rimraf = promisify(require('rimraf'));
const tempy = require('tempy');

const noop = Function.prototype;
const { Section } = progress;

module.exports = async function createZipStream(storyId, onProgress = noop) {
  const tempDir = tempy.directory();
  const downloadTime = 0.9;
  const results = await download(storyId, tempDir, (value, section) => {
    onProgress(downloadTime * value, section);
  });
  const archive = new ZipFile();
  const packagingTime = 1 - downloadTime;
  const notifyProgress = progress(1, Section.PACKAGE, (value, section) => {
    onProgress(downloadTime + packagingTime * value, section);
  });
  results.forEach(result => {
    if (!result.isFulfilled) return;
    const { localPath, path } = result.value;
    archive.addFile(localPath, path);
    debug('packager')('adding %s: %s', path, localPath);
  });
  archive.end();
  return archive.outputStream.on('finish', () => {
    notifyProgress();
    rimraf(tempDir);
  });
};

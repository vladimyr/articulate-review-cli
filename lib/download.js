'use strict';

const { config } = require('../package.json');
const { readStory } = require('./story');
const debug = require('debug');
const path = require('path');
const progress = require('./progress');
const pSettle = require('p-settle');
const r = require('got');
const urlJoin = require('url-join');
const write = require('write').promise;

const isFunction = arg => typeof arg === 'function';
const pluck = (arr, prop) => arr.map(it => it[prop]);
const noop = Function.prototype;
const baseUrl = config.baseUrl;
const { Section } = progress;

const paths = [
  // launcher
  '/story.html',
  '/story_html5.html',

  // metadata
  '/meta.xml',
  '/tincan.xml',

  // scripts
  '/html5/lib/scripts/app.min.js',
  '/story_content/user.js',

  // styles
  '/html5/lib/stylesheets/main.min.css',
  '/html5/data/css/output.min.css',

  // slideshow data
  '/html5/data/js/data.js',
  '/html5/data/js/frame.js',
  '/html5/data/js/paths.js'
];

module.exports = download;

async function download(storyId, destDir, options, onProgress = noop) {
  if (arguments.length === 3 && isFunction(options)) {
    onProgress = options;
    options = null;
  }
  options = options || { concurrency: 5 };
  const readingTime = 0.5;
  const storyUrl = urlJoin(baseUrl, storyId);
  const {
    slides,
    assets,
    slideObjects
  } = await readStory(storyUrl, options, (value, section) => {
    onProgress(readingTime * value, section);
  });
  paths.push(
    ...pluck(slides, 'html5url'),
    ...pluck(assets.all, 'url'),
    ...pluck(slideObjects, 'url')
  );
  const downloadTime = 1 - readingTime;
  const notifyProgress = progress(paths.length * 2, Section.DOWNLOAD, (value, section) => {
    onProgress(readingTime + downloadTime * value, section);
  });
  return pSettle(paths.map(async filePath => {
    const url = urlJoin(baseUrl, storyId, filePath);
    debug('net')('download %s', url);
    const resp = await r.get(url, { encoding: null });
    notifyProgress();
    const dest = path.join(destDir, storyId, filePath);
    debug('fs')('write %s', dest);
    await write(dest, resp.body);
    notifyProgress();
    return { url, path: path.join(storyId, filePath), localPath: dest };
  }), options);
}

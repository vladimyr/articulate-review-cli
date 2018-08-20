'use strict';

const { config } = require('../package.json');
const { readStory } = require('./story');
const debug = require('debug');
const path = require('path');
const pSettle = require('p-settle');
const r = require('got');
const urlJoin = require('url-join');
const write = require('write').promise;

const pluck = (arr, prop) => arr.map(it => it[prop]);
const baseUrl = config.baseUrl;

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

async function download(storyId, destDir, options = { concurrency: 5 }) {
  const storyUrl = urlJoin(baseUrl, storyId);
  const { slides, assets, slideObjects } = await readStory(storyUrl, options);
  paths.push(
    ...pluck(slides, 'html5url'),
    ...pluck(assets.all, 'url'),
    ...pluck(slideObjects, 'url')
  );
  return pSettle(paths.map(async filePath => {
    const url = urlJoin(baseUrl, storyId, filePath);
    debug('net')('download %s', url);
    const resp = await r.get(url, { encoding: null });
    const dest = path.join(destDir, storyId, filePath);
    debug('fs')('write %s', dest);
    await write(dest, resp.body);
    return { url, path: path.join(storyId, filePath), localPath: dest };
  }), options);
}

'use strict';

const loadJson = require('./load-json');
const pMap = require('p-map');
const progress = require('./progress');
const urlJoin = require('url-join');

const flatten = arr => arr.reduce((acc, it) => acc.concat(it));
const isFunction = arg => typeof arg === 'function';
const noop = Function.prototype;
const { Section } = progress;

module.exports = { readStory };

async function readStory(storyUrl, options, onProgress = noop) {
  if (arguments.length === 2 && isFunction(options)) {
    onProgress = options;
    options = null;
  }
  options = options || { concurrency: 5 };
  const load = path => loadJson(urlJoin(storyUrl, path));
  const data = await load('/html5/data/js/data.js');
  const slides = readSlides(data);
  const notifyProgress = progress(slides.length + 1, Section.READ, onProgress);
  notifyProgress();
  const assets = readAssets(data);
  const slideObjects = flatten(await pMap(slides, async it => {
    const slide = await load(it.html5url);
    notifyProgress();
    return readSlideObjects(slide);
  }, options));
  return { assets, slides, slideObjects };
}

function readSlides({ scenes = [] } = {}) {
  return scenes.reduce((acc, it) => {
    const slides = it.slides.filter(it => !!it.html5url);
    return acc.concat(slides);
  }, []);
}

function readAssets({ assetLib = [] } = {}) {
  const assets = {
    mobile: [],
    story_content: [],
    other: [],
    get all() {
      return [
        ...assets.mobile,
        ...assets.story_content,
        ...assets.other
      ];
    }
  };
  return assetLib.reduce((acc, it) => {
    if (!it.url) return acc;
    const [type] = it.url.split('/');
    const col = acc[type] || acc.other;
    col.push(it);
    return acc;
  }, assets);
}

function readSlideObjects({ slideLayers = [] } = {}) {
  return flatten(slideLayers.map(it => readObjects(it)));

  function readObjects(node, objects = []) {
    if (Array.isArray(node.objects)) {
      node.objects.forEach(it => readObjects(it, objects));
    }
    if (node.url) objects.push(node);
    return objects;
  }
}

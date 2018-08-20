'use strict';

const debug = require('debug')('net');
const r = require('got');
const vm = require('vm');

const globals = () => ({
  globalProvideData(type, json) {
    this.result = [type, JSON.parse(json)];
    return this.result;
  }
});

module.exports = async function loadJson(url) {
  debug('loading json %s', url);
  const resp = await r.get(url);
  const [, data] = exec(resp.body);
  return data;
};

function exec(code) {
  const ctx = globals();
  vm.runInNewContext(code, { window: ctx });
  return ctx.result;
}

'use strict';

module.exports = function (total, section, onProgress) {
  let value = 0;
  return function notifyProgress() {
    value += 1;
    onProgress(value / total, section);
  };
};

module.exports.Section = {
  READ: 'read',
  DOWNLOAD: 'download',
  PACKAGE: 'package'
};

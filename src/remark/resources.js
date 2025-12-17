var version = require('../../package.json').version;
var documentStyles = require('../remark.less');
var containerLayout = require('../remark.html');

module.exports = {
  version: version,
  documentStyles: documentStyles,
  containerLayout: containerLayout
};

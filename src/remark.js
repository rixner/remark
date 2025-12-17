var Api = require('./remark/api')
  , styler = require('./remark/components/styler/styler')
  ;

// Expose API as `remark`
window.remark = new Api();

// Apply embedded styles to document
styler.styleDocument();

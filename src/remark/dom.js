module.exports = Dom;

function Dom() {}

Dom.prototype.XMLHttpRequest = XMLHttpRequest;

Dom.prototype.getHTMLElement = () => document.getElementsByTagName('html')[0];

Dom.prototype.getBodyElement = () => document.body;

Dom.prototype.getElementById = (id) => document.getElementById(id);

Dom.prototype.getLocationHash = () => window.location.hash;

Dom.prototype.setLocationHash = (hash) => {
  if (
    typeof window.history.replaceState === 'function' &&
    window.origin !== 'null'
  ) {
    window.history.replaceState(undefined, undefined, hash);
  } else {
    window.location.hash = hash;
  }
};

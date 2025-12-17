exports.addClass = (element, className) => {
  element.className = exports.getClasses(element).concat([className]).join(' ');
};

exports.removeClass = (element, className) => {
  element.className = exports
    .getClasses(element)
    .filter((klass) => klass !== className)
    .join(' ');
};

exports.toggleClass = (element, className) => {
  var classes = exports.getClasses(element),
    index = classes.indexOf(className);

  if (index !== -1) {
    classes.splice(index, 1);
  } else {
    classes.push(className);
  }

  element.className = classes.join(' ');
};

exports.getClasses = (element) =>
  element.className.split(' ').filter((s) => s !== '');

exports.hasClass = (element, className) =>
  exports.getClasses(element).indexOf(className) !== -1;

exports.getPrefixedProperty = (element, propertyName) => {
  var capitalizedPropertName =
    propertyName[0].toUpperCase() + propertyName.slice(1);

  return (
    element[propertyName] ||
    element['moz' + capitalizedPropertName] ||
    element['webkit' + capitalizedPropertName]
  );
};

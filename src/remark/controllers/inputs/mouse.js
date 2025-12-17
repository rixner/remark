exports.register = (events, options) => {
  addMouseEventListeners(events, options);
};

exports.unregister = (events) => {
  removeMouseEventListeners(events);
};

function addMouseEventListeners(events, options) {
  if (options.click) {
    events.on('click', (event) => {
      if (event.target.nodeName === 'A') {
        // Don't interfere when clicking link
        return;
      } else if (event.button === 0) {
        events.emit('gotoNextSlide');
      }
    });
    events.on('contextmenu', (event) => {
      if (event.target.nodeName === 'A') {
        // Don't interfere when right-clicking link
        return;
      }
      event.preventDefault();
      events.emit('gotoPreviousSlide');
    });
  }

  if (options.scroll !== false) {
    var scrollHandler = (event) => {
      if (event.wheelDeltaY > 0 || event.detail < 0) {
        events.emit('gotoPreviousSlide');
      } else if (event.wheelDeltaY < 0 || event.detail > 0) {
        events.emit('gotoNextSlide');
      }
    };

    // IE9, Chrome, Safari, Opera
    events.on('mousewheel', scrollHandler);
    // Firefox
    events.on('DOMMouseScroll', scrollHandler);
  }
}

function removeMouseEventListeners(events) {
  events.removeAllListeners('click');
  events.removeAllListeners('contextmenu');
  events.removeAllListeners('mousewheel');
}

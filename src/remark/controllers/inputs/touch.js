exports.register = (events, options) => {
  addTouchEventListeners(events, options);
};

exports.unregister = (events) => {
  removeTouchEventListeners(events);
};

function addTouchEventListeners(events, options) {
  var touch, startX, endX;

  if (options.touch === false) {
    return;
  }

  var isTap = () => Math.abs(startX - endX) < 10;

  var handleTap = () => {
    events.emit('tap', endX);
  };

  var handleSwipe = () => {
    if (startX > endX) {
      events.emit('gotoNextSlide');
    } else {
      events.emit('gotoPreviousSlide');
    }
  };

  events.on('touchstart', (event) => {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  events.on('touchend', (event) => {
    if (event.target.nodeName.toUpperCase() === 'A') {
      return;
    }

    touch = event.changedTouches[0];
    endX = touch.clientX;

    if (isTap()) {
      handleTap();
    } else {
      handleSwipe();
    }
  });

  events.on('touchmove', (event) => {
    event.preventDefault();
  });
}

function removeTouchEventListeners(events) {
  events.removeAllListeners('touchstart');
  events.removeAllListeners('touchend');
  events.removeAllListeners('touchmove');
}

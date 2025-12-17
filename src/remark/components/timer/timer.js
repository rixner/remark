var utils = require('../../utils');

module.exports = TimerViewModel;

function TimerViewModel(events, element, options) {
  this.options = Object.assign(
    {},
    {
      enabled: true,
      resetable: true,
      startOnChange: true,
      formatter: defaultFormatter
    },
    options || {}
  );
  this.element = element;
  this.reset();

  events.on('start', () => {
    if (this.options.startOnChange) {
      events.emit('startTimer');
    }
  });

  events.on('startTimer', () => {
    this.start();
  });

  events.on('pauseTimer', () => {
    this.pause();
  });

  events.on('toggleTimer', () => {
    this.toggle();
  });

  events.on('resetTimer', () => {
    if (this.options.resetable) {
      this.reset();
    }
  });

  setInterval(() => {
    this.tick();
  }, 100);
}
TimerViewModel.prototype.tick = function () {
  this.chronos.tick();
  this.state.update(this.chronos);
  this.view.update(this.chronos.elapsedTime);
};
TimerViewModel.prototype.start = function () {
  this.state = this.RUNNING;
};
TimerViewModel.prototype.pause = function () {
  this.state = this.PAUSED;
};
TimerViewModel.prototype.toggle = function () {
  if (this.state === this.RUNNING) {
    this.state = this.PAUSED;
  } else {
    // state === PAUSED || state == INITIAL
    this.state = this.RUNNING;
  }
};
TimerViewModel.prototype.reset = function () {
  this.chronos = new Chronos();
  this.state = this.INITIAL;
  this.view = new TimerView(this.element, this.options);
};

TimerViewModel.prototype.INITIAL = new State('INITIAL', (chronos) => {
  /* do nothing */
});
TimerViewModel.prototype.RUNNING = new State('RUNNING', (chronos) => {
  chronos.addDelta();
});
TimerViewModel.prototype.PAUSED = new State('PAUSED', (chronos) => {
  /* do nothing */
});

function Chronos() {
  var now = new Date().getTime();
  this.currentTick = now;
  this.lastTick = now;
  this.elapsedTime = 0;
}
Chronos.prototype.tick = function () {
  var now = new Date().getTime();
  this.lastTick = this.currentTick;
  this.currentTick = now;
};
Chronos.prototype.addDelta = function () {
  var delta = this.currentTick - this.lastTick;
  this.elapsedTime += delta;
};

function State(identifier, updater) {
  this.identifier = identifier;
  this.updater = updater;
}
State.prototype.update = function (chronos) {
  this.updater(chronos);
};

function TimerView(element, options) {
  this.element = element;
  this.enabled = options.enabled;
  this.formatter = options.formatter;

  if (!this.enabled) {
    this.element.style = 'display: none';
  }
}
TimerView.prototype.update = function (elapsedTime) {
  var content = this.enabled ? this.formatter(elapsedTime) : '';
  this.element.innerHTML = content;
};

function defaultFormatter(elapsedTime) {
  var left = elapsedTime;
  var millis = left % 1000;
  left = idiv(left, 1000);
  var seconds = left % 60;
  left = idiv(left, 60);
  var minutes = left % 60;
  left = idiv(left, 60);
  var hours = left;

  return (
    '' +
    hours +
    ':' +
    [minutes, seconds]
      .map((d) => '' + d)
      .map((s) => padStart(s, 2, '0'))
      .join(':')
  );
}

function idiv(n, d) {
  return Math.floor(n / d);
}

function padStart(s, length, pad) {
  var result = s;
  while (result.length < length) {
    result = pad + result;
  }
  return result;
}

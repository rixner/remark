var EventEmitter = require('events').EventEmitter,
  Timer = require('../../../src/remark/components/timer/timer');

describe('Timer', () => {
  var events, element, timer;

  beforeEach(() => {
    events = new EventEmitter();
    element = document.createElement('div');
  });

  describe('start event', () => {
    it("should respond to a 'start' event", () => {
      timer = new Timer(events, element);

      events.emit('start');

      timer.state.should.equal(timer.RUNNING);
    });

    it("should respond to a 'start' event unless 'startOnChange' option is 'false'", () => {
      timer = new Timer(events, element, { startOnChange: false });

      events.emit('start');

      timer.state.should.equal(timer.INITIAL);
    });
  });

  describe('timer events', () => {
    beforeEach(() => {
      timer = new Timer(events, element);
    });

    it('should be in an initial state', () => {
      timer.state.should.equal(timer.INITIAL);
    });

    it('should respond to a startTimer event', () => {
      events.emit('startTimer');

      timer.state.should.equal(timer.RUNNING);
    });

    it('should respond to a pauseTimer event', () => {
      events.emit('pauseTimer');

      timer.state.should.equal(timer.PAUSED);
    });

    it('should respond to a toggleTimer event', () => {
      events.emit('toggleTimer');

      timer.state.should.equal(timer.RUNNING);

      events.emit('toggleTimer');

      timer.state.should.equal(timer.PAUSED);

      events.emit('toggleTimer');

      timer.state.should.equal(timer.RUNNING);
    });

    it('should respond to a resetTimer event', () => {
      events.emit('resetTimer');

      timer.state.should.equal(timer.INITIAL);
    });

    it("should respond to a resetTimer event unless 'resetable' option is set to 'false'", () => {
      timer = new Timer(events, element, { resetable: false });

      events.emit('startTimer');
      events.emit('resetTimer');

      timer.state.should.equal(timer.RUNNING);
    });

    describe('sequence of events', () => {
      it('should be in a correct state after startTimer, pauseTimer', () => {
        ['startTimer', 'pauseTimer'].forEach((event) => {
          events.emit(event);
        });

        timer.state.should.equal(timer.PAUSED);
      });

      it('should be in a correct state after startTimer, resetTimer', () => {
        ['startTimer', 'resetTimer'].forEach((event) => {
          events.emit(event);
        });

        timer.state.should.equal(timer.INITIAL);
      });

      it('should be in a correct state after startTimer, pauseTimer, startTimer', () => {
        ['startTimer', 'pauseTimer', 'startTimer'].forEach((event) => {
          events.emit(event);
        });

        timer.state.should.equal(timer.RUNNING);
      });

      it('should be in a correct state after startTimer, pauseTimer, resetTimer', () => {
        ['startTimer', 'pauseTimer', 'resetTimer'].forEach((event) => {
          events.emit(event);
        });

        timer.state.should.equal(timer.INITIAL);
      });
    });
  });

  describe('tick', () => {
    beforeEach(() => {
      timer = new Timer(events, element);
    });

    it('timer in INITIAL state does not progresses the elapsed time', (done) => {
      setTimeout(() => {
        timer.tick();

        timer.chronos.elapsedTime.should.equal(0);
        done();
      });
    });

    it('timer in RUNNING state progresses the elapsed time', (done) => {
      events.emit('startTimer');

      setTimeout(() => {
        timer.tick();

        timer.chronos.elapsedTime.should.be.above(0);
        done();
      });
    });

    it('timer in PAUSED state does not progresses the elapsed time', (done) => {
      events.emit('pauseTimer');

      setTimeout(() => {
        timer.tick();

        timer.chronos.elapsedTime.should.equal(0);
        done();
      });
    });
  });

  describe('view', () => {
    var millis = 1,
      seconds = 1000 * millis,
      minutes = 60 * seconds,
      hours = 60 * minutes;

    it('defaults to H:mm:ss', () => {
      timer = new Timer(events, element);
      timer.chronos.elapsedTime =
        1 * hours + 23 * minutes + 45 * seconds + 678 * millis;

      timer.tick();

      element.innerHTML.should.equal('1:23:45');
    });

    it('defaults view can be overriden', () => {
      timer = new Timer(events, element, {
        formatter: (elapsedTime) => {
          var left = elapsedTime;
          var millis = left % 1000;
          left = Math.floor(left / 1000);
          var seconds = left % 60;
          left = Math.floor(left / 60);
          var minutes = left;

          return [minutes, seconds]
            .map((d) => '' + d)
            .map((s) => padStart(s, 2, '0'))
            .join(':');
        }
      });
      timer.chronos.elapsedTime =
        1 * hours + 23 * minutes + 45 * seconds + 678 * millis;

      timer.tick();

      element.innerHTML.should.equal('83:45');
    });

    it('can be disabled', () => {
      timer = new Timer(events, element, {
        enabled: false
      });
      timer.chronos.elapsedTime =
        1 * hours + 23 * minutes + 45 * seconds + 678 * millis;

      timer.tick();

      element.innerHTML.should.equal('');
    });
  });
});

function padStart(s, length, pad) {
  var result = s;
  while (result.length < length) {
    result = pad + result;
  }
  return result;
}

var EventEmitter = require('events').EventEmitter,
  Dom = require('../../../src/remark/dom'),
  SlideshowView = require('../../../src/remark/views/slideshowView'),
  Slideshow = require('../../../src/remark/models/slideshow'),
  utils = require('../../../src/remark/utils');

describe('SlideshowView', () => {
  var events, dom, model, containerElement, options, view;

  beforeEach(() => {
    events = new EventEmitter();
    dom = new Dom();
    model = new Slideshow(events, dom);
    containerElement = document.createElement('div');
    options = { container: containerElement };
  });

  describe('container element configuration', () => {
    beforeEach(() => {
      view = new SlideshowView(events, dom, options, model);
    });

    it('should style element', () => {
      containerElement.className.should.containEql('remark-container');
    });

    it('should position element', () => {
      containerElement.style.position.should.equal('absolute');
    });

    it('should make element focusable', () => {
      containerElement.tabIndex.should.equal(-1);
    });

    describe('proxying of element events', () => {
      it('should proxy keydown event', (done) => {
        events.on('keydown', () => {
          done();
        });

        triggerEvent(containerElement, 'keydown');
      });

      it('should proxy keypress event', (done) => {
        events.on('keypress', () => {
          done();
        });

        triggerEvent(containerElement, 'keypress');
      });

      it('should proxy mousewheel event', (done) => {
        events.on('mousewheel', () => {
          done();
        });

        triggerEvent(containerElement, 'mousewheel');
      });

      it('should proxy touchstart event', (done) => {
        events.on('touchstart', () => {
          done();
        });

        triggerEvent(containerElement, 'touchstart');
      });

      it('should proxy touchmove event', (done) => {
        events.on('touchmove', () => {
          done();
        });

        triggerEvent(containerElement, 'touchmove');
      });

      it('should proxy touchend event', (done) => {
        events.on('touchend', () => {
          done();
        });

        triggerEvent(containerElement, 'touchend');
      });
    });
  });

  describe('document.body container element configuration', () => {
    var body;

    beforeEach(() => {
      body = dom.getBodyElement();
      containerElement = body;
      options = { container: containerElement };
      view = new SlideshowView(events, dom, options, model);
    });

    it('should style HTML element', () => {
      dom.getHTMLElement().className.should.containEql('remark-container');
    });

    it('should not position element', () => {
      containerElement.style.position.should.not.equal('absolute');
    });

    describe('proxying of element events', () => {
      it('should proxy resize event', (done) => {
        events.on('resize', () => {
          done();
        });

        triggerEvent(window, 'resize');
      });

      it('should proxy hashchange event', (done) => {
        events.on('hashchange', () => {
          done();
        });

        triggerEvent(window, 'hashchange');
      });

      it('should proxy keydown event', (done) => {
        events.on('keydown', () => {
          done();
        });

        triggerEvent(window, 'keydown');
      });

      it('should proxy keypress event', (done) => {
        events.on('keypress', () => {
          done();
        });

        triggerEvent(window, 'keypress');
      });

      it('should proxy mousewheel event', (done) => {
        events.on('mousewheel', () => {
          done();
        });

        triggerEvent(window, 'mousewheel');
      });

      it('should proxy touchstart event', (done) => {
        events.on('touchstart', () => {
          done();
        });

        triggerEvent(body, 'touchstart');
      });

      it('should proxy touchmove event', (done) => {
        events.on('touchmove', () => {
          done();
        });

        triggerEvent(body, 'touchmove');
      });

      it('should proxy touchend event', (done) => {
        events.on('touchend', () => {
          done();
        });

        triggerEvent(body, 'touchend');
      });
    });
  });

  describe('ratio calculation', () => {
    it('should calculate element size for 4:3', () => {
      model = new Slideshow(events, dom, { ratio: '4:3' });

      view = new SlideshowView(events, dom, options, model);

      view.slideViews[0].scalingElement.style.width.should.equal('908px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });

    it('should calculate element size for 16:9', () => {
      model = new Slideshow(events, dom, { ratio: '16:9' });

      view = new SlideshowView(events, dom, options, model);

      view.slideViews[0].scalingElement.style.width.should.equal('1210px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });
  });

  describe('model synchronization', () => {
    beforeEach(() => {
      view = new SlideshowView(events, dom, options, model);
    });

    it('should create initial slide views', () => {
      view.slideViews.length.should.equal(1);
    });

    it('should replace slide views on slideshow update', () => {
      model.loadFromString('a\n---\nb');

      view.slideViews.length.should.equal(2);
    });
  });

  describe('modes', () => {
    beforeEach(() => {
      view = new SlideshowView(events, dom, options, model);
    });

    it('should toggle blackout on event', () => {
      events.emit('toggleBlackout');

      utils
        .hasClass(containerElement, 'remark-blackout-mode')
        .should.equal(true);
    });

    it('should leave blackout mode on event', () => {
      utils.addClass(containerElement, 'remark-blackout-mode');
      events.emit('hideOverlay');

      utils
        .hasClass(containerElement, 'remark-blackout-mode')
        .should.equal(false);
    });

    it('should toggle mirrored on event', () => {
      events.emit('toggleMirrored');

      utils
        .hasClass(containerElement, 'remark-mirrored-mode')
        .should.equal(true);
    });

    it('should leave toggle mirrored on event', () => {
      utils.addClass(containerElement, 'remark-mirrored-mode');
      events.emit('toggleMirrored');

      utils
        .hasClass(containerElement, 'remark-mirrored-mode')
        .should.equal(false);
    });
  });

  function triggerEvent(element, eventName) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
  }
});

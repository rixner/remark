var EventEmitter = require('events').EventEmitter,
  Slideshow = require('../../../src/remark/models/slideshow'),
  Slide = require('../../../src/remark/models/slide');

describe('Slideshow', () => {
  var events, slideshow, dom;

  beforeEach(() => {
    events = new EventEmitter();
    dom = {
      XMLHttpRequest: function () {
        this.open = () => {};
        this.send = () => {};
        this.success = function (responseText) {
          this.readyState = 4;
          this.status = 200;
          this.responseText = responseText;
          this.onload();
        };
      }
    };
    slideshow = new Slideshow(events, dom);
  });

  describe('loading from source', () => {
    it('should create slides', () => {
      slideshow.loadFromString('a\n---\nb');
      slideshow.getSlides().length.should.equal(2);
    });

    it('should create slide numbers', () => {
      slideshow.loadFromString('a\n---\nb\n---\nc');
      slideshow.getSlides().length.should.equal(3);
      slideshow.getSlides().forEach((slide, index) => {
        slide.getSlideNumber().should.equal(index + 1);
      });
    });

    it('should replace slides', () => {
      slideshow.loadFromString('a\n---\nb\n---\nc');
      slideshow.getSlides().length.should.equal(3);
    });

    it('should mark continued slide as non-markable and not count them', () => {
      slideshow = new Slideshow(events, null, {
        countIncrementalSlides: false
      });
      slideshow.loadFromString('a\n--\nb');
      slideshow.getSlides()[1].properties.count.should.equal('false');
      slideshow.getSlides()[1].getSlideNumber().should.equal(1);
    });
  });

  describe('loading from url', () => {
    it('should download source with \\n line separators from url', () => {
      var xhr = slideshow.loadFromUrl('url');
      xhr.success('a\n---\nb');
      var slides = slideshow.getSlides();
      slides.length.should.eql(2);
      slides[0].content.should.eql(['a']);
      slides[1].content.should.eql(['b']);
    });

    it('should download source with \\r\\n line separators from url', () => {
      var xhr = slideshow.loadFromUrl('url');
      xhr.success('a\r\n---\r\nb');
      var slides = slideshow.getSlides();
      slides.length.should.eql(2);
      slides[0].content.should.eql(['a']);
      slides[1].content.should.eql(['b']);
    });
  });

  describe('continued slides', () => {
    it('should be created when using only two dashes', () => {
      slideshow.loadFromString('a\n--\nb');

      slideshow
        .getSlides()[1]
        .properties.should.have.property('continued', 'true');
    });

    it('should normally be counted', () => {
      slideshow.loadFromString('a\n--\nb');
      slideshow.getSlides().forEach((slide, index) => {
        slide.getSlideNumber().should.equal(index + 1);
      });
    });

    it('should not be counted if this is requested', () => {
      slideshow = new Slideshow(events, null, {
        countIncrementalSlides: false
      });
      slideshow.loadFromString('a\n--\nb');
      slideshow.getSlides().forEach((slide) => {
        slide.getSlideNumber().should.equal(1);
      });
    });
  });

  describe('non-countable slides', () => {
    it('should not be counted', () => {
      slideshow.loadFromString('a\n---\ncount: false\n\nb');
      slideshow.getSlides().forEach((slide, index) => {
        slide.getSlideNumber().should.equal(1);
      });
    });
  });

  describe('non-countable slides', () => {
    it('should not be counted if set on first slide', () => {
      slideshow.loadFromString('count: false\n\na\n---\nb');
      slideshow.getSlides().length.should.equal(2);
      slideshow.getSlidesByNumber(1)[0].getSlideNumber().should.equal(1);
    });
  });

  describe('name mapping', () => {
    it('should map named slide', () => {
      slideshow.loadFromString('name: a\n---\nno name\n---\nname: b');
      slideshow.getSlideByName('a').should.exist;
      slideshow.getSlideByName('b').should.exist;
    });
  });

  describe('number mapping', () => {
    it('should be populated', () => {
      slideshow.loadFromString('a\n---\nb');
      slideshow.getSlidesByNumber(1).should.exist;
      slideshow.getSlidesByNumber(2).should.exist;
    });

    it('should contain all slides with the same number in one entry', () => {
      slideshow.loadFromString('a\n---\ncount: false\n\nb\n---\nc');
      slideshow.getSlidesByNumber(1).should.exist;
      slideshow.getSlidesByNumber(1).length.should.equal(2);
      slideshow.getSlidesByNumber(1)[0].getSlideNumber().should.equal(1);
      slideshow.getSlidesByNumber(1)[0].getSlideIndex().should.equal(0);
      slideshow.getSlidesByNumber(1)[1].getSlideNumber().should.equal(1);
      slideshow.getSlidesByNumber(1)[1].getSlideIndex().should.equal(1);
      slideshow.getSlidesByNumber(2).should.exist;
    });
  });

  describe('templates', () => {
    it('should have properties inherited by referenced slide', () => {
      slideshow.loadFromString('name: a\nprop:val\na\n---\ntemplate: a\nb');
      slideshow.getSlides()[1].properties.should.have.property('prop', 'val');
    });

    it('should have content inherited by referenced slide', () => {
      slideshow.loadFromString('name: a\na\n---\ntemplate: a\nb');
      slideshow.getSlides()[1].content.should.eql(['\na', '\nb']);
    });
  });

  describe('layout slides', () => {
    it('should be default template for subsequent slides', () => {
      slideshow.loadFromString('layout: true\na\n---\nb');
      slideshow.getSlides()[0].content.should.eql(['\na', 'b']);
    });

    it('should not be default template for subsequent layout slide', () => {
      slideshow.loadFromString('layout: true\na\n---\nlayout: true\nb\n---\nc');
      slideshow.getSlides()[0].content.should.eql(['\nb', 'c']);
    });

    it('should be omitted from list of slides', () => {
      slideshow.loadFromString('name: a\nlayout: true\n---\nname: b');
      slideshow.getSlides().length.should.equal(1);
    });

    it('should not be counted', () => {
      slideshow.loadFromString('name: a\nlayout: true\n---\nname: b\n---\nc');
      slideshow.getSlides().length.should.equal(2);
      slideshow.getSlides().forEach((slide, index) => {
        slide.getSlideNumber().should.equal(index + 1);
      });
    });
  });

  describe('events', () => {
    it('should emit slidesChanged event', (done) => {
      events.on('slidesChanged', () => {
        done();
      });

      slideshow.loadFromString('a\n---\nb');
    });
  });
});

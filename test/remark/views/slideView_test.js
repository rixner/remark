var EventEmitter = require('events').EventEmitter,
  Slide = require('../../../src/remark/models/slide'),
  SlideView = require('../../../src/remark/views/slideView'),
  utils = require('../../../src/remark/utils');

describe('SlideView', () => {
  var slideshow = {
      slides: [],
      getHighlightStyle: () => 'default',
      getSlides: function () {
        return this.slides;
      },
      getHighlightLines: () => true,
      getHighlightSpans: () => true,
      getHighlightInlineCode: () => false,
      getLinks: () => ({}),
      getHighlightLanguage: () => '',
      getSlideNumberFormat: () => '%current% / %total%'
    },
    scaler = {
      dimensions: { width: 10, height: 10 }
    };

  describe('background', () => {
    it('should be set from background-image slide property', () => {
      var slide = new Slide(1, 1, {
        source: '',
        properties: { 'background-image': 'url(image.jpg)' }
      });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      slideView.contentElement.style.backgroundImage.should.match(
        /^url\((['|"]?).*image\.jpg\1\)$/
      );
    });

    it('should be set by background-image slide property', () => {
      var slide = new Slide(1, 1, {
        source: '',
        properties: { 'background-color': 'red' }
      });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      slideView.contentElement.style.backgroundColor.should.match(/^red$/);
    });

    it('should be set from background-size slide property', () => {
      var slide = new Slide(1, 1, {
        source: '',
        properties: { 'background-size': 'cover' }
      });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      slideView.contentElement.style.backgroundSize.should.match(/^cover$/);
    });

    it('should be set from background-position slide property', () => {
      var slide = new Slide(1, 1, {
        source: '',
        properties: { 'background-position': '2% 98%' }
      });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      slideView.contentElement.style.backgroundPosition.should.match(
        /^2% 98%$/
      );
    });
  });

  describe('classes', () => {
    it('should contain "content" class by default', () => {
      var slide = new Slide(1, 1, { source: '' });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );
      var classes = utils.getClasses(slideView.contentElement);

      classes.should.containEql('remark-slide-content');
    });

    it('should contain additional classes from slide properties', () => {
      var slide = new Slide(1, 1, {
        source: '',
        properties: { class: 'middle, center' }
      });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );
      var classes = utils.getClasses(slideView.contentElement);

      classes.should.containEql('remark-slide-content');
      classes.should.containEql('middle');
      classes.should.containEql('center');
    });

    it('should set remark-slide-incremental class for incremental slides', () => {
      var slide = new Slide(2, 2, {
        source: '',
        properties: { continued: 'true' }
      });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );
      var classes = utils.getClasses(slideView.element);

      classes.should.containEql('remark-slide-incremental');
    });
  });

  describe('empty paragraph removal', () => {
    it('should have empty paragraphs removed', () => {
      var slide = new Slide(1, 1, { source: '&lt;p&gt; &lt;/p&gt;' });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      slideView.contentElement.innerHTML.should.not.containEql('<p></p>');
    });
  });

  describe('show slide', () => {
    it('should set the slide visible', () => {
      var slide = new Slide(1, 1, { source: '' });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );
      slideView.show();

      var classes = utils.getClasses(slideView.containerElement);
      classes.should.containEql('remark-visible');
      classes.should.not.containEql('remark-fading');
    });

    it('should remove any fading element', () => {
      var slide = new Slide(1, 1, { source: '' });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      utils.addClass(slideView.containerElement, 'remark-fading');
      slideView.show();

      var classes = utils.getClasses(slideView.containerElement);
      classes.should.containEql('remark-visible');
      classes.should.not.containEql('remark-fading');
    });
  });

  describe('hide slide', () => {
    it('should mark the slide as fading', () => {
      var slide = new Slide(1, 1, { source: '' });

      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      utils.addClass(slideView.containerElement, 'remark-visible');
      slideView.hide();

      var classes = utils.getClasses(slideView.containerElement);
      classes.should.not.containEql('remark-visible');
      classes.should.containEql('remark-fading');
    });
  });

  describe('code line highlighting', () => {
    it('should add class to prefixed lines', () => {
      var slide = new Slide(1, 1, {
          content: ['```\nline 1\n* line 2\nline 3\n```']
        }),
        slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      var lines = slideView.element.getElementsByClassName(
        'remark-code-line-highlighted'
      );

      lines.length.should.equal(1);
      lines[0].innerHTML.should.equal('  line 2');
    });

    it('should be possible to disable', () => {
      slideshow.getHighlightLines = () => false;

      var slide = new Slide(1, 1, { content: ['```\n* line\n```'] }),
        slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      var lines = slideView.element.getElementsByClassName('remark-code-line');

      lines[0].innerHTML.should.equal('* line');
    });
  });

  describe('code block span highlighting', () => {
    it('should allow escaping first backtick', () => {
      var slide = new Slide(1, 1, { content: ['```\na \\`f` b\n```'] });
      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      var lines = slideView.element.getElementsByClassName('remark-code-line');
      lines[0].innerHTML.should.equal('a `f` b');
    });

    it('should allow custom delimiters', () => {
      slideshow.getHighlightSpans = () => /«([^»]+?)»/g;

      var slide = new Slide(1, 1, { content: ['```\na «f» b\n```'] });
      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      var lines = slideView.element.getElementsByClassName('remark-code-line');
      lines[0].innerHTML.should.equal(
        'a <span class="remark-code-span-highlighted">f</span> b'
      );
    });

    it('should allow escaping opening custom delimiter', () => {
      slideshow.getHighlightSpans = () => /«([^»]+?)»/g;

      var slide = new Slide(1, 1, { content: ['```\na \\«f» b\n```'] });
      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      var lines = slideView.element.getElementsByClassName('remark-code-line');
      lines[0].innerHTML.should.equal('a «f» b');
    });

    it('should be possible to disable', () => {
      slideshow.getHighlightSpans = () => false;

      var slide = new Slide(1, 1, { content: ['```\na `f` b\n```'] });
      slideshow.slides.push(slide);
      var slideView = new SlideView(
        new EventEmitter(),
        slideshow,
        scaler,
        slide
      );

      var lines = slideView.element.getElementsByClassName('remark-code-line');
      lines[0].innerHTML.should.equal('a `f` b');
    });
  });
});

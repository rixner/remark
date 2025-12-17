var Api = require('../../src/remark/api'),
  Dom = require('../../src/remark/dom'),
  highlighter = require('../../src/remark/highlighter'),
  Slideshow = require('../../src/remark/models/slideshow');

require('../../src/remark'); // Triggers window.remark assignment

describe('API', () => {
  var api, dom;

  beforeEach(() => {
    dom = new Dom();
    api = new Api(dom);
  });

  it('should be exposed', () => {
    should(window).have.property('remark');
  });

  it('should expose highlighter', () => {
    api.highlighter.should.equal(highlighter);
  });

  it('should allow creating slideshow', () => {
    api.create().should.be.an.instanceOf(Slideshow);
  });

  it('should allow creating slideshow with source directly', () => {
    var slides = api.create({ source: '1\n---\n2' }).getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql(['1']);
    slides[1].content.should.eql(['2']);
  });

  it('should allow creating slideshow from source textarea', () => {
    var source = document.createElement('textarea');
    source.id = 'source';
    source.textContent = '3\n---\n4';
    dom.getElementById = () => source;

    var slides = api.create().getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql(['3']);
    slides[1].content.should.eql(['4']);
  });
});

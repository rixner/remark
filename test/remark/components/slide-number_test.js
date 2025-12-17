var SlideNumber = require('../../../src/remark/components/slide-number/slide-number');

describe('Slide number', () => {
  var slideNumber;

  it('should display according to format', () => {
    var slide = createSlide(1),
      slideshow = {
        getSlideNumberFormat: () => '%current% / %total%',
        getSlides: () => [createSlide(0), slide, createSlide(2)]
      };

    slideNumber = new SlideNumber(slide, slideshow);

    slideNumber.element.innerHTML.should.equal('2 / 3');
  });

  function createSlide(index) {
    return {
      getSlideIndex: () => index,
      getSlideNumber: () => index + 1,
      properties: {}
    };
  }
});

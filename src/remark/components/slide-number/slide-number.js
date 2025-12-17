module.exports = SlideNumberViewModel;

function SlideNumberViewModel(slide, slideshow) {
  this.slide = slide;
  this.slideshow = slideshow;

  this.element = document.createElement('div');
  this.element.className = 'remark-slide-number';
  this.element.innerHTML = formatSlideNumber(this.slide, this.slideshow);
}

function formatSlideNumber(slide, slideshow) {
  var format = slideshow.getSlideNumberFormat(),
    slides = slideshow.getSlides(),
    current = getSlideNo(slide, slideshow),
    total = getSlideNo(slides[slides.length - 1], slideshow);

  if (typeof format === 'function') {
    return format.call(slideshow, current, total);
  }

  return format.replace('%current%', current).replace('%total%', total);
}

function getSlideNo(slide, slideshow) {
  return slide.getSlideNumber();
}

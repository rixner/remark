var SlideView = require('./slideView'),
  Timer = require('../components/timer/timer'),
  NotesView = require('./notesView'),
  Scaler = require('../scaler'),
  resources = require('../resources'),
  utils = require('../utils'),
  printing = require('../components/printing/printing');

module.exports = SlideshowView;

function SlideshowView(events, dom, options, slideshow) {
  var containerElement = options.container;

  this.events = events;
  this.dom = dom;
  this.slideshow = slideshow;
  this.scaler = new Scaler(events, slideshow);
  this.slideViews = [];

  this.configureContainerElement(containerElement);
  this.configureChildElements();

  this.updateDimensions();
  this.scaleElements();
  this.updateSlideViews();

  this.timer = new Timer(events, this.timerElement, options.timer);

  events.on('slidesChanged', () => {
    this.updateSlideViews();
  });

  events.on('hideSlide', (slideIndex) => {
    // To make sure that there is only one element fading at a time,
    // remove the fading class from all slides before hiding
    // the new slide.
    Array.from(
      this.elementArea.getElementsByClassName('remark-fading')
    ).forEach((slide) => {
      utils.removeClass(slide, 'remark-fading');
    });
    this.hideSlide(slideIndex);
  });

  events.on('showSlide', (slideIndex) => {
    this.showSlide(slideIndex);
  });

  events.on('forcePresenterMode', () => {
    if (!utils.hasClass(this.containerElement, 'remark-presenter-mode')) {
      utils.toggleClass(this.containerElement, 'remark-presenter-mode');
      this.scaleElements();
      printing.setPageOrientation('landscape');
    }
  });

  events.on('togglePresenterMode', () => {
    utils.toggleClass(this.containerElement, 'remark-presenter-mode');
    this.scaleElements();
    events.emit('toggledPresenter', this.slideshow.getCurrentSlideIndex() + 1);

    if (utils.hasClass(this.containerElement, 'remark-presenter-mode')) {
      printing.setPageOrientation('portrait');
    } else {
      printing.setPageOrientation('landscape');
    }
  });

  events.on('toggleHelp', () => {
    utils.toggleClass(this.containerElement, 'remark-help-mode');
  });

  events.on('toggleBlackout', () => {
    utils.toggleClass(this.containerElement, 'remark-blackout-mode');
  });

  events.on('toggleMirrored', () => {
    utils.toggleClass(this.containerElement, 'remark-mirrored-mode');
  });

  events.on('hideOverlay', () => {
    utils.removeClass(this.containerElement, 'remark-blackout-mode');
    utils.removeClass(this.containerElement, 'remark-help-mode');
  });

  events.on('pause', () => {
    utils.toggleClass(this.containerElement, 'remark-pause-mode');
  });

  events.on('resume', () => {
    utils.toggleClass(this.containerElement, 'remark-pause-mode');
  });

  handleFullscreen(this);
}

function handleFullscreen(self) {
  var requestFullscreen = utils.getPrefixedProperty(
      self.containerElement,
      'requestFullScreen'
    ),
    cancelFullscreen = utils.getPrefixedProperty(document, 'cancelFullScreen');

  self.events.on('toggleFullscreen', () => {
    var fullscreenElement =
      utils.getPrefixedProperty(document, 'fullscreenElement') ||
      utils.getPrefixedProperty(document, 'fullScreenElement');

    if (!fullscreenElement && requestFullscreen) {
      requestFullscreen.call(
        self.containerElement,
        Element.ALLOW_KEYBOARD_INPUT
      );
    } else if (cancelFullscreen) {
      cancelFullscreen.call(document);
    }
    self.scaleElements();
  });
}

SlideshowView.prototype.isEmbedded = function () {
  return this.containerElement !== this.dom.getBodyElement();
};

SlideshowView.prototype.configureContainerElement = function (element) {
  this.containerElement = element;

  utils.addClass(element, 'remark-container');

  if (element === this.dom.getBodyElement()) {
    utils.addClass(this.dom.getHTMLElement(), 'remark-container');

    forwardEvents(this.events, window, [
      'hashchange',
      'resize',
      'keydown',
      'keypress',
      'mousewheel',
      'message',
      'DOMMouseScroll'
    ]);
    forwardEvents(this.events, this.containerElement, [
      'touchstart',
      'touchmove',
      'touchend',
      'click',
      'contextmenu'
    ]);
  } else {
    element.style.position = 'absolute';
    element.tabIndex = -1;

    forwardEvents(this.events, window, ['resize']);
    forwardEvents(this.events, element, [
      'keydown',
      'keypress',
      'mousewheel',
      'touchstart',
      'touchmove',
      'touchend'
    ]);
  }

  // Tap event is handled in slideshow view
  // rather than controller as knowledge of
  // container width is needed to determine
  // whether to move backwards or forwards
  this.events.on('tap', (endX) => {
    if (endX < this.containerElement.clientWidth / 2) {
      this.slideshow.gotoPreviousSlide();
    } else {
      this.slideshow.gotoNextSlide();
    }
  });
};

function forwardEvents(target, source, events) {
  events.forEach((eventName) => {
    source.addEventListener(eventName, function () {
      var args = Array.prototype.slice.call(arguments);
      target.emit.apply(target, [eventName].concat(args));
    });
  });
}

SlideshowView.prototype.configureChildElements = function () {
  var self = this;

  self.containerElement.innerHTML += resources.containerLayout;

  self.elementArea =
    self.containerElement.getElementsByClassName('remark-slides-area')[0];
  self.previewArea = self.containerElement.getElementsByClassName(
    'remark-preview-area'
  )[0];
  self.notesArea =
    self.containerElement.getElementsByClassName('remark-notes-area')[0];

  self.notesView = new NotesView(
    self.events,
    self.notesArea,
    () => self.slideViews
  );

  self.backdropElement =
    self.containerElement.getElementsByClassName('remark-backdrop')[0];
  self.helpElement =
    self.containerElement.getElementsByClassName('remark-help')[0];

  self.timerElement = self.notesArea.getElementsByClassName(
    'remark-toolbar-timer'
  )[0];
  self.pauseElement =
    self.containerElement.getElementsByClassName('remark-pause')[0];

  self.events.on('propertiesChanged', (changes) => {
    if (changes.hasOwnProperty('ratio')) {
      self.updateDimensions();
    }
  });

  self.events.on('resize', onResize);

  printing.init();
  printing.on('print', onPrint);

  function onResize() {
    self.scaleElements();
  }

  function onPrint(e) {
    var slideHeight;

    if (e.isPortrait) {
      slideHeight = e.pageHeight * 0.4;
    } else {
      slideHeight = e.pageHeight;
    }

    self.slideViews.forEach((slideView) => {
      slideView.scale({
        clientWidth: e.pageWidth,
        clientHeight: slideHeight
      });

      if (e.isPortrait) {
        slideView.scalingElement.style.top = '20px';
        slideView.notesElement.style.top = slideHeight + 40 + 'px';
      }
    });
  }
};

SlideshowView.prototype.updateSlideViews = function () {
  this.slideViews.forEach((slideView) => {
    this.elementArea.removeChild(slideView.containerElement);
  });

  this.slideViews = this.slideshow
    .getSlides()
    .map(
      (slide) => new SlideView(this.events, this.slideshow, this.scaler, slide)
    );

  this.slideViews.forEach((slideView) => {
    this.elementArea.appendChild(slideView.containerElement);
  });

  this.updateDimensions();

  if (this.slideshow.getCurrentSlideIndex() > -1) {
    this.showSlide(this.slideshow.getCurrentSlideIndex());
  }
};

SlideshowView.prototype.scaleSlideBackgroundImages = function (dimensions) {
  this.slideViews.forEach((slideView) => {
    slideView.scaleBackgroundImage(dimensions);
  });
};

SlideshowView.prototype.showSlide = function (slideIndex) {
  var slideView = this.slideViews[slideIndex],
    nextSlideView = this.slideViews[slideIndex + 1];

  this.events.emit('beforeShowSlide', slideIndex);

  slideView.show();

  if (nextSlideView) {
    this.previewArea.innerHTML = nextSlideView.containerElement.outerHTML;
  } else {
    this.previewArea.innerHTML = '';
  }

  this.events.emit('afterShowSlide', slideIndex);
};

SlideshowView.prototype.hideSlide = function (slideIndex) {
  var slideView = this.slideViews[slideIndex];

  this.events.emit('beforeHideSlide', slideIndex);
  slideView.hide();
  this.events.emit('afterHideSlide', slideIndex);
};

SlideshowView.prototype.updateDimensions = function () {
  var dimensions = this.scaler.dimensions;

  this.helpElement.style.width = dimensions.width + 'px';
  this.helpElement.style.height = dimensions.height + 'px';

  this.scaleSlideBackgroundImages(dimensions);
  this.scaleElements();
};

SlideshowView.prototype.scaleElements = function () {
  this.slideViews.forEach((slideView) => {
    slideView.scale(this.elementArea);
  });

  if (this.previewArea.children.length) {
    this.scaler.scaleToFit(
      this.previewArea.children[0].children[0],
      this.previewArea
    );
  }
  this.scaler.scaleToFit(this.helpElement, this.containerElement);
  this.scaler.scaleToFit(this.pauseElement, this.containerElement);
};

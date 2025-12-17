var converter = require('../converter');

module.exports = NotesView;

function NotesView(events, element, slideViewsAccessor) {
  this.events = events;
  this.element = element;
  this.slideViewsAccessor = slideViewsAccessor;

  this.configureElements();

  events.on('showSlide', (slideIndex) => {
    this.showSlide(slideIndex);
  });
}

NotesView.prototype.showSlide = function (slideIndex) {
  var slideViews = this.slideViewsAccessor(),
    slideView = slideViews[slideIndex],
    nextSlideView = slideViews[slideIndex + 1];

  this.notesElement.innerHTML = slideView.notesElement.innerHTML;

  if (nextSlideView) {
    this.notesPreviewElement.innerHTML = nextSlideView.notesElement.innerHTML;
  } else {
    this.notesPreviewElement.innerHTML = '';
  }
};

NotesView.prototype.configureElements = function () {
  this.notesElement = this.element.getElementsByClassName('remark-notes')[0];
  this.notesPreviewElement = this.element.getElementsByClassName(
    'remark-notes-preview'
  )[0];

  this.notesElement.addEventListener('mousewheel', (event) => {
    event.stopPropagation();
  });

  this.notesPreviewElement.addEventListener('mousewheel', (event) => {
    event.stopPropagation();
  });

  this.toolbarElement =
    this.element.getElementsByClassName('remark-toolbar')[0];

  var commands = {
    increase: () => {
      this.notesElement.style.fontSize =
        (parseFloat(this.notesElement.style.fontSize) || 1) + 0.1 + 'em';
      this.notesPreviewElement.style.fontsize =
        this.notesElement.style.fontSize;
    },
    decrease: () => {
      this.notesElement.style.fontSize =
        (parseFloat(this.notesElement.style.fontSize) || 1) - 0.1 + 'em';
      this.notesPreviewElement.style.fontsize =
        this.notesElement.style.fontSize;
    }
  };

  Array.from(this.toolbarElement.getElementsByTagName('a')).forEach((link) => {
    link.addEventListener('click', (e) => {
      var command = e.target.hash.substr(1);
      commands[command]();
      e.preventDefault();
    });
  });
};

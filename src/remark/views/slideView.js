var SlideNumber = require('../components/slide-number/slide-number'),
  converter = require('../converter'),
  highlighter = require('../highlighter'),
  utils = require('../utils');

module.exports = SlideView;

function SlideView(events, slideshow, scaler, slide) {
  this.events = events;
  this.slideshow = slideshow;
  this.scaler = scaler;
  this.slide = slide;

  this.slideNumber = new SlideNumber(slide, slideshow);

  this.configureElements();
  this.updateDimensions();

  this.events.on('propertiesChanged', (changes) => {
    if (changes.hasOwnProperty('ratio')) {
      this.updateDimensions();
    }
  });
}

SlideView.prototype.updateDimensions = function () {
  var dimensions = this.scaler.dimensions;

  this.scalingElement.style.width = dimensions.width + 'px';
  this.scalingElement.style.height = dimensions.height + 'px';
};

SlideView.prototype.scale = function (containerElement) {
  this.scaler.scaleToFit(this.scalingElement, containerElement);
};

SlideView.prototype.show = function () {
  utils.addClass(this.containerElement, 'remark-visible');
  utils.removeClass(this.containerElement, 'remark-fading');
};

SlideView.prototype.hide = function () {
  utils.removeClass(this.containerElement, 'remark-visible');
  // Don't just disappear the slide. Mark it as fading, which
  // keeps it on the screen, but at a reduced z-index.
  // Then set a timer to remove the fading state in 1s.
  utils.addClass(this.containerElement, 'remark-fading');
  setTimeout(() => {
    utils.removeClass(this.containerElement, 'remark-fading');
  }, 1000);
};

SlideView.prototype.configureElements = function () {
  this.containerElement = document.createElement('div');
  this.containerElement.className = 'remark-slide-container';

  this.scalingElement = document.createElement('div');
  this.scalingElement.className = 'remark-slide-scaler';

  this.element = createSlideElement(this.slide);

  this.contentElement = createContentElement(
    this.events,
    this.slideshow,
    this.slide
  );
  this.notesElement = createNotesElement(this.slideshow, this.slide.notes);

  this.contentElement.appendChild(this.slideNumber.element);
  this.element.appendChild(this.contentElement);
  this.scalingElement.appendChild(this.element);
  this.containerElement.appendChild(this.scalingElement);
  this.containerElement.appendChild(this.notesElement);
};

SlideView.prototype.scaleBackgroundImage = function (dimensions) {
  var styles = window.getComputedStyle(this.contentElement),
    backgroundImage = styles.backgroundImage,
    backgroundSize = styles.backgroundSize,
    backgroundPosition = styles.backgroundPosition,
    match,
    image,
    scale;

  // If the user explicitly sets the backgroundSize or backgroundPosition, let
  // that win and early return here.
  if ((backgroundSize || backgroundPosition) && !this.backgroundSizeSet) {
    return;
  }

  if ((match = /^url\(("?)([^)]+?)\1\)/.exec(backgroundImage)) !== null) {
    image = new Image();
    image.onload = () => {
      if (image.width > dimensions.width || image.height > dimensions.height) {
        // Background image is larger than slide
        if (!this.originalBackgroundSize) {
          // No custom background size has been set
          this.originalBackgroundSize =
            this.contentElement.style.backgroundSize;
          this.originalBackgroundPosition =
            this.contentElement.style.backgroundPosition;
          this.backgroundSizeSet = true;

          if (
            dimensions.width / image.width <
            dimensions.height / image.height
          ) {
            scale = dimensions.width / image.width;
          } else {
            scale = dimensions.height / image.height;
          }

          this.contentElement.style.backgroundSize =
            image.width * scale + 'px ' + image.height * scale + 'px';
          this.contentElement.style.backgroundPosition =
            '50% ' + (dimensions.height - image.height * scale) / 2 + 'px';
        }
      } else {
        // Revert to previous background size setting
        if (this.backgroundSizeSet) {
          this.contentElement.style.backgroundSize =
            this.originalBackgroundSize;
          this.contentElement.style.backgroundPosition =
            this.originalBackgroundPosition;
          this.backgroundSizeSet = false;
        }
      }
    };
    image.src = match[2];
  }
};

function createSlideElement(slide) {
  var element = document.createElement('div');
  element.className = 'remark-slide';

  if (slide.properties.continued === 'true') {
    utils.addClass(element, 'remark-slide-incremental');
  }

  return element;
}

function createContentElement(events, slideshow, slide) {
  var element = document.createElement('div');

  if (slide.properties.name) {
    element.id = 'slide-' + slide.properties.name;
  }

  styleContentElement(slideshow, element, slide.properties);

  element.innerHTML = converter.convertMarkdown(
    slide.content,
    slideshow.getLinks()
  );

  highlightCodeBlocks(element, slideshow);

  return element;
}

function styleContentElement(slideshow, element, properties) {
  element.className = '';

  setClassFromProperties(element, properties);
  setBackgroundFromProperties(element, properties);
}

function setBackgroundFromProperties(element, properties) {
  var backgroundImage = properties['background-image'];
  var backgroundColor = properties['background-color'];
  var backgroundSize = properties['background-size'];
  var backgroundPosition = properties['background-position'];

  if (backgroundImage) {
    element.style.backgroundImage = backgroundImage;
  }
  if (backgroundColor) {
    element.style.backgroundColor = backgroundColor;
  }
  if (backgroundSize) {
    element.style.backgroundSize = backgroundSize;
  }
  if (backgroundPosition) {
    element.style.backgroundPosition = backgroundPosition;
  }
}

function createNotesElement(slideshow, notes) {
  var element = document.createElement('div');

  element.className = 'remark-slide-notes';

  element.innerHTML = converter.convertMarkdown(notes, slideshow.getLinks());

  highlightCodeBlocks(element, slideshow);

  return element;
}

function setClassFromProperties(element, properties) {
  utils.addClass(element, 'remark-slide-content');

  (properties['class'] || '')
    .split(/,| /)
    .filter((s) => s !== '')
    .forEach((c) => {
      utils.addClass(element, c);
    });
}

function highlightCodeBlocks(content, slideshow) {
  var codeBlocks = content.getElementsByTagName('code'),
    highlightLines = slideshow.getHighlightLines(),
    highlightSpans = slideshow.getHighlightSpans(),
    highlightInline = slideshow.getHighlightInlineCode(),
    meta;

  Array.from(codeBlocks).forEach((block) => {
    if (block.className === '') {
      block.className = slideshow.getHighlightLanguage();
    }

    if (block.parentElement.tagName !== 'PRE') {
      utils.addClass(block, 'remark-inline-code');
      if (highlightInline) {
        highlighter.engine.highlightElement(block, '');
      }
      return;
    }

    if (highlightLines) {
      meta = extractMetadata(block);
    }

    if (block.className !== '') {
      highlighter.engine.highlightElement(block, '  ');
    }

    wrapLines(block);

    if (highlightLines) {
      highlightBlockLines(block, meta.highlightedLines);
    }

    if (highlightSpans) {
      // highlightSpans is either true or a RegExp
      highlightBlockSpans(block, highlightSpans);
    }

    utils.addClass(block, 'remark-code');
  });
}

function extractMetadata(block) {
  var highlightedLines = [];

  block.innerHTML = block.innerHTML
    .split(/\r?\n/)
    .map((line, i) => {
      if (line.indexOf('*') === 0) {
        highlightedLines.push(i);
        return line.replace(/^\*( )?/, '$1$1');
      }

      return line;
    })
    .join('\n');

  return {
    highlightedLines: highlightedLines
  };
}

function wrapLines(block) {
  var lines = block.innerHTML
    .split(/\r?\n/)
    .map((line) => '<div class="remark-code-line">' + line + '</div>');

  // Remove empty last line (due to last \n)
  if (lines.length && lines[lines.length - 1].indexOf('><') !== -1) {
    lines.pop();
  }

  block.innerHTML = lines.join('');
}

function highlightBlockLines(block, lines) {
  lines.forEach((i) => {
    utils.addClass(block.childNodes[i], 'remark-code-line-highlighted');
  });
}

/**
 * @param highlightSpans `true` or a RegExp
 */
function highlightBlockSpans(block, highlightSpans) {
  var pattern;
  if (highlightSpans === true) {
    pattern = /([^`])`([^`]+?)`/g;
  } else if (highlightSpans instanceof RegExp) {
    if (!highlightSpans.global) {
      throw new Error(
        'The regular expression in `highlightSpans` must have flag /g'
      );
    }
    // Use [^] instead of dot (.) so that even newlines match
    // We prefix the escape group, so users can provide nicer regular expressions
    var flags = highlightSpans.flags || 'g'; // ES6 feature; use if it’s available
    pattern = new RegExp('([^])' + highlightSpans.source, flags);
  } else {
    throw new Error('Illegal value for `highlightSpans`');
  }

  Array.from(block.childNodes).forEach((element) => {
    element.innerHTML = element.innerHTML.replace(pattern, (m, e, c) => {
      if (e === '\\') {
        return m.substr(1);
      }
      return e + '<span class="remark-code-span-highlighted">' + c + '</span>';
    });
  });
}

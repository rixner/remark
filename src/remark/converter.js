var marked = require('marked')
  , converter = module.exports = {}
  , element = document.createElement('div')
  ;



converter.convertMarkdown = function (content, links, inline) {
  element.innerHTML = convertMarkdown(content, links || {}, inline);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');
  return element.innerHTML.replace(/\n\r?$/, '');
};

function convertMarkdown (content, links, insideContentClass) {
  var i, tag, markdown = '', html;
  var placeholders = {};
  var placeholderCount = 0;

  for (i = 0; i < content.length; ++i) {
    if (typeof content[i] === 'string') {
      markdown += content[i];
    }
    else {
      var innerHtml = '';
      tag = content[i].block ? 'div' : 'span';
      innerHtml += '<' + tag + ' class="' + content[i].class + '">';
      innerHtml += convertMarkdown(content[i].content, links, !content[i].block);
      innerHtml += '</' + tag + '>';
      
      var key = '@REMARK_PLACEHOLDER_' + (placeholderCount++) + '@';
      placeholders[key] = {
        html: innerHtml,
        block: content[i].block
      };
      markdown += key;
    }
  }

  var tokens = marked.Lexer.lex(markdown.replace(/^\s+/, ''), {
    gfm: true,
    breaks: false,
    smartLists: true,
    pedantic: false,
    sanitize: false
  });
  tokens.links = links || {};
  html = marked.Parser.parse(tokens);

  // Restore placeholders
  Object.keys(placeholders).forEach(function (key) {
    var val = placeholders[key];
    
    // If it was a block and marked wrapped it in <p>, unwrap it
    if (val.block) {
       var pRegex = new RegExp('<p>\\s*' + key + '\\s*<\\/p>', 'g');
       html = html.replace(pRegex, val.html);
    }
    
    // Replace any remaining occurrences
    // Use split/join to replace all instances safely without regex meta-char issues in key
    html = html.split(key).join(val.html);
  });

  if (insideContentClass) {
    element.innerHTML = html;
    if (element.children.length === 1 && element.children[0].tagName === 'P') {
      html = element.children[0].innerHTML;
    }
  }

  return html;
}

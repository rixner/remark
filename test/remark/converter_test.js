var converter = require('../../src/remark/converter');

describe('Converter', () => {
  it('should convert empty content', () => {
    var content = [''];
    converter.convertMarkdown(content).should.equal('');
  });

  it('should convert paragraph', () => {
    var content = ['paragraph'];
    converter.convertMarkdown(content).should.equal('<p>paragraph</p>');
  });

  it('should convert paragraph with inline content class', () => {
    var content = [
      'before ',
      { block: false, class: 'whatever', content: ['some _fancy_ content'] },
      ' after'
    ];
    converter
      .convertMarkdown(content)
      .should.equal(
        '<p>before <span class="whatever">some <em>fancy</em> content</span> after</p>'
      );
  });

  it('should convert reference-style link', () => {
    var content = ['[link][id]'],
      links = { id: { href: 'url', title: 'title' } };

    converter
      .convertMarkdown(content, links)
      .should.equal('<p><a href="url" title="title">link</a></p>');
  });
});

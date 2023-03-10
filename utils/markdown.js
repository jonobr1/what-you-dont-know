var marked = require('marked');
var path = require('path');
var fs = require('fs');

[
  '../readme.md',
  '../prototypes/readme.md',
  '../inspiration/readme.md'
].forEach(function(filepath, i) {

  fs.readFile(path.resolve(__dirname, filepath), { encoding: 'utf8'}, function(err, contents) {

    if (err) {
      throw err;
    }

    var markdown = [
      '<!doctype html><head><title>What You Don’t Know</title>',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
      '<link type="text/css" rel="stylesheet" href="',
      (i <= 0) ? '.' : '..',
      '/release/styles/github-markdown.css">',
      '</head><body class="markdown-body">',
      marked(contents),
      '</body></html>'
    ].join('');

    fs.writeFile(path.resolve(__dirname, filepath.replace('readme.md', 'index.html')), markdown, function(err) {

      if (err) {
        throw err;
      }

      console.log(filepath, 'compiled with markdown.');

    });

  });

});

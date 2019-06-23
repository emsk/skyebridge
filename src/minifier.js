'use strict';

const HTMLMinifier = require('html-minifier');
const Terser = require('terser');

const minifyOptions = {
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: text => Terser.minify(text, {output: {comments: /license/i}}).code
};

process.on('message', message => {
  const html = HTMLMinifier.minify(message.html, minifyOptions);
  process.send({html});
});

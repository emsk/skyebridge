'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const HTMLMinifier = require('html-minifier');
const Terser = require('terser');
const validator = require('./validator');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

const minifyOptions = {
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: text => Terser.minify(text, {output: {comments: /license/i}}).code
};

module.exports = class Generator {
  constructor(cmdOptions) {
    this.cmdOptions = cmdOptions;
    this.input = cmdOptions.input;
    this.output = cmdOptions.output;
    this.title = cmdOptions.title;
    this.minify = cmdOptions.minify;
  }

  validateCommandOptions() {
    validator.validateCommandOptions(this.cmdOptions);
  }

  async readJSON() {
    this.data = await readFileAsync(this.input, 'utf8');
  }

  validateRawData() {
    validator.validateRawData(this.data);
  }

  parseJSON() {
    this.data = JSON.parse(this.data);
  }

  validateParsedData() {
    validator.validateParsedData(this.data);
  }

  async generateHTML() {
    const js = await readFileAsync(path.join(__dirname, 'assets', 'vis-network.min.js'), 'utf8');

    this.html = `<!DOCTYPE HTML>
<html>
  <head>
    <title>${this.title}</title>
    <style>
      body {
        margin: 0;
      }
      #diagram {
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="diagram"></div>
    <script>
${js}

      const nodes = JSON.parse('${JSON.stringify(this.data.nodes)}');

      nodes.forEach(function (node, index) {
        if (node.level === undefined) {
          node.level = index;
        }
      });

      const edges = JSON.parse('${JSON.stringify(this.data.edges)}');

      const container = document.getElementById('diagram');
      const data = {
        nodes: nodes,
        edges: edges
      };
      const options = {
        physics: {
          enabled: false
        },
        nodes: {
          shape: 'box',
          shapeProperties: {
            borderRadius: 1
          },
          color: {
            border: '#222',
            background: '#fff'
          },
          margin: 10
        },
        edges: {
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.8
            }
          },
          smooth: {
            type: 'curvedCW',
            roundness: 0.2
          },
          color: {
            color: '#222',
            highlight: '#2b7ce9'
          }
        },
        layout: {
          hierarchical: {
            direction: 'LR',
            levelSeparation: 200,
            nodeSpacing: 200
          }
        }
      };
      const network = new vis.Network(container, data, options);
      network.setOptions({layout: {hierarchical: false}});
    </script>
  </body>
</html>`;
  }

  minifyHTML() {
    if (this.minify) {
      this.html = HTMLMinifier.minify(this.html, minifyOptions);
    }
  }

  async writeHTML() {
    await mkdirAsync(path.dirname(this.output), {recursive: true});
    await writeFileAsync(this.output, this.html);
  }
};

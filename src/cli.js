#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const program = require('commander');
const ora = require('ora');
const HTMLMinifier = require('html-minifier');
const Terser = require('terser');
const pkg = require('../package.json');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

const validateOptions = cmd => {
  if (cmd.input === undefined) {
    throw new Error("No value provided for required options: '--input'");
  }

  if (cmd.output === undefined) {
    throw new Error("No value provided for required options: '--output'");
  }
};

const validateRawData = data => {
  if (data === '') {
    throw new Error("No value provided for required keys: 'nodes', 'edges'");
  }
};

const validateParsedData = data => {
  const {nodes, edges} = data;

  if (nodes === undefined) {
    throw new Error("No value provided for required keys: 'nodes'");
  }

  if (edges === undefined) {
    throw new Error("No value provided for required keys: 'edges'");
  }

  nodes.forEach(node => {
    if (node.id === undefined) {
      throw new Error("No value provided for required keys: 'nodes.id'");
    }

    if (node.label === undefined) {
      throw new Error("No value provided for required keys: 'nodes.label'");
    }
  });

  edges.forEach(edge => {
    if (edge.from === undefined) {
      throw new Error("No value provided for required keys: 'edges.from'");
    }

    if (edge.to === undefined) {
      throw new Error("No value provided for required keys: 'edges.to'");
    }
  });
};

const generateHTML = async (data, title) => {
  const css = await readFileAsync(path.join(__dirname, 'assets', 'vis-network.min.css'), 'utf8');
  const js = await readFileAsync(path.join(__dirname, 'assets', 'vis-network.min.js'), 'utf8');

  return `<!DOCTYPE HTML>
<html>
  <head>
    <title>${title}</title>
    <style>
${css}

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

      const nodes = JSON.parse('${JSON.stringify(data.nodes)}');

      nodes.forEach(function (node, index) {
        if (node.level === undefined) {
          node.level = index;
        }
      });

      const edges = JSON.parse('${JSON.stringify(data.edges)}');

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
};

if (process.argv.length === 2) {
  process.argv.push('--help');
}

program
  .name('skyebridge')
  .version(pkg.version, '-v, --version')
  .option('-i, --input <input>', 'input file path (JSON in which a flow is defined)')
  .option('-o, --output <output>', 'output file path (HTML in which a diagram is drawn)')
  .option('-t, --title <title>', 'content of <title></title> in the HTML', 'Flow Diagram')
  .option('-m, --minify', 'minify the HTML')
  .action(async cmd => {
    const spinner = ora({text: 'Generating diagram', stream: process.stdout}).start();

    try {
      validateOptions(cmd);

      let data = await readFileAsync(cmd.input, 'utf8');
      validateRawData(data);

      data = JSON.parse(data);
      validateParsedData(data);

      let html = await generateHTML(data, cmd.title);

      if (cmd.minify) {
        const minifyOptions = {
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: text => Terser.minify(text).code
        };
        html = HTMLMinifier.minify(html, minifyOptions);
      }

      await mkdirAsync(path.dirname(cmd.output), {recursive: true});
      await writeFileAsync(cmd.output, html);
    } catch (error) {
      spinner.stream = process.stderr;
      spinner.fail(error.message);
      process.exit(1);
    }

    spinner.succeed('Done');
  })
  .parse(process.argv);

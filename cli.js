#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const program = require('commander');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

const validation = cmd => {
  if (cmd.input === undefined) {
    console.error("No value provided for required options '--input'");
    process.exit(1);
  }

  if (cmd.output === undefined) {
    console.error("No value provided for required options '--output'");
    process.exit(1);
  }
};

const generateHTML = async (nodes, edges) => {
  const css = await readFileAsync('./assets/vis-network.min.css', 'utf8');
  const js = await readFileAsync('./assets/vis-network.min.js', 'utf8');

  return `<!DOCTYPE HTML>
<html>
  <head>
    <title>Transition Diagram</title>
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

      const nodes = JSON.parse('${JSON.stringify(nodes)}');

      nodes.forEach(function (node, index) {
        if (node.level === undefined) {
          node.level = index;
        }
      });

      const edges = JSON.parse('${JSON.stringify(edges)}');

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

program
  .version('0.1.0', '-v, --version')
  .option('-i, --input <input>', 'path of a JSON file in which the transitions are defined')
  .option('-o, --output <output>', 'path of a generated HTML file')
  .action(async cmd => {
    validation(cmd);

    const data = await readFileAsync(cmd.input, 'utf8');
    const transitions = JSON.parse(data);
    const {nodes, edges} = transitions;
    const html = await generateHTML(nodes, edges);

    await mkdirAsync(path.dirname(cmd.output), {recursive: true});
    await writeFileAsync(cmd.output, html);
  })
  .parse(process.argv);

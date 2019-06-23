'use strict';

module.exports = {
  validateCommandOptions: options => {
    if (options.input === undefined) {
      throw new Error("No value provided for required options: '--input'");
    }

    if (options.output === undefined) {
      throw new Error("No value provided for required options: '--output'");
    }
  },

  validateRawData: data => {
    if (data === '') {
      throw new Error("No value provided for required keys: 'nodes', 'edges'");
    }
  },

  validateParsedData: data => {
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
  }
};

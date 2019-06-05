'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const tmp = require('tmp');
const test = require('ava');
const execa = require('execa');

const cwd = __dirname;
const cli = (args, options) => execa(path.join(cwd, 'cli.js'), args, options);
const readFileAsync = promisify(fs.readFile);
const tmpDirAsync = promisify(tmp.dir);

tmp.setGracefulCleanup();

test('given `--input` and `--output` options', async t => {
  const transitionsFile = path.join(cwd, 'examples', 'transitions.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await cli(['--input', transitionsFile, '--output', diagramFile]);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'examples', 'diagram.html'), 'utf8');
  t.is(actual, expected);
  t.is(code, 0);
  t.is(stdout, '');
  t.is(stderr, '');
});

test('given `--input` and `--output` and `--minify` options', async t => {
  const transitionsFile = path.join(cwd, 'examples', 'transitions.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await cli(['--input', transitionsFile, '--output', diagramFile, '--minify']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'examples', 'diagram_minified.html'), 'utf8');
  t.is(actual, expected);
  t.is(code, 0);
  t.is(stdout, '');
  t.is(stderr, '');
});

test('given `--input` option', async t => {
  const transitionsFile = path.join(cwd, 'examples', 'transitions.json');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', transitionsFile]));

  t.is(code, 1);
  t.is(stdout, '');
  t.is(stderr, "No value provided for required options '--output'\n");
});

test('given `--output` option', async t => {
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '');
  t.is(stderr, "No value provided for required options '--input'\n");
});

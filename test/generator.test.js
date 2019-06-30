'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const tmp = require('tmp');
const test = require('ava');
const nock = require('nock');
const Generator = require('../src/generator');

const cwd = __dirname;
const readFileAsync = promisify(fs.readFile);
const tmpDirAsync = promisify(tmp.dir);

nock.disableNetConnect();
tmp.setGracefulCleanup();

test('#readJSON given https `input` and `output`', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const flowFileURL = 'https://example.com/flow.json';
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  nock('https://example.com')
    .get('/flow.json')
    .replyWithFile(200, flowFile);

  const generator = new Generator({input: flowFileURL, output: diagramFile});
  await generator.readJSON();

  const flowFileContent = await readFileAsync(flowFile, 'utf8');
  t.is(generator.data, flowFileContent);
  t.true(nock.isDone());
});

test('#readJSON given http `input` and `output`', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const flowFileURL = 'http://example.com/flow.json';
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  nock('http://example.com')
    .get('/flow.json')
    .replyWithFile(200, flowFile);

  const generator = new Generator({input: flowFileURL, output: diagramFile});
  await generator.readJSON();

  const flowFileContent = await readFileAsync(flowFile, 'utf8');
  t.is(generator.data, flowFileContent);
  t.true(nock.isDone());
});
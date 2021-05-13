'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const tmp = require('tmp');
const test = require('ava');
const execa = require('execa');
const pkg = require('../package.json');

const cwd = __dirname;
const cli = (args, options) => execa(path.join(cwd, '..', 'src', 'cli.js'), args, options);
const readFileAsync = promisify(fs.readFile);
const temporaryDirAsync = promisify(tmp.dir);

const helpText = `Usage: skyebridge [options]

Options:
  -v, --version          output the version number
  -i, --input <input>    input file path or URL (JSON in which a flow is defined)
  -o, --output <output>  output file path (HTML in which a diagram is drawn)
  -t, --title <title>    content of <title></title> in the HTML (default: "Flow Diagram")
  -m, --minify           minify the HTML
  -c, --cdn              minify JavaScript in the HTML by using CDN (works only online)
  -h, --help             output usage information`;

tmp.setGracefulCleanup();

test('given `--input` and `--output` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile]);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, and `--title` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');
  const title = 'Test Diagram';

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--title', title]);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram_title_changed.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, and `--minify` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--minify']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram_minified.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, and `--cdn` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--cdn']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram_cdn.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, `--title`, and `--minify` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');
  const title = 'Test Diagram';

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--title', title, '--minify']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram_title_changed_minified.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, `--title`, and `--cdn` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');
  const title = 'Test Diagram';

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--title', title, '--cdn']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram_title_changed_cdn.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, `--minify`, and `--cdn` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--minify', '--cdn']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram_minified_cdn.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, `--title`, `--minify`, and `--cdn` options', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');
  const title = 'Test Diagram';

  const {exitCode, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--title', title, '--minify', '--cdn']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'fixtures', 'output', 'diagram_title_changed_minified_cdn.html'), 'utf8');
  t.is(actual, expected);
  t.is(exitCode, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input` option', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow.json');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--output'$/);
});

test('given `--output` option', async t => {
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--input'$/);
});

test('given `--title` option', async t => {
  const title = 'Test Diagram';

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--title', title]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--input'$/);
});

test('given `--minify` option', async t => {
  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--minify']));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--input'$/);
});

test('given `--input` with non-existent path', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'test.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, new RegExp(`^(✖|×) ENOENT: no such file or directory, open '${flowFile.replace(/\\/g, '\\\\')}'$`));
});

test('given `--input` with invalid keys (`nodes`)', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow_no_nodes.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes'$/);
});

test('given `--input` with invalid keys (`nodes.id`)', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow_no_nodes_id.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes.id'$/);
});

test('given `--input` with invalid keys (`nodes.label`)', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow_no_nodes_label.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes.label'$/);
});

test('given `--input` with invalid keys (`edges`)', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow_no_edges.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'edges'$/);
});

test('given `--input` with invalid keys (`edges.from`)', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow_no_edges_from.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'edges.from'$/);
});

test('given `--input` with invalid keys (`edges.to`)', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow_no_edges_to.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'edges.to'$/);
});

test('given `--input` with invalid keys (`nodes` and `edges`)', async t => {
  const flowFile = path.join(cwd, 'fixtures', 'input', 'flow_empty.json');
  const temporaryDir = await temporaryDirAsync({unsafeCleanup: true});
  const diagramFile = path.join(temporaryDir, 'test', 'diagram.html');

  const {exitCode, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(exitCode, 1);
  t.is(stdout, '- Generating diagram');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes', 'edges'$/);
});

test('given `--version` option', async t => {
  const {exitCode, stdout, stderr} = await cli(['--version']);

  t.is(exitCode, 0);
  t.is(stdout, pkg.version);
  t.is(stderr, '');
});

test('given `--help` option', async t => {
  const {exitCode, stdout, stderr} = await cli(['--help']);

  t.is(exitCode, 0);
  t.is(stdout, helpText);
  t.is(stderr, '');
});

test('given no options', async t => {
  const {exitCode, stdout, stderr} = await cli([]);

  t.is(exitCode, 0);
  t.is(stdout, helpText);
  t.is(stderr, '');
});

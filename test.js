'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const tmp = require('tmp');
const test = require('ava');
const execa = require('execa');
const pkg = require('./package.json');

const cwd = __dirname;
const cli = (args, options) => execa(path.join(cwd, 'cli.js'), args, options);
const readFileAsync = promisify(fs.readFile);
const tmpDirAsync = promisify(tmp.dir);

const helpText = `Usage: skyebridge [options]

Options:
  -v, --version          output the version number
  -i, --input <input>    path of a JSON file in which the flow is defined
  -o, --output <output>  path of a generated HTML file
  -t, --title <title>    content of <title></title> in the generated HTML (default: "Flow Diagram")
  -m, --minify           minify the generated HTML
  -h, --help             output usage information`;

tmp.setGracefulCleanup();

test('given `--input` and `--output` options', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile]);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'examples', 'diagram.html'), 'utf8');
  t.is(actual, expected);
  t.is(code, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, and `--minify` options', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--minify']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'examples', 'diagram_minified.html'), 'utf8');
  t.is(actual, expected);
  t.is(code, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, and `--title` options', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');
  const title = 'Test Diagram';

  const {code, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--title', title]);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'examples', 'diagram_title_changed.html'), 'utf8');
  t.is(actual, expected);
  t.is(code, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input`, `--output`, `--title`, and `--minify` options', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');
  const title = 'Test Diagram';

  const {code, stdout, stderr} = await cli(['--input', flowFile, '--output', diagramFile, '--title', title, '--minify']);

  const actual = await readFileAsync(diagramFile, 'utf8');
  const expected = await readFileAsync(path.join(cwd, 'examples', 'diagram_title_changed_minified.html'), 'utf8');
  t.is(actual, expected);
  t.is(code, 0);
  t.regex(stdout, /^- Generating diagram\n(✔|√) Done$/);
  t.is(stderr, '');
});

test('given `--input` option', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow.json');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--output'\n$/);
});

test('given `--output` option', async t => {
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--input'\n$/);
});

test('given `--title` option', async t => {
  const title = 'Test Diagram';

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--title', title]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--input'\n$/);
});

test('given `--minify` option', async t => {
  const {code, stdout, stderr} = await t.throwsAsync(cli(['--minify']));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required options: '--input'\n$/);
});

test('given `--input` with non-existent path', async t => {
  const flowFile = path.join(cwd, 'examples', 'test.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, new RegExp(`^(✖|×) ENOENT: no such file or directory, open '${flowFile.replace(/\\/g, '\\\\')}'\n$`));
});

test('given `--input` with invalid keys (`nodes`)', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow_no_nodes.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes'\n$/);
});

test('given `--input` with invalid keys (`nodes.id`)', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow_no_nodes_id.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes.id'\n$/);
});

test('given `--input` with invalid keys (`nodes.label`)', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow_no_nodes_label.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes.label'\n$/);
});

test('given `--input` with invalid keys (`edges`)', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow_no_edges.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'edges'\n$/);
});

test('given `--input` with invalid keys (`edges.from`)', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow_no_edges_from.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'edges.from'\n$/);
});

test('given `--input` with invalid keys (`edges.to`)', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow_no_edges_to.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'edges.to'\n$/);
});

test('given `--input` with invalid keys (`nodes` and `edges`)', async t => {
  const flowFile = path.join(cwd, 'examples', 'flow_empty.json');
  const tmpDir = await tmpDirAsync({dir: cwd, unsafeCleanup: true});
  const diagramFile = path.join(tmpDir, 'test', 'diagram.html');

  const {code, stdout, stderr} = await t.throwsAsync(cli(['--input', flowFile, '--output', diagramFile]));

  t.is(code, 1);
  t.is(stdout, '- Generating diagram\n');
  t.regex(stderr, /^(✖|×) No value provided for required keys: 'nodes', 'edges'\n$/);
});

test('given `--version` option', async t => {
  const {code, stdout, stderr} = await cli(['--version']);

  t.is(code, 0);
  t.is(stdout, pkg.version);
  t.is(stderr, '');
});

test('given `--help` option', async t => {
  const {code, stdout, stderr} = await cli(['--help']);

  t.is(code, 0);
  t.is(stdout, helpText);
  t.is(stderr, '');
});

test('given no options', async t => {
  const {code, stdout, stderr} = await cli([]);

  t.is(code, 0);
  t.is(stdout, helpText);
  t.is(stderr, '');
});

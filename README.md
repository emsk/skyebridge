# skyebridge

[![Build Status](https://travis-ci.org/emsk/skyebridge.svg?branch=master)](https://travis-ci.org/emsk/skyebridge)
[![Build status](https://ci.appveyor.com/api/projects/status/t4f8lvatqdb3l4kj?svg=true)](https://ci.appveyor.com/project/emsk/skyebridge)

skyebridge is a command-line tool to generate an interactive flow diagram from a JSON file.

![Skye Bridge](skyebridge.jpg?raw=true)

## Installation

```sh
$ git clone https://github.com/emsk/skyebridge.git
$ cd skyebridge
$ npm link
```

## Usage

```sh
$ skyebridge --input flow.json --output diagram.html
```

## Command Options

| Option | Alias | Description | Default | Required |
| :----- | :---- | :---------- | :------ | :------- |
| `--input` | `-i` | Path of a JSON file in which the flow is defined. | | Yes |
| `--output` | `-o` | Path of a generated HTML file. | | Yes |
| `--title` | `-t` | Content of `<title></title>` in the generated HTML. | `Flow Diagram` | No |
| `--minify` | `-m` | Minify the generated HTML. | | No |

## Example

Input file (A JSON file in which flow is defined):

```json
{
  "nodes": [
    {"id": 1, "label": "Page 1"},
    {"id": 2, "label": "Page 2"},
    {"id": 3, "label": "Page 3", "level": 0},
    {"id": 4, "label": "Page 4", "level": 1},
    {"id": 5, "label": "Page 5", "level": 2},
    {"id": 6, "label": "Page 6", "level": 3},
    {"id": 7, "label": "Page 7", "level": 4}
  ],
  "edges": [
    {"from": 1, "to": 1, "label": "search"},
    {"from": 1, "to": 2, "label": "select"},
    {"from": 1, "to": 3},
    {"from": 2, "to": 4, "label": "open"},
    {"from": 2, "to": 5},
    {"from": 4, "to": 2, "label": "close"},
    {"from": 5, "to": 6},
    {"from": 6, "to": 7}
  ]
}
```

Output file (An HTML file in which a flow diagram is drawn):

![Diagram](examples/diagram.png?raw=true)

The nodes are freely draggable.

Try [this example](examples/diagram.html).

## License

[MIT](LICENSE)

# skyebridge

skyebridge is a command-line tool to generate an interactive transition diagram from a JSON file.

![Skye Bridge](skyebridge.jpg?raw=true)

## Installation

WIP

## Usage

WIP

## Example

Input file (A JSON file in which transitions are defined):

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

Output file (An HTML file in which a transition diagram is drawn):

![Diagram](examples/diagram.png?raw=true)

The nodes are freely draggable.

Try [this example](examples/diagram.html).

## License

[MIT](LICENSE)

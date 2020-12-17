# Path finding Visualization

![alt text](./assets/img.png "Path finding algorithms")

This project aims to visualize path-finding algorithm using p5js.  

Check out demo on: https://youtu.be/7U1ZJefZf6s

## Setup 
```bash
$ git clone https://github.com/vi88i/pfviz.git && cd pfviz
$ npm install
$ node app.js
```

## Algorithms

| *Name*            |     *Feature*  |
|----------------|:-------------:|
| A* 8-way movement | Uses Diagonal heuristic cost |
| A* 8-way movement | Uses Manhattan distance as heuristic cost |
| Dijkstra | Special case of A* when h(n) =0 |
| Best First Search | Special case of A* when g(n) = 0 |
| Maze generator | Uses Kruskal's algorithm |

"use strict";

const WIDTH = 1300; // width of canvas 
const HEIGHT = 640;  // height of canvas
const GRID_SIZE = 20; // grid size
const DIAMETER = GRID_SIZE; // radius of source and destination
const DRAW_OBSTACLES = 0; // track mouse drag for drawing obstacles when mode 0
const ERASE_OBSTACLES = -1; // track mouse drag for erase obstacles when mode -1
const MARK_SOURCE = 1; // track mouse release for marking source node when mode 1
const MARK_DESTINATION = 2; // track mouse release for marking goal nide when mode 2
const COST_OF_DIAGONAL = 1.4; // ~ sqrt(2) - // distance to move from parent to any adjacent (NE, NW, SE, SW) nodes
const COST_OF_NON_DIAGONAL = 1; // distance to move from parent to any adjacent (North, South, East, West) nodes
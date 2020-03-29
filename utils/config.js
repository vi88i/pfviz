"use strict";

const WIDTH = 1300; // width of canvas 
const HEIGHT = 640;  // height of canvas
const GRID_SIZE = 20; // grid size
const DIAMETER = GRID_SIZE; // radius of source and destination
const DRAW_OBSTACLES = 0;
const ERASE_OBSTACLES = -1;
const MARK_SOURCE = 1;
const MARK_DESTINATION = 2;
const COST_OF_DIAGONAL = 1.4;
const COST_OF_NON_DIAGONAL = 1;
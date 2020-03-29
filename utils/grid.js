async function delay(delayInms) { // implementation of delay
    return new Promise(resolve  => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
}

// union find algorithm implemented using array based disjoint set
class UnionFind {
    constructor() {
        this.parent = [];
    }
    makeSet(idx) {
        this.parent[idx] = idx;
    }
    find(x) {
        if(this.parent[x] == x)
            return x;
        return this.find(this.parent[x]);    
    }
    union(x, y) {
        let xRoot = this.find(x);
        let yRoot = this.find(y);
        this.parent[xRoot] = yRoot;
    }
}

// mutex to prevent multiple activities when one process is runnning
class Mutex {
    constructor() {
        this.key = false;
    }
    hold() {
        if(this.key !=true)
            this.key = true;
    }
    release() {
        if(this.key != false)
            this.key = false;
    }
}

// represents an edge - from, to are linear indexes of the grid
class Edge {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}

// custom (two metrics will decide heapification, fast look up using Sets) min heap implementation for A*
class MinHeap {
    constructor() {
        this.heap = [];
        this.heap.push(-1);
        this.set = new Set();
    }
    has(key) {
        return this.set.has(key);
    }
    getNodeAndIdx(key) { // find node having specific key value
        for(let i=1;i<this.heap.length;i++) {
            if(key.localeCompare(this.heap[i].key) == 0)
                return [this.heap[i], i];
        }
    }
    updateNode(node, idx) { // perform upward heapification from idx
        this.heap[idx] = node;
        let childIdx = idx;
        let parentIdx = Math.floor(childIdx/2);
        let tmp;
        while(this.heap[childIdx].f < this.heap[parentIdx].f) {
            tmp = this.heap[childIdx];
            this.heap[childIdx] = this.heap[parentIdx];
            this.heap[parentIdx] = tmp;
            childIdx = parentIdx;
            parentIdx = Math.floor(childIdx/2);
        }          
    }
    add(node) { // add node to the end of the array and perform upward heapification
        this.heap.push(node);
        this.set.add(node.key);
        let childIdx = this.heap.length-1;
        let parentIdx = Math.floor(childIdx/2);
        let tmp;
        while(this.heap[childIdx].f < this.heap[parentIdx].f) {
            tmp = this.heap[childIdx];
            this.heap[childIdx] = this.heap[parentIdx];
            this.heap[parentIdx] = tmp;
            childIdx = parentIdx;
            parentIdx = Math.floor(childIdx/2);
        }        
    }
    size() {
        return this.heap.length-1;
    }
    get() { // removes the node on top of stack and re-heapifies the heap.
        let res = this.heap[1];
        this.heap[1] = this.heap[this.heap.length-1];
        this.set.delete(res.key);
        this.heap.pop();
        let tmp_heap = this.heap;
        this.heap = [];
        this.heap.push(-1);
        this.set = new Set();
        for(let i=1;i<tmp_heap.length;i++) {
            this.add(tmp_heap[i]);
        }
        return res;
    }
}

class Obstacle { // (x, y) represents the top left co-ordinate of cell (square)
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y; // (x, y) represents the top left co-ordinate of cell (square)
        this.parent = null; // points to parent node
        this.f = 0; // heuristic loss
        this.g = 0; // base cost
        this.h = 0; // sum of g + h 
        this.key = x+','+y; // key is useful for quick lookup in min-heap
    }
}

class PathFinder {
    constructor(source, goal, cc) {
        this.source = source; // source co-ordinate (top left co-ordinate of source cell)
        this.goal = goal; // source co-ordinate (top left co-ordinate of goal cell)
        this.open = new MinHeap(); // open list - potential next node to jump based on f cost
        this.close = new Map(); // closed list - won't be visited again
        this.reached = 0; // flag for result check
        this.distance = 0; // measure distance from goal to destination
        this.cc = cc; // color scheme for path
        // color scheme is also used as flag to animate open and closed list, check further
    }
    isGoalNode(node) { // checks if current node goal cell
        return node.x == this.goal.x && node.y == this.goal.y;
    }
    isNodeInRange(p, dir) { // checks if neighbouring cell is in range as defined in config.js
        return ((p.x+dir[0]) >= 0) && ((p.x+dir[0]) < WIDTH) && ((p.y+dir[1]) >= 0) && ((p.y+dir[1]) < HEIGHT);        
    }    
    async renderLists() { // animates closed and open list
        if(this.cc.localeCompare('rgb(0, 0, 0)') == 0) {
            let node;
            for(let node of this.close.values()) {
                if((node.x == this.source.x) && (node.y == this.source.y))
                    continue;
                fill('rgb(240, 240, 255)');
                square(node.x, node.y, GRID_SIZE);            
            }
            for(let i=1;i<this.open.heap.length;i++) {
                node = this.open.heap[i];
                if((node.x == this.goal.x) && (node.y == this.goal.y))
                    continue;
                fill('rgb(0, 255, 255)');
                square(node.x, node.y, GRID_SIZE);                
            }        
            await delay(5);
        }
    }
    isDiagonalNode(parent, node) { // checks if node is diagonally adjacent
        let directions = [  [-1*GRID_SIZE, -1*GRID_SIZE],
                            [1*GRID_SIZE, -1*GRID_SIZE],
                            [-1*GRID_SIZE, 1*GRID_SIZE],
                            [1*GRID_SIZE, 1*GRID_SIZE] 
                        ];
        for(let i=0; i<directions.length;i++) {
            let dir = [directions[i][0], directions[i][1]];
            if(this.isNodeInRange(parent, dir) == true) {
                if((node.x == (parent.x+dir[0])) && (node.y == (parent.y+dir[1])))
                    return true;
            }
        }    
        return false;                    
    }
    async renderLine(node) { // uses recursion to draw line from source to goal
        if(node == null || node.parent == null)
            return;
        else {
            await this.renderLine(node.parent);
            strokeWeight(4);
            stroke(this.cc);
            line(node.x+GRID_SIZE/2, node.y+GRID_SIZE/2, node.parent.x+GRID_SIZE/2, node.parent.y+GRID_SIZE/2);
            strokeWeight(1);
            if(this.isDiagonalNode(node.parent, node) == true)
                this.distance = this.distance + 1.4;
            else
                this.distance = this.distance + 1;
            await delay(5);
        }    
    }
}

class AStar4 extends PathFinder {
    constructor(source, goal, cc='rgb(0, 0, 0)') {
        super(source, goal, cc);
    }
    ManhattanDistance(node) {
        /* 
            1.1 is specifically tuned for this plot, you can change as you wish
            Some findings:
                if you multiply anything less than 1, it behaves like 4-way dijkstra's
        */ 
        return 1.1 * (Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y));
    }             
    createNode(p, dir) { // creates a node, based on parent node and direction
        let node = new Node(p.x+dir[0], p.y+dir[1]);
        node.g = p.g + GRID_SIZE;
        node.h = this.ManhattanDistance(node);
        node.f = node.g + node.h; 
        node.parent = p;
        return node;        
    }   
    async start(obstacle_map) {
        let p, node, tmp, dir;
        let directions = [  [0, 1*GRID_SIZE],
                            [0, -1*GRID_SIZE],
                            [1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, 0] 
                        ];        
        this.source.f = this.source.g + this.ManhattanDistance(source);                
        this.open.add(source);                                
        while(this.open.size()!=0) {
            p = this.open.get();
            await this.renderLists();
            if(this.isGoalNode(p)) {
                this.reached = 1;
                await this.renderLine(p).then(() => {
                    if(this.cc.localeCompare('rgb(0, 0, 0)') != 0) { 
                        if(this.reached == 1)
                            document.getElementById('distance_a4').innerText = this.distance.toFixed(1);
                        else    
                            document.getElementById('distance_a4').innerText = Infinity;
                    }                           
                });
                return;   
            }
            this.close.set(p.key, p);
            for(let i=0; i<directions.length;i++) {
                dir = [directions[i][0], directions[i][1]];
                if(this.isNodeInRange(p, dir)) {
                    node = this.createNode(p, dir);
                    if(obstacle_map.has(node.key) == false) {              
                        if(this.close.has(node.key) == false) {
                            if(this.open.has(node.key) == false) {
                                this.open.add(node);
                            } else {
                                tmp = this.open.getNodeAndIdx(node.key);
                                if(tmp[0].g > node.g) { 
                                    this.open.updateNode(node, tmp[1]);
                                }   
                            }
                        }   
                    }
                }
            }             
        }       
    }    
}

class AStar8 extends PathFinder {
    constructor(source, goal, cc='rgb(0, 0, 0)') {
        super(source, goal, cc);
    }
    max(i, j) {
        if(i >= j)
            return i;
        return j;    
    }
    min(i, j) {        
        if(i < j)
            return i;
        return j;    
    }
    // source - https://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
    DiagonalHeuristic(node) {
        let h_diagonal = COST_OF_DIAGONAL*this.min(Math.abs(node.x-this.goal.x), Math.abs(node.y-this.goal.y));
        let h_straight = COST_OF_NON_DIAGONAL*(this.max(Math.abs(node.x-this.goal.x), Math.abs(node.y-this.goal.y)) - 
                        this.min(Math.abs(node.x-this.goal.x), Math.abs(node.y-this.goal.y))); 
        return h_diagonal + h_straight;
                         
    }   
    findGCost(dir) { 
        /* 
            In 8-way movement diagonally moving should be penalized more.
            If both adjacent and digonal movement weighted equally, you will get a highly zig-zag pattern and less smooth 
        */ 
        if(dir[0] == 0 || dir[1] == 0)
            return GRID_SIZE;
        return 1.4*GRID_SIZE;    
    }
    createNode(p, dir) {
        let node = new Node(p.x+dir[0], p.y+dir[1]);
        node.g = p.g + this.findGCost(dir);
        node.h = this.DiagonalHeuristic(node);
        node.f = node.g + node.h; 
        node.parent = p;
        return node;        
    }
    async start(obstacle_map) {
        let p, node, tmp, dir;
        let directions = [  [0, 1*GRID_SIZE],
                            [0, -1*GRID_SIZE],
                            [1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, -1*GRID_SIZE],
                            [1*GRID_SIZE, -1*GRID_SIZE],
                            [-1*GRID_SIZE, 1*GRID_SIZE],
                            [1*GRID_SIZE, 1*GRID_SIZE] 
                        ];        
        this.source.f = this.source.g + this.DiagonalHeuristic(source);                
        this.open.add(source);                                
        while(this.open.size()!=0) {
            p = this.open.get();
            await this.renderLists();
            if(this.isGoalNode(p)) {
                this.reached = 1;
                await this.renderLine(p).then(() => {
                    if(this.cc.localeCompare('rgb(0, 0, 0)') != 0) {
                        if(this.reached == 1)
                            document.getElementById('distance_a8').innerText = this.distance.toFixed(1);
                        else
                            document.getElementById('distance_a8').innerText = Infinity;
                    }   
                });                      
                return;   
            }
            this.close.set(p.key, p);
            for(let i=0; i<directions.length;i++) {
                dir = [directions[i][0], directions[i][1]];
                if(this.isNodeInRange(p, dir)) {
                    node = this.createNode(p, dir);
                    if(obstacle_map.has(node.key) == false) {              
                        if(this.close.has(node.key) == false) {
                            if(this.open.has(node.key) == false) {
                                this.open.add(node);
                            } else {
                                tmp = this.open.getNodeAndIdx(node.key);
                                if(tmp[0].g > node.g) { 
                                    this.open.updateNode(node, tmp[1]);
                                }   
                            }
                        }   
                    }
                }
            }              
        }       
    }    
}

class Dijkstra extends PathFinder {
    constructor(source, goal, cc='rgb(0, 0, 0)') {
        super(source, goal, cc);
    }
    findGCost(dir) {
        if(dir[0] == 0 || dir[1] == 0)
            return GRID_SIZE;
        return 1.4*GRID_SIZE;    
    }    
    createNode(p, dir) {
        let node = new Node(p.x+dir[0], p.y+dir[1]);
        node.g = p.g + this.findGCost(dir);
        node.h = 0; // In dijkstra' heuristic is always zero, that's it!
        node.f = node.g + node.h; 
        node.parent = p;
        return node;        
    }
    async start(obstacle_map) {
        let p, node, tmp, dir;
        let directions = [  [0, 1*GRID_SIZE],
                            [0, -1*GRID_SIZE],
                            [1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, -1*GRID_SIZE],
                            [1*GRID_SIZE, -1*GRID_SIZE],
                            [-1*GRID_SIZE, 1*GRID_SIZE],
                            [1*GRID_SIZE, 1*GRID_SIZE] 
                        ];        
        this.source.f = this.source.g + 0;                 
        this.open.add(source);                                
        while(this.open.size()!=0) {
            p = this.open.get();
            await this.renderLists();
            if(this.isGoalNode(p)) {
                this.reached = 1;    
                await this.renderLine(p).then(() => {
                    if(this.cc.localeCompare('rgb(0, 0, 0)') != 0) {
                        if(this.reached == 1)
                            document.getElementById('distance_d').innerText = this.distance.toFixed(1);
                        else
                            document.getElementById('distance_d').innerText = Infinity;    
                    }                                 
                });        
                return;   
            }
            this.close.set(p.key, p);
            for(let i=0; i<directions.length;i++) {
                dir = [directions[i][0], directions[i][1]];
                if(this.isNodeInRange(p, dir)) {
                    node = this.createNode(p, dir);
                    if(obstacle_map.has(node.key) == false) {              
                        if(this.close.has(node.key) == false) {
                            if(this.open.has(node.key) == false) {
                                this.open.add(node);
                            } else {
                                tmp = this.open.getNodeAndIdx(node.key);
                                if(tmp[0].g > node.g) { 
                                    this.open.updateNode(node, tmp[1]);
                                }   
                            }
                        }   
                    }
                }
            }               
        }       
    }    
}

class BestFirstSearch extends PathFinder {
    constructor(source, goal, cc='rgb(0, 0, 0)') {
        super(source, goal, cc);
    }
    max(i, j) {
        if(i >= j)
            return i;
        return j;    
    }
    min(i, j) {        
        if(i < j)
            return i;
        return j;    
    }    
    DiagonalHeuristic(node) {
        let h_diagonal = COST_OF_DIAGONAL*this.min(Math.abs(node.x-this.goal.x), Math.abs(node.y-this.goal.y));
        let h_straight = COST_OF_NON_DIAGONAL*(this.max(Math.abs(node.x-this.goal.x), Math.abs(node.y-this.goal.y)) - 
                        this.min(Math.abs(node.x-this.goal.x), Math.abs(node.y-this.goal.y))); 
        return h_diagonal + h_straight;
                         
    }
    createNode(p, dir) {
        let node = new Node(p.x+dir[0], p.y+dir[1]);
        node.g = p.g + 0; // In best first search g cost is always zero, that's it!
        node.h = this.DiagonalHeuristic(node);
        node.f = node.g + node.h; 
        node.parent = p;
        return node;        
    }
    async start(obstacle_map) {
        let p, node, tmp, dir;
        let directions = [  [0, 1*GRID_SIZE],
                            [0, -1*GRID_SIZE],
                            [1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, -1*GRID_SIZE],
                            [1*GRID_SIZE, -1*GRID_SIZE],
                            [-1*GRID_SIZE, 1*GRID_SIZE],
                            [1*GRID_SIZE, 1*GRID_SIZE] 
                        ];        
        this.source.f = this.source.g + this.DiagonalHeuristic(source);                
        this.open.add(source);                                
        while(this.open.size()!=0) {
            p = this.open.get();
            await this.renderLists();                
            if(this.isGoalNode(p)) {
                this.reached = 1;
                await this.renderLine(p).then(() => {
                    if(this.cc.localeCompare('rgb(0, 0, 0)') != 0) {
                        if(this.reached == 1)
                            document.getElementById('distance_b').innerText = this.distance.toFixed(1);
                        else    
                            document.getElementById('distance_b').innerText = Infinity;
                    }   
                });                      
                return;   
            }
            this.close.set(p.key, p);
            for(let i=0; i<directions.length;i++) {
                dir = [directions[i][0], directions[i][1]];
                if(this.isNodeInRange(p, dir)) {
                    node = this.createNode(p, dir);
                    if(obstacle_map.has(node.key) == false) {              
                        if(this.close.has(node.key) == false) {
                            if(this.open.has(node.key) == false) {
                                this.open.add(node);
                            } else {
                                tmp = this.open.getNodeAndIdx(node.key);
                                if(tmp[0].g > node.g) { 
                                    this.open.updateNode(node, tmp[1]);
                                }   
                            }
                        }   
                    }
                }
            }               
        }       
    }    
}
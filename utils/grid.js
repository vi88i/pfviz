async function delay(delayInms) {
    return new Promise(resolve  => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
}

class Mutex {
    constructor() {
        this.key = false;
    }
    hold() {
        this.key = true;
    }
    release() {
        this.key = false;
    }
}

class Edge {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}

class MinHeap {
    constructor() {
        this.heap = [];
        this.heap.push(-1);
        this.set = new Set();
    }
    has(key) {
        return this.set.has(key);
    }
    getIdx(key) { // currently O(n), can be improved to O(log(n))
        for(let i=1;i<this.heap.length;i++) {
            if(key.localeCompare(this.heap[i].key) == 0) {
                return [this.heap[i], i];
            }
        }
    }
    set(node, idx) { // perform upward heapification from idx
        this.heap[idx] = node;
        let childIdx = idx;
        let parentIdx = Math.floor(childIdx/2);
        let tmp;
        while(parentIdx > 1 && (this.heap[childIdx].f <= this.heap[parentIdx].f)) {
            if(this.heap[childIdx].f == this.heap[parentIdx].f) {
                if(this.heap[childIdx].h > this.heap[parentIdx].h) {
                    break;
                }
            } 
            tmp = this.heap[childIdx];
            this.heap[childIdx] = this.heap[parentIdx];
            this.heap[parentIdx] = tmp;
            childIdx = parentIdx;
            parentIdx = Math.floor(childIdx/2);
        }          
    }
    add(node) {
        this.heap.push(node);
        this.set.add(node.key);
        let childIdx = this.heap.length-1;
        let parentIdx = Math.floor(childIdx/2);
        let tmp;
        while(parentIdx > 1 && (this.heap[childIdx].f <= this.heap[parentIdx].f)) {
            if(this.heap[childIdx].f == this.heap[parentIdx].f) {
                if(this.heap[childIdx].h > this.heap[parentIdx].h) {
                    break;
                }
            } 
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
    minIdx(idx, n) {
        let left_child = 2*idx;
        let right_child = 2*idx+1;
        let left_exp = (left_child <= n) && (this.heap[left_child].f <= this.heap[n].f);
        let right_exp = (right_child <= n) && (this.heap[right_child].f <= this.heap[n].f);

        if(left_exp == true && right_exp == true) {
            if(this.heap[left_child].f < this.heap[right_child].f) {
                return left_child;
            } else if(this.heap[left_child].f > this.heap[right_child].f) {
                return right_child;
            } else {
                if(this.heap[left_child].h <= this.heap[right_child].h) {
                    return left_child;
                } else {
                    return right_child;
                }
            }
        } else if(left_exp == true) {
            return left_child;
        } else if(right_exp == true) {
            return right_child;
        } else {
            return -1;
        }
    }
    get() {
        let res = this.heap[1];
        this.set.delete(res.key);
        this.heap[1] = this.heap[this.heap.length-1];
        this.heap.pop();
        if(this.heap.length > 2) {
            let parentIdx = 1;
            let childIdx, tmp;
            while((childIdx=this.minIdx(parentIdx, this.heap.length-1))!=-1) {
                tmp = this.heap[childIdx];
                this.heap[childIdx] = this.heap[parentIdx];
                this.heap[parentIdx] = tmp;
                parentIdx = childIdx;                    
            }
        }
        return res;
    }
}

class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.parent = null;
        this.h = 0;
        this.g = 0;
        this.f = 0;
        this.key = x+','+y;
    }
}

class PathFinder {
    constructor(source, goal) {
        this.source = source;
        this.goal = goal;
        this.open = new MinHeap();
        this.close = new Map();
        this.reached = 0;
    }
    isGoalNode(node) {
        return node.x == this.goal.x && node.y == this.goal.y;
    }
    async renderLists() {
        let node;
        for(let i=1;i<this.open.heap.length;i++) {
            node = this.open.heap[i];
            if(node.x == this.goal.x && node.y == this.goal.y)
                continue;
            fill('rgb(0, 255, 255)');
            square(node.x, node.y, GRID_SIZE);                
        }
        for(let node of this.close.values()) {
            if(node.x == this.source.x && node.y == this.source.y)
                continue;
            fill('rgb(240, 240, 255)');
            square(node.x, node.y, GRID_SIZE);            
        }
        await delay(5);
    }
    async renderLine(node) {
        if(node == null || node.parent == null)
            return;
        else {
            await this.renderLine(node.parent);
            strokeWeight(4);
            stroke('rgb(0, 0, 0)');
            line(node.x+GRID_SIZE/2, node.y+GRID_SIZE/2, node.parent.x+GRID_SIZE/2, node.parent.y+GRID_SIZE/2);
            strokeWeight(1);
            await delay(5);
        }    
    }
}

class AStar4 extends PathFinder {
    constructor() {
        super(source, goal);
    }
    ManhattanDistance(node) {
        return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
    }
    createNode(p, dir) {
        let node = new Node(p.x+dir[0], p.y+dir[1]);
        node.g = p.g + GRID_SIZE;
        node.h = this.ManhattanDistance(node);
        node.f = node.g + node.h; 
        node.parent = p;
        return node;        
    }            
    async start(obstacle_map) {
        let p, node, tmp, dir;
        // degree of movement = 4
        let directions = [  [0, 1*GRID_SIZE],
                            [0, -1*GRID_SIZE],
                            [1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, 0] 
                        ];        
        this.source.h = this.source.g + this.ManhattanDistance(source);                
        this.open.add(source);                                
        while(this.open.size()!=0) {
            p = this.open.get();
            if(this.isGoalNode(p)) {
                this.reached = 1;
                await this.renderLine(p);                
                return;   
            }
            this.close.set(p.key, p);
            for(let i=0; i<directions.length;i++) {
                dir = [directions[i][0], directions[i][1]];
                if(( ((p.x+dir[0]) >= 0) && ((p.x+dir[0]) < WIDTH)) && ((p.y+dir[1]) >= 0) && ((p.y+dir[1]) < HEIGHT)) {
                    if(obstacle_map.has((p.x+dir[0])+','+(p.y+dir[1])) == false) {
                        node = this.createNode(p, dir);              
                        if(this.close.has(node.key) == false) {
                            if(this.open.has(node.key) == false) {
                                this.open.add(node);
                            } else {
                                tmp = this.open.getIdx(node.key);
                                if(tmp[0].h < node.h) {
                                    this.open.set(node, tmp[1]);
                                }   
                            }
                        }   
                    }
                }
            }
            await this.renderLists();               
        }       
    }    
}

class AStar8 extends PathFinder {
    constructor(source, goal) {
        super(source, goal);
    }
    max(i, j) {
        i = Math.abs(i);
        j = Math.abs(j);
        if(i >= j)
            return i;
        return j;    
    }
    min(i, j) {
        i = Math.abs(i);
        j = Math.abs(j);        
        if(i < j)
            return i;
        return j;    
    }    
    DiagonalHeuristic(node) {
        return COST_OF_DIAGONAL*this.min(node.x-this.goal.x, node.y-this.goal.y) + 
                COST_OF_NON_DIAGONAL*(this.max(node.x-this.goal.x, node.y-this.goal.y) - this.min(node.x-this.goal.x, node.y-this.goal.y));         
    }        
    createNode(p, dir) {
        let node = new Node(p.x+dir[0], p.y+dir[1]);
        node.g = p.g + GRID_SIZE;
        node.h = this.DiagonalHeuristic(node);
        node.f = node.g + node.h; 
        node.parent = p;
        return node;        
    }    
    async start(obstacle_map) {
        let p, node, tmp, dir;
        // degree of movement = 4
        let directions = [  [0, 1*GRID_SIZE],
                            [0, -1*GRID_SIZE],
                            [1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, 0],
                            [-1*GRID_SIZE, -1*GRID_SIZE],
                            [1*GRID_SIZE, -1*GRID_SIZE],
                            [-1*GRID_SIZE, 1*GRID_SIZE],
                            [1*GRID_SIZE, 1*GRID_SIZE] 
                        ];        
        this.source.h = this.source.g + this.DiagonalHeuristic(source);                
        this.open.add(source);                                
        while(this.open.size()!=0) {
            p = this.open.get();
            if(this.isGoalNode(p)) {
                this.reached = 1;
                await this.renderLine(p);                
                return;   
            }
            this.close.set(p.key, p);
            for(let i=0; i<directions.length;i++) {
                dir = [directions[i][0], directions[i][1]];
                if(( ((p.x+dir[0]) >= 0) && ((p.x+dir[0]) < WIDTH)) && ((p.y+dir[1]) >= 0) && ((p.y+dir[1]) < HEIGHT)) {
                    if(obstacle_map.has((p.x+dir[0])+','+(p.y+dir[1])) == false) {
                        node = this.createNode(p, dir);              
                        if(this.close.has(node.key) == false) {
                            if(this.open.has(node.key) == false) {
                                this.open.add(node);
                            } else {
                                tmp = this.open.getIdx(node.key);
                                if(tmp[0].h < node.h) {
                                    this.open.set(node, tmp[1]);
                                }   
                            }
                        }   
                    }
                }
            }
            await this.renderLists();               
        }       
    }    
}

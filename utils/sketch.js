"use strict";

let obstacle_map = new Map();
let mode;
let source = new Node(-1, -1);
let goal = new Node(-1, -1);
let m = new Mutex();

function clearGrid() {
    obstacle_map = new Map();
    source = new Node(-1, -1);
    goal = new Node(-1, -1);    
}

function updateObstaclesCounter() {
    document.getElementById('num_obstacles').innerHTML = obstacle_map.size;
}

function isPointsInRange() {
    return (goal.x>=0 && goal.x<WIDTH) && (goal.y>= 0 && goal.y<HEIGHT) && 
    (source.x>=0 && source.x<WIDTH) && (source.y>= 0 && source.y<HEIGHT) ;   
}

async function renderObstacles(animate=false) {
    for(let o of obstacle_map.values()) {
        fill('rgb(0, 0, 0)');
        square(o.x, o.y, GRID_SIZE);
        if(animate == true)
            await delay(5);
    }
    updateObstaclesCounter();
}

async function renderPoints() {
    if(source.x > -1 && source.y > -1) {
        fill('rgb(255, 0, 0)');
        circle(source.x+GRID_SIZE/2, source.y+GRID_SIZE/2, DIAMETER);        
    }
    if(goal.x > -1 && goal.y > -1) {
        fill('rgb(0, 255, 0)');
        circle(goal.x+GRID_SIZE/2, goal.y+GRID_SIZE/2, DIAMETER);        
    }    
}

async function renderGrid(animate=false) {
    clear();
    for(let i=0;i <= WIDTH; i+=GRID_SIZE) {
        stroke('rgb(0, 0, 0)');
        line(i, 0, i, HEIGHT);
    }
    for(let i=0;i <= HEIGHT; i+=GRID_SIZE) {
        stroke('rgb(0, 0, 0)');
        line(0, i, WIDTH, i);
    }    
    await renderPoints();
    await renderObstacles(animate);
}

function setup() {
    var canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("sketch");   
    background(250, 250, 250);    
    renderGrid();
}

function draw() {
  
}

function isSource(x, y) {
    return x == source.x ? y == source.y ? 1 : 0 : 0;
}

function isGoal(x, y) {
    return x == goal.x ? y == goal.y ? 1 : 0 : 0;
}

function mouseDragged() {
    if(mode == DRAW_OBSTACLES && m.key == false) {
        let h_x = Math.floor(mouseX/GRID_SIZE)*GRID_SIZE;
        let v_y = Math.floor(mouseY/GRID_SIZE)*GRID_SIZE;
        if((h_x >= 0 && h_x<WIDTH) && (v_y >= 0 && v_y<HEIGHT) && obstacle_map.has(h_x+','+v_y) == false) {
            if(!isGoal(h_x, v_y) && !isSource(h_x, v_y)) {
                obstacle_map.set(h_x+','+v_y, new Obstacle(h_x, v_y));
                renderGrid();
            }
        }
    } else if(mode == ERASE_OBSTACLES && m.key == false) {
        let h_x = Math.floor(mouseX/GRID_SIZE)*GRID_SIZE;
        let v_y = Math.floor(mouseY/GRID_SIZE)*GRID_SIZE;
        if((h_x >= 0 && h_x<WIDTH) && (v_y >= 0 && v_y<HEIGHT) && obstacle_map.has(h_x+','+v_y) == true) {
            obstacle_map.delete(h_x+','+v_y);
            renderGrid();
        }
    }
}

function mouseReleased() {
    if(mode == MARK_SOURCE && m.key == false) {
        let x = Math.floor(mouseX/GRID_SIZE)*GRID_SIZE;
        let y = Math.floor(mouseY/GRID_SIZE)*GRID_SIZE;
        if(obstacle_map.has(x+','+y) == false && (x >= 0 && x<WIDTH) && (y >= 0 && y<HEIGHT)) {
            source = new Node(x, y);
            source.key = source.x+','+source.y;
            renderGrid();
        }
    } else if(mode == MARK_DESTINATION && m.key == false) {
        let x = Math.floor(mouseX/GRID_SIZE)*GRID_SIZE;
        let y = Math.floor(mouseY/GRID_SIZE)*GRID_SIZE; 
        if(obstacle_map.has(x+','+y) == false && (x >= 0 && x<WIDTH) && (y >= 0 && y<HEIGHT)) {
            goal = new Node(x, y);
            goal.key = goal.x+goal.y;       
            renderGrid();
        }        
    }
}

async function AStar4_Wrapper() {
    if(isPointsInRange() == true) {
        let _ = new AStar4(source, goal);
        document.getElementById('legend').style.display = 'block';
        await _.start(obstacle_map).then(() => {
            document.getElementById('p_distance').style.display = 'block';
            document.getElementById('p_path_found').style.display = 'block';  
            if(_.reached == 0) {
                document.getElementById('p_path_found').innerText = 'Unreachable!';
                document.getElementById('distance').innerText = 'Infinity';
            } else {
                document.getElementById('p_path_found').innerText = 'Goal reached!';
                document.getElementById('distance').innerText = _.distance.toFixed(1);
            }
        });
    } else {
        alert('Invalid source or goal!');
    }          
}

async function AStar8_Wrapper() {
    if(isPointsInRange() == true) {
        let _ = new AStar8(source, goal);
        document.getElementById('legend').style.display = 'block';
        await _.start(obstacle_map).then(() => {
            document.getElementById('p_distance').style.display = 'block';
            document.getElementById('p_path_found').style.display = 'block';           
            if(_.reached == 0) {
                document.getElementById('p_path_found').innerText = 'Unreachable!';
                document.getElementById('distance').innerText = 'Infinity';
            } else {
                document.getElementById('p_path_found').innerText = 'Goal reached!';
                document.getElementById('distance').innerText = _.distance.toFixed(1);
            }
        });
    } else {
        alert('Invalid source or goal!');
    }          
}

async function Dijkstra_Wrapper() {
    if(isPointsInRange() == true) {
        let _ = new Dijkstra(source, goal);
        document.getElementById('legend').style.display = 'block';
        await _.start(obstacle_map).then(() => {
            document.getElementById('p_distance').style.display = 'block';
            document.getElementById('p_path_found').style.display = 'block';           
            if(_.reached == 0) {
                document.getElementById('p_path_found').innerText = 'Unreachable!';
                document.getElementById('distance').innerText = 'Infinity';
            } else {
                document.getElementById('p_path_found').innerText = 'Goal reached!';
                document.getElementById('distance').innerText = _.distance.toFixed(1);
            }
        });
    } else {
        alert('Invalid source or goal!');
    }          
}

async function BestFirstSearch_Wrapper() {
    if(isPointsInRange() == true) {
        let _ = new BestFirstSearch(source, goal);
        document.getElementById('legend').style.display = 'block';
        await _.start(obstacle_map).then(() => {
            document.getElementById('p_distance').style.display = 'block';
            document.getElementById('p_path_found').style.display = 'block';           
            if(_.reached == 0) {
                document.getElementById('p_path_found').innerText = 'Unreachable!';
                document.getElementById('distance').innerText = 'Infinity';
            } else {
                document.getElementById('p_path_found').innerText = 'Goal reached!';
                document.getElementById('distance').innerText = _.distance.toFixed(1);
            }
        });
    } else {
        alert('Invalid source or goal!');
    }          
}

async function RunAll() {
    if(isPointsInRange() == true) {
        document.getElementById('line_legend').style.display = 'block';
        document.getElementById('distance_a8').innerText = 'Infinity';
        document.getElementById('distance_a4').innerText = 'Infinity';
        document.getElementById('distance_b').innerText = 'Infinity';
        document.getElementById('distance_d').innerText = 'Infinity';        
        new AStar4(source, goal, 'rgb(255, 0, 0)').start(obstacle_map);
        new AStar8(source, goal, 'rgb(0, 255, 0)').start(obstacle_map);
        new Dijkstra(source, goal, 'rgb(0, 0, 255)').start(obstacle_map);
        new BestFirstSearch(source, goal, 'rgb(255, 255, 255)').start(obstacle_map);
    } else {
        alert('Invalid source or goal!');
    }          
}

async function fill_obstacles() {
    let i, j;
    for(i=0;i<WIDTH;i+=GRID_SIZE) {
        for(j=0;j<HEIGHT;j+=GRID_SIZE) {
            obstacle_map.set(i+','+j, new Obstacle(i, j));
        }
    }    
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRowIndex(idx, cols) {
    return Math.floor((idx-getColIndex(idx, cols))/cols);
}


function getColIndex(idx, cols) {
    return idx%cols;
}

function randD() { // decides the fate of an edge, whether to be to co 
    return Math.random() > 0.5 ? 1 : 0;
}

async function maze_generator() {
    clearGrid();
    let i, j, cur, x, y;

    // vertical border
    for(i=0;i<WIDTH;i+=GRID_SIZE) {
        obstacle_map.set(i+','+0, new Obstacle(i, 0));
        obstacle_map.set(i+','+(HEIGHT-GRID_SIZE), new Obstacle(i, HEIGHT-GRID_SIZE));
    }
    // vertical border
    for(i=0;i<HEIGHT;i+=GRID_SIZE) {
        obstacle_map.set(0+','+i, new Obstacle(0, i));
        obstacle_map.set((WIDTH-GRID_SIZE)+','+i, new Obstacle(WIDTH-GRID_SIZE, i));
    }        

    let edges = [];
    let rows = Math.floor(HEIGHT/GRID_SIZE);
    let cols = Math.floor(WIDTH/GRID_SIZE);
    let uf = new UnionFind();

    for(i=2;i<rows;i+=3) {
        for(j=2;j<cols;j+=3) {
            uf.makeSet(i*cols+j);
            if(j+1 < cols-1)
                edges.push(new Edge(i*cols+j, i*cols+j+1));
            if(j-1 > 0)    
                edges.push(new Edge(i*cols+j, i*cols+j-1));
            if(i+1 < rows-1) 
                edges.push(new Edge(i*cols+j, i*cols+j+cols));
            if(i-1 > 0)
                edges.push(new Edge(i*cols+j, i*cols+j-cols));       
        }
    }
    shuffleArray(edges);  
    while(edges.length!=0) {
        cur = edges.pop();
        if(uf.find(cur.from) != uf.find(cur.to)) {
            cur = edges.pop();
            uf.union(cur.from, cur.to);
            x = getColIndex(cur.from, cols)*GRID_SIZE;
            y = getRowIndex(cur.from, cols)*GRID_SIZE;
            obstacle_map.set(x+','+y, new Obstacle(x, y));
            x = getColIndex(cur.to, cols)*GRID_SIZE;
            y = getRowIndex(cur.to, cols)*GRID_SIZE;
            obstacle_map.set(x+','+y, new Obstacle(x, y));
        }
    }
}
function removeLegend() { // hide legend related things
    document.getElementById('p_path_found').style.display = 'none';
    document.getElementById('legend').style.display = 'none';
    document.getElementById('line_legend').style.display = 'none';
    document.getElementById('p_distance').style.display = 'none';               
}

async function render(key) {  
    if(m.key == true) { // if one process is already running, block the next process
        alert('Please wait till current process finishes!');
        return;        
    }  
    removeLegend();    
    switch(key) {
        case "draw": 
            m.hold();
            mode = DRAW_OBSTACLES;
            m.release();
            break;
        case "erase":
            m.hold();
            mode = ERASE_OBSTACLES; 
            m.release();
            break;
        case "clear":
            m.hold(); 
            clearGrid();
            renderGrid();
            m.release();
            break;
        case "clear-viz":
            m.hold();
            renderGrid();
            m.release();
            break;    
        case "ss": 
            m.hold();
            mode = MARK_SOURCE;
            m.release();
            break;
        case "sg": 
            m.hold();
            mode = MARK_DESTINATION;
            m.release();
            break;
        case "a*8": 
            m.hold();
            renderGrid();
            AStar8_Wrapper().then(() => {
                m.release();
            }).catch(() => {
                m.release();
            });
            break;
        case "a*4":
            m.hold();
            renderGrid();
            AStar4_Wrapper().then(() => {
                m.release();
            }).catch(() => {
                m.release();
            });
            break;
        case "dijkstra":
            m.hold();
            renderGrid();
            Dijkstra_Wrapper().then(() => {
                m.release();
            }).catch(() => {
                m.release();
            });
            break;
        case "best-first":
            m.hold();
            renderGrid();
            BestFirstSearch_Wrapper().then(() => {
                m.release();
            }).catch(() => {
                m.release();
            });
            break;                                        
        case "maze_gen":
            m.hold(); 
            maze_generator().then(() => {
                renderGrid(true).then(() => {
                    m.release();
                }).catch(() => {
                    m.release();
                });
            }).catch(() => {
                m.release();
            });
            break;
        case "fill":
            m.hold();
            fill_obstacles().then(() => {
                m.release();
                renderGrid();
            }).catch(() => {
                m.release();
            });            
            break;    
        case "all":
            m.hold();
            renderGrid();
            RunAll().then(() => {
                m.release();
            }).catch(() => {
                m.release();
            });               
            break;    
    }
}

// attach onclick behaviour to each option in navbar
for(let i=0;i<document.getElementsByTagName("button").length;i++) {
    let id = 'b' + i;
    document.getElementById(id).onclick = function() {
        render(this.getAttribute('value'));    
    }
}

// constant throughout
document.getElementById('num_grids').innerText = (WIDTH/GRID_SIZE) * (HEIGHT/GRID_SIZE); 
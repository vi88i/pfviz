function resetSummary() {
    document.getElementById('p_path_found').style.display = 'none';
    document.getElementById('legend').style.display = 'none';               
}

async function render(key) {  
    if(m.key == true)
        return;
    resetSummary();    
    switch(key) {
        case "draw": 
            mode = DRAW_OBSTACLES;
            break;
        case "erase":
            mode = ERASE_OBSTACLES; 
            break;
        case "clear": 
            clearGrid();
            renderGrid();
            break;
        case "clear-viz":
            renderGrid();
            break;    
        case "ss": 
            mode = MARK_SOURCE;
            break;
        case "sg": 
            mode = MARK_DESTINATION;
            break;
        case "a*8": 
            m.hold();
            renderGrid();
            await AStar8_Wrapper().then(() => {
                m.release();
            }).catch(() => {
                m.release();
            });
            break;
        case "a*4":
            m.hold();
            renderGrid();
            await AStar4_Wrapper().then(() => {
                m.release();
            }).catch(() => {
                m.release();
            });
            break;            
        case "maze_gen":
            m.hold(); 
            maze_generator().then(() => {
                m.release();
                renderGrid();
            }).catch(() => {
                m.release();
            });
            break;
        case "fill":
            m.hold();
            fill_obstacles().then(() => {
                m.release();
                renderGrid();
            });            
            break;    
    }
}

for(let i=0;i<document.getElementsByTagName("button").length;i++) {
    let id = 'b' + i;
    document.getElementById(id).onclick = function() {
        render(this.getAttribute('value'));    
    }
}

document.getElementById('num_grids').innerText = (WIDTH/GRID_SIZE) * (HEIGHT/GRID_SIZE); 
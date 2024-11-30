const min = 1;
const max = 500;
const node_index_pair = {};
const nodeSeenColor = "#28a745"; // Deeper green for better contrast.
const nodeQueueColor = "gray"; // Softer blue for clarity.
const nodeNotSeenColor = "#ffffff"; // White or very light gray.

var matrix_x = 0;
var matrix_y = 0;
var matrix_gap = 0;

var matrix_arr = Array();
var sourceNode = null;

class Node{
    constructor(value=null, index=null, parent=null, distance=Infinity){
        this.value = value;
        this.distance=distance;
        this.parent=parent;
        this.children = Array();
        this.index=index;
        this.color=nodeNotSeenColor;
        this.x=0;
        this.y=0;
        this.vx=0;
        this.vy=0;
    }
}

const draw_matrix = (x1, y1, x2, y2, num_grids) =>{
    let gap = (x2-x1)/num_grids;
    matrix_x = x1;
    matrix_y = y1;
    matrix_gap = gap;
    // vertical lines
    line_x = x1;
    for(let i=0; i<=num_grids; i++){
        ctx.beginPath();
        ctx.moveTo(line_x, y1);
        ctx.lineTo(line_x, y2);
        ctx.stroke();
        line_x += gap;
    }

    // horizontal lines
    line_y = y1;
    for(let i=0; i<=num_grids; i++){
        ctx.beginPath();
        ctx.moveTo(x1, line_y);
        ctx.lineTo(x2, line_y);
        ctx.stroke();
        line_y += gap;
    }

    fill_numbers_in_matrix(x1,x1,x2, num_grids);

}

const fill_numbers_in_matrix = (x1, y1, x2, num_grids) => {
    matrix_arr = random_generator(min, max, num_grids, num_grids);
    let gap = (x2-x1)/num_grids;
    let temp_x = x1;
    let temp_y = y1;

    for(let i=0; i<num_grids; i++){
        temp_x = x1;
        for(let j=0; j<num_grids; j++){

            ctx.fillText(matrix_arr[i][j].value, temp_x+gap/2.5, temp_y+gap/2);
            temp_x += gap;
            draw_node(matrix_arr[i][j]);

        }
        temp_y += gap;
    }
}

const random_generator = (min, max, n_rows, n_cols) => {
    let res = Array();

    for(let i=0; i < n_rows; i++){
        let row_arr = Array();
        for(let j =0; j< n_cols; j++){
            const node = new Node(value=Math.floor(Math.random()*max + min));
            node.x = 20 + Math.random()*(network_graph_width-30);
            node.y = 20 + Math.random()*(network_graph_height-30);
            node.index = [i,j];
            node_index_pair[node.index] = node;
            row_arr.push(node);
        }
        res.push(row_arr);
    }
    return res;
}

const random_choice = (num_grids) => {
    let i = Math.floor(Math.random()*num_grids);
    let j = Math.floor(Math.random()*num_grids);
    return [i,j];
}

const build_graph = async (matrix_arr, value) => {
    const queue = Array();
    let source_node_index = random_choice(matrix_arr.length);
    sourceNode = matrix_arr[source_node_index[0]][source_node_index[1]];
    sourceNode.color=nodeQueueColor;
    sourceNode.distance=0;
    draw_node(sourceNode);

    queue.push(sourceNode);
    while(queue.length > 0){
        const current_node = queue.shift();
        current_node.color=nodeQueueColor;

        mark_node(current_node, matrix_x, matrix_y, matrix_gap);
        draw_node(current_node);

        await sleep(500);
        const child_nodes = get_child_nodes(current_node, matrix_arr.length);
        child_nodes.forEach(node_=>{
            if(node_.color == nodeNotSeenColor){
                current_node.children.push(node_);
                node_.color = nodeQueueColor;
                node_.distance = current_node.distance+1;
                node_.parent = current_node;
                queue.push(node_);
                mark_node(node_, matrix_x, matrix_y, matrix_gap);
                draw_node(node_)
            }
        });
        if(current_node.value==value){
            current_node.color="red";
        }
        else{
        current_node.color=nodeSeenColor;
        }
        mark_node(current_node, matrix_x, matrix_y, matrix_gap);
        draw_node(current_node);
        draw_edge(current_node);
        await sleep(500);
        
    }
}

const get_child_nodes = (node, n) =>{
    let res = Array();
    let upperNode = (node.index[0]-1>=0)?node_index_pair[[node.index[0]-1,node.index[1]]]:null;
    let lowerNode = (node.index[0]+1<n)?node_index_pair[[node.index[0]+1,node.index[1]]]:null;
    let leftNode = (node.index[1]-1>=0)?node_index_pair[[node.index[0],node.index[1]-1]]:null;
    let rightNode = (node.index[1]+1<n)?node_index_pair[[node.index[0],node.index[1]+1]]:null;
    [upperNode, rightNode, lowerNode, leftNode].forEach(i=>{
        if(i)res.push(i);
    }) //clockwise movement
    return res;
}

const mark_node = (node, x1, y1, gap) => {
    ctx_bg.fillStyle = node.color;
    ctx_bg.fillRect(x1+node.index[1]*gap, y1+node.index[0]*gap, gap, gap);
}

const sleep = (ms) => new Promise((resolve)=> setTimeout(resolve, ms));


// ############### drawing network of nodes #################

const draw_node = (node) =>{
    ctx_graph.beginPath();
    ctx_graph.arc(node.x, node.y, 20, 0, 2 * Math.PI);
    ctx_graph.fillStyle = node.color;
    ctx_graph.fill();

    // Draw Node Label
    ctx_graph.fillStyle = "#000";
    ctx_graph.font = "12px Arial";
    ctx_graph.fillText(node.value, node.x - 5, node.y + 5);
}

const draw_edge = (node) => {
    node.children.forEach(child => {
        ctx_graph_bg.beginPath();
        ctx_graph_bg.moveTo(node.x, node.y);
        ctx_graph_bg.lineTo(child.x, child.y);
        ctx_graph_bg.strokeStyle="white";
        ctx_graph_bg.stroke();
    })
}
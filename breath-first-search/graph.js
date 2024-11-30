const attractionStrength = 0.05;
const repulsionStrength = 10000;
const damping = 0.5;
const node_array = Array();

const setup = (matrix_arr, canvas_graph_width, canvas_graph_height) => {
    for(let i=0; i<matrix_arr.length; i++){
        for(let j=0; j<matrix_arr.length; j++){
            node_array.push(matrix_arr[i][j]);
        }
    }

    node_array.forEach(node=>{
        node.x = Math.random()*canvas_graph_width;
        node.y = Math.random()*canvas_graph_height;
    });
}
const step = () => {
    for(let i=0; i<node_array.length; i++){
        const nodeA = node_array[i];
        nodeA.vx *= damping;
        nodeA.vy *= damping;

        for(let j=0; j<node_array.length; j++){
            if(i===j)continue;
            const nodeB = node_array[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const distance = Math.sqrt(dx*dx + dy*dy)||1;
            const force = (repulsionStrength/(distance*distance));

            nodeA.vx += (dx/ distance)*force;
            nodeA.vy += (dy/ distance)*force;

        }
        
    }

    node_array.forEach(node => {
        node.children.forEach(child=>{
            const dx = child.x - node.x;
            const dy = child.y - node.x;
            const distance = Math.sqrt(dx*dx)||1;
            const force = attractionStrength*distance;

            node.vx += (dx/distance)*force;
            node.vy += (dy/distance)*force;
            child.vx -= (dx/distance)*force;
            child.vy -= (dy/distance)*force;
        });
    });

    node_array.forEach(node=>{
        node.x += node.vx;
        node.y += node.vy;
    });

    draw();
    requestAnimationFrame(step);
}

// Draw Nodes and Edges
function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "#aaa";
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
    });

    // Draw Nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#69b3a2";
        ctx.fill();

        // Draw Node Label
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(node.value, node.x - 5, node.y + 5);
    });
}
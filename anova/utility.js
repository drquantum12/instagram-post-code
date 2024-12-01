const n_containers = 3;
const n_particles = 10;
const particleColors = ["red", "blue", "green"];
// const particleColors = ["#F28C8C", "#87CEEB", "#A8D5BA"];
const container_arr = Array();
const velocity = 4;
var global_mean = 0;

class particleContainer{
    constructor(n_particles,x, y, height, width, particle_color, ctx){
        this.particleArray=Array();
        this.n_particles=n_particles;
        this.x_pos = x;
        this.y_pos = y;
        this.height=height;
        this.width=width;
        this.particle_color=particle_color;
        this.ctx = ctx;
        this.v_mean = 0;

        this.draw = () =>{
            for(let i=0; i<n_particles; i++){
                const particle = new Particle(this.x_pos, this.y_pos, this.height, this.width, this.particle_color, this.ctx);
                this.particleArray.push(particle);

            }
            this.ctx.beginPath();
            this.ctx.rect(this.x_pos, this.y_pos, this.width, this.height);
            this.ctx.strokeStyle="green";
            this.ctx.stroke();
        }
    }
}

class Particle{
    constructor(x, y, height, width, particleColor, ctx){
        this.radius = 10;
        this.ctx = ctx;
        this.parent_x = x;
        this.parent_y = y;
        this.parent_height=height;
        this.parent_width=width;
        this.x_pos = x + this.radius+Math.random()*(width-this.radius*2);
        this.y_pos = y + this.radius+Math.random()*(height-this.radius*2);
        this.direction = Math.random() * (2*Math.PI);
        this.v = Math.random() * velocity;
        this.vx = this.v * Math.cos(this.direction);
        this.vy = this.v * Math.sin(this.direction);

        this.draw = () => {
            this.ctx.beginPath();
            this.ctx.arc(this.x_pos, this.y_pos, this.radius, 0, 2*Math.PI);
            this.ctx.fillStyle=particleColor;
            this.ctx.fill();
        }

        this.update_position = () => {
            if(this.x_pos <= this.parent_x+this.radius || this.x_pos >= this.parent_x + this.parent_width-this.radius){
                this.vx = -this.vx;
            }
            if(this.y_pos <= this.parent_y+this.radius || this.y_pos >= this.parent_y + this.parent_height-this.radius){
                this.vy = -this.vy;
            }
            

            this.x_pos += this.vx;
            this.y_pos += this.vy;
        }

        this.check_collision = (other) => {
            const dx = this.x_pos - other.x_pos;
            const dy = this.y_pos - other.y_pos;
            const distance = Math.sqrt(dx * dx + dy * dy);
        
            
            if (distance <= this.radius + other.radius) {
                
                const normalX = dx / distance;
                const normalY = dy / distance;
                const tangentX = -normalY;
                const tangentY = normalX;
        
                
                const dotProductNormal1 = this.vx * normalX + this.vy * normalY;
                const dotProductTangent1 = this.vx * tangentX + this.vy * tangentY;
        
                const dotProductNormal2 = other.vx * normalX + other.vy * normalY;
                const dotProductTangent2 = other.vx * tangentX + other.vy * tangentY;
        
                
                const newDotProductNormal1 = dotProductNormal2;
                const newDotProductNormal2 = dotProductNormal1;
        
                
                this.vx = tangentX * dotProductTangent1 + normalX * newDotProductNormal1;
                this.vy = tangentY * dotProductTangent1 + normalY * newDotProductNormal1;
        
                other.vx = tangentX * dotProductTangent2 + normalX * newDotProductNormal2;
                other.vy = tangentY * dotProductTangent2 + normalY * newDotProductNormal2;
        
                
                const overlap = this.radius + other.radius - distance;
                const correctionX = overlap / 2 * normalX;
                const correctionY = overlap / 2 * normalY;
        
                this.x_pos += correctionX;
                this.y_pos += correctionY;
                other.x_pos -= correctionX;
                other.y_pos -= correctionY;
            }
        };
    }
    
}

const setup = () => {
    const container_height = 500;
    const container_width = 250;
    let container_xpos = 10;


    for(let i=0; i<n_containers; i++){
        const container = new particleContainer(n_particles, container_xpos, 150, container_height, container_width, particleColors[i], ctx);
        container_arr.push(container);
        container_xpos += container_width + 20;
        container.draw();
        container.particleArray.forEach(particle=>{
            particle.draw();
        })
    }
}

const update_container_particles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    container_arr.forEach((container) => {
        
        let container_v_sum = 0;
        container.particleArray.forEach((particle, index) => {
            particle.update_position();

            
            for (let j = index + 1; j < container.particleArray.length; j++) {
                particle.check_collision(container.particleArray[j]);
            }

            particle.draw();
            particle.v = Math.sqrt(particle.vx*particle.vx + particle.vy*particle.vy);
            container_v_sum+= particle.v;
        });
        container.v_mean = container_v_sum/container.particleArray.length;

        global_mean = globalMean(container_arr);

        let msw = cal_msw(container_arr);
        let msb = cal_msb(container_arr);

        ctx.beginPath();
        ctx.rect(container.x_pos, container.y_pos, container.width, container.height);
        ctx.strokeStyle = "green";
        ctx.stroke();
        ctx.fillStyle="Black";

        ctx.font = "50px Arial";
        ctx.fillText("ANOVA Test on particle velocities in three containers.", 50, 50);

        ctx.font = "10px Arial";
        ctx.fillText("MSB : ", 50, 100);
        ctx.fillText(msb, 100, 100);

        ctx.fillText("MSW : ", 250, 100);
        ctx.fillText(msw, 300, 100);

        ctx.fillText("F - statistic : ", 450, 100);
        ctx.fillText((msb/msw), 530, 100);

        ctx.fillText("Average Container Velocity", container.x_pos-50+(container.width/2), container.y_pos-30);
        ctx.fillText(container.v_mean, container.x_pos-50+(container.width/2), container.y_pos-10);
    });

    
    requestAnimationFrame(update_container_particles);
};


// ----------- anova ---------------

// ssw = E(X_i - Mean_i)^2
const cal_ssw = (container_arr) =>{
    let res = 0;
    container_arr.forEach(container=>{
        let temp_res = 0;
        container.particleArray.forEach(particle=>{
            temp_res += (particle.v - container.v_mean)*(particle.v - container.v_mean);
        });
        res += temp_res;
    });
    return res
}

const globalMean = (container_arr) => {
    let temp_sum = 0;
    container_arr.forEach(container=>{
        temp_sum += container.v_mean;
    });

    return temp_sum/n_containers;
}

// mean square within (net variance with groups)
// msw = ssw/(N-num_groups)
const cal_msw = (container_arr) => {
    let res = cal_ssw(container_arr);
    // sum of square with in group over degree of freedom (dim -1)
    return res/((n_particles-1)*n_containers);
}

const cal_ssb = (container_arr) => {
    let res = 0;
    container_arr.forEach(container=>{
        res += n_particles*(container.v_mean - global_mean)*(container.v_mean - global_mean);
    });
    return res;
}

// mean square between (net variance between the groups)
// msb
const cal_msb = (container_arr) => {
    let res = cal_ssb(container_arr);
    return res/(n_containers-1);
}

// as per the law of variances
// total variance should be equivalent to SS_total = ssb + ssw
const cal_sst = (container_arr) => {
    let temp_sum=0;
    container_arr.forEach(container=>{
        container.particleArray.forEach(particle=>{
            temp_sum += (particle.v-global_mean)*(particle.v-global_mean);
        });
    });
    return temp_sum;
}


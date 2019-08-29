updateRender({
    xspacing: 40,
    w: 0,
    theta: 0.0,
    amplitude: 75.0,
    period: 500.0,
    dx: 0,
    yvalues: [],
    setup() {
        this.w = this.width + 16;
        this.dx = (Math.PI * 2) / this.period * this.xspacing;
        this.yvalues = new Array(Math.floor(this.w / this.xspacing));
    },
    
    calcWave() {
        this.theta += 0.02;
        let x = this.theta;
        for(let i = 0; i < this.yvalues.length; i++) {
            this.yvalues[i] = Math.sin(x) * this.amplitude;
            x += this.dx;
        }
    },
    
    renderWave() {
        for(let x = 0; x < this.yvalues.length; x++) {
            let circ = new Circle(x * this.xspacing, this.height / 2 + this.yvalues[x], 5);
            circ.color = new Color(255);
            this.add(circ);
        }
    },
    
    update() {
        this.clear();
        this.calcWave();
    },
    
    draw() {
        this.renderWave();
    }
});
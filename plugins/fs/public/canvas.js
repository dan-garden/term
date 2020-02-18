canvasRenderer.updateRender({
    setup() {
        this.grid = new Grid(0, 0, this.width, 400, 6, 7);
    },

    update() {
        this.grid.forEach(cell => {
            if(cell.contains(this.mouseX, cell.y + 10)) {
                cell.setColor(210);
            } else {
                cell.setColor(255);
            }
        });
    },

    draw() {
        this.background = 255;
        this.add(this.grid);
    }
});
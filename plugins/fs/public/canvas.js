canvasRenderer.updateRender({
    update() {
        let body = new Rect(this.halfWidth(100), this.halfHeight(200), 100, 200)
            .noFill();
            
        this.cup = new ShapeGroup([
            new Rect(body.x+body.width, body.y, 20, body.height)
            .setAngle(15)
            .noFill(),
            new Rect(body.x-20, body.y, 20, body.height)
            .setAngle(-15)
            .noFill(),
            body
        ]);
    },

    draw() {
        this.background = 255;
        this.add(this.cup);
    }
});
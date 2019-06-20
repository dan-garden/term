window.skew = new Canv('canvas', {
    scale: new Vector(1, 1),
    skew: new Vector(0, 0),
    move: new Vector(0, 0),
    setup() {

        cmd.registerFunction(() => {
            cmd.clear();
            cmd.ctx.transform(
                this.scale.x,
                this.skew.x,
                this.skew.y,
                this.scale.y,
                this.move.x,
                this.move.y
            );
        });
    }
})
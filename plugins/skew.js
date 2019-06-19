new Canv('canvas', {
    setup() {
        this.skew = 0;

        cmd.registerCommand("skew", () => {
            cmd.clear();
            cmd.ctx.transform(1, 1, 1, 1, 0, 0);
        })
    }
})
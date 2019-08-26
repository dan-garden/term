window.transform = new Canv('#main', {
    opts: {
        scale: new Vector(1, 1),
        skew: new Vector(0, 0),
        move: new Vector(0, 0),
    },

    setup() {
        cmd.registerSuggestion("transform");

        this.defaults = {
            scale: new Vector(this.opts.scale.x, this.opts.scale.y),
            skew: new Vector(this.opts.skew.x, this.opts.skew.y),
            move: new Vector(this.opts.move.x, this.opts.move.y)
        };

    },

    restoreDefaults() {
        this.opts = {
            scale: new Vector(this.defaults.scale.x, this.defaults.scale.y),
            skew: new Vector(this.defaults.skew.x, this.defaults.skew.y),
            move: new Vector(this.defaults.move.x, this.defaults.move.y)
        };
    },

    change() {
        cmd.clear();
        cmd.ctx.transform(
            this.opts.scale.x,
            this.opts.skew.x,
            this.opts.skew.y,
            this.opts.scale.y,
            this.opts.move.x,
            this.opts.move.y
        );
    },



    scaleX(n) {
        this.restoreDefaults();
        this.opts.scale.x = n;
        this.change();
    },
    scaleY(n) {
        this.restoreDefaults();
        this.opts.scale.y = n;
        this.change();
    },

    skewX(n) {
        this.restoreDefaults();
        this.opts.skew.x = n;
        this.change();
    },
    skewY(n) {
        this.restoreDefaults();
        this.opts.skew.y = n;
        this.change();
    },

    moveX(n) {
        this.restoreDefaults();
        this.opts.move.x = n;
        this.change();
    },
    moveY(n) {
        this.restoreDefaults();
        this.opts.move.y = n;
        this.change();
    },
})
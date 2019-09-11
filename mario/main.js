class StateSprite extends Pic {
    constructor(states) {
        super(states.default);
        this.states = states;
        this.$state = states.default;
    }
    
    getState() {
        return this.$state;
    }
    
    setState(stateName) {
        this.$state = stateName;
        this.src = this.states[this.$state] || this.states.default;
    }
    
}




const game = new Canv("canvas", {
    fullscreen: true,
    genSprite(layout) {
        let r = layout.trim().split("\n");
        let height = r.length;
        let width = r[0].length;
        r = r.map(l => l.trim().split(""));
        const pixels = r.map((row, y) => {
            const pixel_cols = row.map((color, x) => {
                color = color=="_"?this.trans:this.colors[color];
                let pixel = new Rect(x * this.res, y * this.res, this.res, this.res);
                pixel.setColor(color);
                return pixel;
            });
            return new ShapeGroup(pixel_cols);
        });
        const base64 = new Sprite(pixels).getString(width * this.res, height * this.res);
        return base64;
    },
    
    setup() {
        this.res = 2;
        this.floorHeight = 10;
        this.init();
        // this.mario.setState("running_0");
    },
    
    init() {
        this.size = this.res * 16;
        this.trans = new Color(255).opacity(0);
        this.colors = [
            new Color(0),             //Black         0
            new Color(253, 185, 100), //Cream         1
            new Color(254, 0, 0),     //Red           2
            new Color(13, 30, 170),   //Blue          3
            new Color(254, 196, 0),   //Yellow        4
            new Color(111, 61, 0),    //Brown         5
            new Color(255, 228, 158), //Light Cream   6
            new Color(210, 105, 30),  //Light Brown   7
            new Color(33, 31, 29)     //Dark Grey     8
        ];
        
        this.initSprites();

        this.loadWorld(0, 0);
        this.initMario();
    },
    
    initSprites() {
        this.sprites = {};
        Object.keys(sprites).forEach(spriteName => {
            let states = sprites[spriteName];
            let spriteStates = {};
            Object.keys(states).forEach(stateName => {
                spriteStates[stateName] = this.genSprite(states[stateName]);
            });
            this.sprites[spriteName] = spriteStates;
        })
    },


    loadWorld(n, s) {
        this.world = new ShapeGroup();

        const map = maps[n][s];
        if(map) {
            let r = map.trim().split("\n");
            let height = r.length;
            let width = r[0].length;
            r = r.map(l => l.trim().split(""));
            const tiles = r.map((row, y) => {
                const tile_cols = row.map((sprite, x) => {
                    sprite = sprite==="s"?"s":(sprite=="_"?false:this.sprites[sprite]);
                    if(sprite === "s" || sprite && sprite.default) {

                        let posx = x * this.size;
                        let posy = y * this.size;
                        let w = this.size;
                        let h = this.size;

                        if(sprite === "s") {
                            this.startPos = new Vector(posx, posy);
                        } else {
                            let tile = new Pic(sprite.default, posx, posy, w, h);
                            this.world.add(tile);
                            return tile;
                        }
                        
                    }
                });
                return tile_cols;
            });

            console.log(this.world);
        }
    },

        
    initMario() {
        this.mario = new StateSprite(this.sprites.mario);
        this.mario.setPos(this.startPos.x, this.startPos.y);
    },
    
    initBlocks() {
        this.block = this.sprites.g.src;
        this.blocks = new ShapeGroup();
        for(let j = 0; j < this.floorHeight; j++) {
            for(let i = 0; i < (this.width) / this.size; i++) {
                const block = new Pic(
                    this.block,
                    i * this.size,
                    this.height - ((j+1) * this.size),
                    this.size,
                    this.size
                );
                this.blocks.add(block);
            }
        }
    },
    
    update() {
        if(this.keyDown("d")) {
            this.world.moveX(-2);
        } else if(this.keyDown("a")) {
            this.world.moveX(2);
        }
    },
    
    draw() {
        this.background = new Color("skyblue");
        this.add(this.mario);
        this.add(this.world);
    }
});
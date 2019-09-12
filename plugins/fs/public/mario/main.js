class StateSprite extends Pic {
    constructor(states) {
        super(states.default);
        this.states = states;
        this.$state = states.default;
    }

    touches(shape) {
        // no horizontal overlap
        if (this.x > (shape.x + shape.width) || shape.x > (this.x + this.width)) return false;
    
        // no vertical overlap
        if (this.y > (shape.y + shape.height) || shape.y > (this.y + this.height)) return false;
    
        return true;
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
        this.moveSpeed = 4;
        this.init();
    },
    
    init() {
        this.res = 2;
        this.size = this.res * 16;
        this.backgroundColor = new Color(135, 206, 235);
        this.trans = new Color(255).opacity(0);
        this.colors = {
            a: new Color(0),             //Black
            b: new Color(253, 185, 100), //Cream
            c: new Color(254, 0, 0),     //Red
            d: new Color(13, 30, 170),   //Blue
            e: new Color(254, 196, 0),   //Yellow
            f: new Color(111, 61, 0),    //Brown
            g: new Color(255, 228, 158), //Light Cream
            h: new Color(210, 105, 30),  //Light Brown
            i: new Color(33, 31, 29),    //Dark Grey
            j: new Color(227, 135, 43),  //Orange
            k: new Color(255, 177, 43),  //Gold
            l: new Color(227, 135, 43).opacity(0.4),  //Light orange
            m: new Color(42, 129, 0), //Dark Green
            n: new Color(75, 231, 0) //Light Green
        };
        
        this.initSprites();

        this.loadWorld(0, 0);
        this.initMario();

        // setTimeout(() => document.location.reload(), 300)
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
        this.visibleWorld = new ShapeGroup();

        const map = maps[n][s];
        if(map) {
            let r = map.trim().split("\n");
            let height = r.length;
            let width = r[0].length;
            r = r.map(l => l.trim().split(""));
            const tiles = r.map((row, y) => {
                const tile_cols = row.map((sprite, x) => {
                    const name = sprite;
                    sprite = sprite==="s"?"s":(sprite=="_"?false:this.sprites[sprite]);
                    if(sprite) {

                        let posx = x * this.size;
                        let posy = y * this.size;
                        let w = this.size;
                        let h = this.size;

                        if(sprite === "s") {
                            this.startPos = new Vector(posx, posy);
                        } else {
                            let tile = new StateSprite(sprite);
                            tile.setPos(posx, posy);
                            tile.setDimensions(w, h);
                            tile.name = name;
                            this.world.add(tile);
                            return tile;
                        }
                        
                    }
                });
                return tile_cols;
            });

        }
    },

    getVisibleWorld() {
        const visible = new ShapeGroup();
        this.world.forEach(shape => {
            if(shape.x > -shape.width && shape.x < this.width) {
                visible.add(shape);
                if(shape.name === "q" && this.frames % 100 === 0) {
                    shape.setState("flash");
                } else if(shape.name === "q" && this.frames % 100 === 50) {
                    shape.setState("default");
                }
                
            }
        });
        return visible;
    },
        
    initMario() {
        this.mario = new StateSprite(this.sprites.mario);
        this.mario.setPos(this.startPos.x, this.startPos.y);


        this.mario.vel = new Vector(0, 0);
        this.mario.gravity = 0;
    },

    marioTouching() {
        const touching = [];
        this.visibleWorld.forEach(block => {
            if(block.touches(this.mario)) {
                touching.push(block);
                block.setStroke(new Color(0, 0, 255), 5);
            } else {
                block.noStroke();
            }
        });

        return touching;
    },

    updateMario() {
        // let touching = this.marioTouching();
        // if( !touching && this.keyDown("w")) {
        //     this.mario.gravity = -0.1;
        // } else {
        //     this.mario.gravity = 0.05;
        // }



        if(this.keyDown("a")) {
            this.mario.vel.x = -(this.moveSpeed);
        } else if(this.keyDown("d")) {
            this.mario.vel.x = this.moveSpeed;
        }
        
        this.mario.vel.x *= 0.95;
        if(this.mario.vel.x < 0.01 && this.mario.vel.x > -0.01) {
            this.mario.vel.x = 0;
        }

        this.mario.vel.y += this.mario.gravity;
        // this.mario.pos.add(this.mario.vel);

        this.world.forEach(block => {
            block.pos.x -= this.mario.vel.x;
            block.pos.y -= this.mario.vel.y;
        })

        // touching = this.marioTouching();
        // if(touching.length) {
        //     this.mario.vel.x = 0;
        //     this.mario.vel.y = 0;
        // }

    },
    
    update() {

        this.updateMario();
        this.visibleWorld = this.getVisibleWorld();
        // console.log("changed", this.visibleWorld.length);
        
    },
    
    draw() {
        this.background = this.backgroundColor;
        this.add(this.mario);
        this.add(this.visibleWorld);
    }
});
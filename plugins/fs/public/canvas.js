canvasRenderer.updateRender({
    setup() {
        this.res = 2;
        this.floorHeight = 2;
        this.init();
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
        
        this.initMario();
        this.initBlocks();
    },
    
    genSprite(layout) {
        let r = layout.trim().split("\n");
        let height = r.length;
        let width = r[0].length;
        r = r.map(l => l.trim().split(""));
        const pixels = r.map((row, y) => {
            const pixel_cols = row.map((color, x) => {
                color = color=="_"?this.trans:this.colors[parseInt(color)];
                let pixel = new Rect(x * this.res, y * this.res, this.res, this.res);
                pixel.setColor(color);
                return pixel;
            });
            return new ShapeGroup(pixel_cols);
        });
        const base64 = new Sprite(pixels).getString(width * this.res, height * this.res);
        return base64;
    },
    
    initMario() {
        this.mario = new Pic(this.genSprite(`
            _____22222______
            ____222222222___
            ____5551101_____
            ___5151110111___
            ___51551110111__
            ___5511110000___
            _____1111111____
            ____223222______
            ___2223223222___
            __222233332222__
            __112343343211__
            __111333333111__
            __113333333311__
            ____333__333____
            ___555____555___
            __5555____5555__
        `));
        
        this.mario.setPos(
            this.halfWidth(this.size),
            this.height - (this.size * (this.floorHeight+1))
        );
    },
    
    initBlocks() {
        this.block = this.genSprite(`
            7666666668766667
            6777777778677776
            6777777778677776
            6777777778677776
            6777777778687776
            6777777778788887
            6777777778666668
            6777777778677778
            6777777778677778
            6777777778677778
            8877777786777778
            6688777786777778
            6766888867777778
            6777666867777778
            6777777867777788
            7888888788888887
        `);
        
        this.blocks = new ShapeGroup();
        
        for(let j = 0; j < this.floorHeight; j++) {
            for(let i = 0; i < this.width / this.size; i++) {
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
        
    },
    
    draw() {
        this.background = new Color("skyblue");
        this.add(this.mario);
        this.add(this.blocks);
    }
});
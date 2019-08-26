new Canv('#main', {
    setup() {
        this.select = new ShapeGroup();
        cmd.registerFunction(() => {
            this.select.clear();

            if(cmd.autocomplete && cmd.autocomplete.length) {
                cmd.autocomplete.forEach((suggestion, i) => {
                    let bg = new Rect(cmd.width-400, i * (cmd.lineHeight+5), 400, (cmd.lineHeight+5));
                    bg.color = cmd.colors.secondary;

                    let text = new Text(suggestion, bg.x, bg.y);
                    text.fontFamily = cmd.fontFamily;
                    text.fontSize = cmd.fontSize;
                    text.color = cmd.colors.primary;



                    this.select.add(bg);
                    this.select.add(text);
                })
            }

            
        });
    },


    draw() {
        this.add(this.select);
    }
})
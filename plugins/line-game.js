new Canv('#main', {
    setup() {
        this.running = false;
        cmd.registerCommand("line-game start", args => {
            this.running = true;
        })


        this.count = 0;
        cmd.registerFunction(() => {
            if(this.running) {
                cmd.newLine(new Array(this.count).fill('-').join(''));
                this.count++;


                if(cmd.lines.length > 20) {
                    cmd.run("cls");
                    this.count = 0;
                }
            }
        })
    }
})
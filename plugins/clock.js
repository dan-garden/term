new Canv('#main', {    
    setup() {
        cmd.registerCommand("date", args => {
            cmd.newLine(new Date().toString());
        });

        cmd.registerCommand("time", args => {
            cmd.newLine(new Date().toLocaleTimeString())
        })
    }
})
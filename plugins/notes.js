new Canv('canvas', {
    setup() {

        cmd.registerCommand('new note', args => {
            const filename = args.shift();
            const editor = new cmd.popup(filename, "", true, val => {
                cmd.plugins.dir.newFile(filename+".txt", val);
            });
        })
    }
})
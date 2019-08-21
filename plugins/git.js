new Canv('canvas', {
    setup() {
        cmd.registerCommand("git", args => {
            cmd.run("shell_exec git "+args.join(" "), false)
        });
    }
})
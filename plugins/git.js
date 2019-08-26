new Canv('#main', {
    setup() {
        cmd.registerCommand("git", args => {
            cmd.run("shell_exec git "+args.join(" "), false)
        });
    }
})
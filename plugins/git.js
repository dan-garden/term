new Canv('#main', {
    setup() {
        cmd.registerEvent("plugins-loaded", () => {
            if(cmd.commandExists("shell_exec")) {
                cmd.registerCommand("git", args => {
                    cmd.run("shell_exec git "+args.join(" "), false)
                });
            }
        })
    }
})
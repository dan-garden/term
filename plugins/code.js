new Canv('#main', {
    setup() {
        cmd.registerCommand("code", (params) => {
            document.location = "vscode://"+params.join(" ");
        });
    }
})
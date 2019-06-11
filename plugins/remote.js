new Canv('canvas', {
    setup() {
        this.clientId = Canv.random(1000, 9999);
        cmd.registerCommand("r", args => {
            const command = args.join(" ");
            let remote = localStorage.getItem("cli-remote") ? JSON.parse(localStorage.getItem("cli-remote")) : [];
            remote.push({ clientId: this.clientId, command });
            localStorage.setItem("cli-remote", JSON.stringify(remote))
        });

        cmd.registerFunction(() => {
            let remote = localStorage.getItem("cli-remote") ? JSON.parse(localStorage.getItem("cli-remote")) : [];
            if(remote.length > 0) {
                if(remote[0].clientId!=this.clientId) {
                    const r = remote.shift();
                    cmd.lines[cmd.lines.length-1].text = cmd.prefix + r.command;
                    cmd.run(r.command);
                    localStorage.setItem("cli-remote", JSON.stringify(remote))
                }
            }
        });
    }
})
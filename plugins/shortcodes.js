new Canv('#main', {
    setup() {
        this.origLines = false;

        cmd.registerCommand("filter", args => {
            const filter = args.join(" ").toLowerCase();
            this.origLines = JSON.parse(JSON.stringify(cmd.lines));
            cmd.lines = cmd.lines.filter(line => {
                const str = line.text.toLowerCase().replace(cmd.prefix, "");
                return str.includes(filter);
            });
        });

        cmd.registerSuggestions([
            "reg fn",
            "reg function",
            "reg cmd",
            "reg command"
        ]);

        cmd.registerCommand("reg", args => {
            const type = args.shift();
            if(!type || (type!=="function" && type!=="fn" && type!=="command" && type!=="cmd" && type!=="event")) {
                throw new Error("Type must be function, command or event");
            } else {
                if(type === "event") {
                    const identifier = args.shift();
                    if(identifier) {
                        cmd.registerEvent(identifier, new Function(args.join(" ")))
                    } else {
                        throw new Error("Event must have an identifier");
                    }
                } else if(type === "function" || type === "fn") {
                    cmd.registerFunction(new Function(args.join(" ")));
                } else if(type === "command" || type === "cmd") {
                    const identifier = args.shift();
                    if(identifier) {
                        cmd.registerCommand(identifier, new Function(args.join(" ")));
                    } else {
                        throw new Error("Command must have an identifier");
                    }
                }
            }
        })

        cmd.registerCommand("clear", args => {
            cmd.clear();
        });

        cmd.registerCommand("cls", cmd.commands["clear"]);

        cmd.registerCommand("echo", args => {
            cmd.newLine(args.join(" "))
        });

        cmd.registerCommand("reload", args => {
            document.location.reload();
        });

        cmd.registerCommand("h-remove", args => {
            cmd.history = cmd.history.filter(h => h!==args.join(" "));
            console.log(cmd.history);
            // cmd.history.splice(cmd.history.indexOf(args.join(" ")), 1);
            cmd.history.pop();
        });

        cmd.registerSuggestions([
            "load sketch",
            "load plugin"
        ]);

        cmd.registerCommand("load", args => {
            const type = args.shift();
            if(type === "sketch") {
                cmd.loadSketch(args.join(" "));
                return true;
            } else if(type === "plugin") {
                cmd.loadPlugin(args.join(" "));
                return true;
            }
            return false; 
        });

        cmd.registerCommand("plugins", args => {
            return Object.keys(cmd.plugins);
        });

        cmd.registerCommand("help", args => {
            return Object.keys(cmd.commands);
        });


        cmd.registerCommand("run", args => {
            cmd.run(args.join(" "));
        });

        cmd.registerCommand("log", args => {
            cmd.log(eval(args.join(" ")));
        });

        cmd.registerCommand("image", args => {
            return cmd.img(args.join(" "));
        });

        cmd.registerCommand("img", cmd.commands["image"]);

        cmd.registerCommand("interval", args => {
            const timing = args.shift();
            if(!timing) {
                throw new Error("Please include the timing");
            } else {
                setInterval(() => cmd.run(args.join(" "), false), timing);
            }
        });

        cmd.registerCommand("timeout", args => {
            const timing = args.shift();
            if(!timing) {
                throw new Error("Please include the timing");
            } else {
                setTimeout(() => cmd.run(args.join(" "), false) || cmd.newLine(), timing);
            }
        });

        cmd.registerCommand("for", args => {
            if(args.length < 4) {
                throw new Error("Not enough params");
            } else {
                const start = args.shift();
                const end = args.shift();
                const inc = args.shift();
                let fn = args.join(" ");

                eval(`for(let i = ${start}; i ${end}; i${inc}) {
                    let second_fn = fn.split('@i').join(i);
                    cmd.run(second_fn, false);
                }`);
            }
        });

        cmd.registerCommand("if", args => {
            const condition = args.shift();
            if(condition) {
                eval(`
                    if(${condition}) {
                        cmd.run("${args.join(' ')}", false)
                    }
                `);
            }
        });

        cmd.registerCommand("goto", args => {
            window.open("https://" + args.join(" "));
        });

    }
})
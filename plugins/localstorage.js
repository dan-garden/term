new Canv('canvas', {
    setup() {
        cmd.registerCommand("local", args => {
            const act = args.shift();
            if(act === "get") {
                return localStorage.getItem(JSON.parse(args.shift()));
            } else if(act === "set") {
                return localStorage.setItem(args.shift(), JSON.stringify(args.join(" ")))
            } else if(act === "remove" || act === "del" || act === "delete") {
                return localStorage.removeItem(args.join(" "))
            } else {
                return Object.keys(localStorage);
            }
        });
    }
})
new Canv('canvas', {
    setup() {
        cmd.registerCommand("get", params => {
            let type = "text";
            if(params.indexOf("json") > -1) {
                type = params.splice(params.indexOf("json"), 1)[0];
            }

            if(params[0]) {
                fetch(params[0])
                .then(result => type === "json" ? result.json() : result.text())
                .then(result => {
                    if(type === "text") {
                        cmd.multiLine(result.split("\n"));
                    } else {
                        cmd.log(result);
                    }
                });
            } else {
                return new Error("Invalid URL");
            }
        })
    }
})
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
                    if(type === "json") {
                        // cmd.log(result);
                        new cmd.popup("filename.json", JSON.stringify(result, null, 2), true, json => {
                            const filename = prompt("Enter a filename...", "filename.json");
                            if(filename) {
                                fs.newFile(filename, json);
                            }
                        });
                    } else {
                        cmd.multiLine(result.split("\n"));
                    }
                });
            } else {
                return new Error("Invalid URL");
            }
        })
    }
})
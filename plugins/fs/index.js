window.fs = new Canv('canvas', {
    setup() {
        this.structure = [];

        this.opts = Object.freeze({
            root: "./public/",
            writeDisk: false,
            readDisk: false
        });

        
        this.path = "/";
        this.updatePrefix();
        this.getStructure();



        cmd.registerCommand("ls", args => {
            this.updatePrefix();
            const dir = this.getCurrent();
            if(dir) {
                const content = dir.content || dir;
                for(let i = 0; i < content.length; i++) {
                    const struct = content[i];
                    if(struct.type === "dir") {
                        cmd.newLine(struct.name, cmd.colors.blue, () => {
                            cmd.run("clear");
                            cmd.run("cd "+struct.name);
                        });
                    } else {
                        cmd.newLine(struct.name, cmd.colors.green, () => {
                            cmd.run("editor "+struct.name);
                        });
                    }
                }
            } else {

            }
            return undefined;
        });


        cmd.registerCommand("cd", args => {
            const exists = this.changeDirectory(args.join(" ") || this.path);
            this.updatePrefix();
            if(!exists) {
                throw new Error("Directory not found");
            }
        });

        cmd.registerCommand("view", args => {
            const filename = args.join(" ");
            try {
                new URL(filename);
                window.open(filename);
            } catch {
                const found = this.open(filename);
                if(found) {
                    const lines = found.content.split("\n");
                    lines.forEach(line => {
                        cmd.newLine(line);
                    })
                }
            }
        });

        cmd.registerCommand("rm", args => {
            return this.delete(args.join(" "));
        })


        cmd.registerCommand("touch", args => {
            const filename = args.join(" ");
            if(filename) {
                this.newFile(filename, "");
            }
        });

        cmd.registerCommand("mkdir", args => {
            const filename = args.join(" ");
            if(filename) {
                this.newDir(filename);
            }
        });


        cmd.registerCommand("edit", args => {
            const filename = args.shift();
            const found = this.open(filename);
            if(found) {
                this.edit(filename, args.join(" "));
            }
        });

        cmd.registerCommand("open", args => {
            const filename = args.join(" ");
            const found = this.open(filename);
            if(found) {
                const realpath = this.getRealPath();
                window.open(realpath + "/" + filename);
            }
        });

        cmd.registerCommand("editor", args => {  
            const filename = args.shift();
            let found = this.open(filename);

            const editor = new cmd.editor(filename, found.content, val => {
                this.edit(filename, val);
                // cmd.run("exec "+filename);
            });
        });

        cmd.registerCommand("download", args => {
            const location = args.shift();
            fetch(location)
                .then(result => result.text())
                .then(result => {
                    const split = location.split("/");
                    const filename = split[split.length-1];
                    this.newFile(filename, result);
                })
        })

        cmd.registerCommand("exec", args => {
            const filename = args.shift();
            this.exec(filename);
        });

        cmd.registerCommand("php", args => {
            const filename = args.shift();
            this.exec(filename, "php");
        });

        cmd.registerCommand("js", args => {
            const filename = args.shift();
            this.exec(filename, "js");
        });


        cmd.registerEvent("plugins-loaded", ()=> {
            return this.exec("startup.dan");
        })
    },

    keyHandler(e) {
        var TABKEY = 9;
        if(e.keyCode == TABKEY) {
            this.value += "\t";
            if(e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }
    },

    getRealPath() {
        return  "plugins/fs/" + this.opts.root + this.getPath().join("/");
    },

    exec(filename, allow="all") {
        try {
            const found = this.open(filename);

            if(found) {
                const split = filename.split(".");
                const ext = split[split.length-1].toLowerCase();
                if(allow === "all" || ext === allow) {
                    if(ext === "js") {
                        eval.apply(cmd, [found.content]);
                    } else if(ext === "dan") {
                        const command = found.content.split("\n")
                        .filter(l=>l.trim()!=="")
                        .join(" && ");
                        cmd.run(command, false);
                    } else if(ext === "php") {
                        const realpath = this.getRealPath();
                        fetch(realpath + "/" + filename)
                            .then(result => result.text())
                            .then(result => {
                                const lines = result.split("\n");
                                cmd.removeLine("last");
                                lines.forEach(line => {
                                    cmd.newLine(line);
                                });
                                cmd.newLine();
                            })
                    }
                }
            }
        } catch(e) {
            
        }
    },

    newFile(name, content) {
        if(this.exists(name)) {
            throw new Error("File already exists.");
        }
        this.getCurrent().push({
            name,
            type: "file",
            content
        });
        this.updateStructure();
    },

    newDir(name) {
        if(this.exists(name)) {
            throw new Error("Directory already exists.");
        }
        this.getCurrent().push({
            name,
            type: "dir",
            content: []
        });
        this.updateStructure();
    },

    exists(name) {
        const open = this.getCurrent().filter(f => f.name === name);
        return open.length > 0;
    },

    edit(filename, content) {
        const found = this.open(filename);
        if(found) {
            found.content = content;
            this.updateStructure();
        }
    },

    delete(filename) {
        if(filename) {
            const cur = this.getCurrent();        
            cur.forEach((file, i) => {
                if(file.name === filename) {
                    cur.splice(i, 1);
                }
            });
            this.updateStructure();
        }
    },

    open(filename, type="file") {
        if(filename) {
            const paths = filename.split("/");
            const curPath = this.path;
            if(paths.length > 1) {
                for(let i = 0; i < paths.length-1; i++) {
                    const change = this.changeDirectory(paths[i]);
                    if(!change) {
                        this.path = curPath;
                        throw new Error(type=='file'?'File not found':'Directory not found')
                    }
                }
            }

            const cur = this.getCurrent();
            this.path = curPath;
            
            const search = cur.filter(file => {
                return file.name === paths[paths.length-1];
            });
            
            
            if(search && search[0]) {
                return search[0].type === type ? search[0] : undefined;
            } else {
                throw new Error(type=='file'?'File not found':'Directory not found')
            }

        }
    },

    getStructure() {
        if(this.opts.readDisk) {
            fetch("plugins/fs/get.php?root="+this.opts.root)
            .then(result => result.json())
            .then(result => {
                this.structure = result;
            })
        } else {
            if(!this.opts.writeDisk) {
                this.structure = localStorage["cli-fs"] ?
                JSON.parse(localStorage.getItem("cli-fs")) : [];
            }
        }
    },

    updateStructure() {
        const stringify = JSON.stringify(this.structure);
        if(this.opts.writeDisk) {
            const body = new FormData;
        
            body.append("fs", stringify);
            body.append("root", this.opts.root);
            
            fetch("plugins/fs/update.php", {
                method: "POST",
                body
            })
            .then(result => result.json())
            .then(result => {
                // console.log(result);
            })
        } else {
            if(!this.opts.readDisk) {
                localStorage.setItem("cli-fs", stringify);
            }
        }
    },

    getPath(path) {
        return path || this.path.split('/').filter(m=>m!=="") || path;
    },

    changeDirectory(dir) {
        if(dir === this.path || dir === ".") {
            return true;
        } else if(dir === "..") {
            const path = this.getPath();
            path.pop();
            this.path = "/" + path.join("/");
            return true;
        } else {
            const cur = this.path;
            let path = this.getPath();
            path.push(...dir.split('/'));
            path = this.getPath("/" + path.join('/'));
            this.path = path;
            if(!this.getCurrent()) {
                this.path = cur;
                return false;
            } else {
                return true;
            }
        }
    },

    updatePrefix() {
        const path = this.getPath();
        let displayPath = "~"
        if(path.length > 0) {
            displayPath = path[path.length-1];
        }
        cmd.prefix = "" + displayPath + " $ ";
    },


    getCurrent(path) {
        path = this.getPath(path);
        let dir = this.structure;
        for(let i = 0; i < path.length; i++) {
            dir = dir.filter ? 
            dir.filter(d=> d.type === "dir" && d.name === path[i])[0] :
            dir.content.filter(d=> d.type === "dir" && d.name === path[i])[0];

            if(!dir) {
                return undefined;
            }
        }
        return dir.content ? dir.content : dir;
    }
})
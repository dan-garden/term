window.fs = new Canv('canvas', {
    setup() {
        this.structure = [];

        this.opts = Object.freeze({
            root: "./public/",
            writeDisk: true,
            readDisk: true
        });

        
        this.path = "/";
        this.prefix = cmd.prefix;
        this.loadedFirst = false;
        this.writeOutput = false;
        this.updatePrefix();
        

        cmd.registerEvent("files-loaded", () => {
            if(!this.loadedFirst) {
                // this.exec("startup.dan");
                this.loadedFirst = true;
            }
        })
        this.getStructure();

        cmd.registerCommand("ls", args => {
            this.updatePrefix();
            const dir = this.getCurrent();
            if(dir) {
                const content = dir.content || dir;

                // content.unshift({ name: "..", type: "dir" })

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

                // content.shift();
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

        cmd.registerCommand("shell_exec", args => {
            fetch("plugins/fs/shell_exec.php?cmd="+encodeURIComponent(args.join(" ")) + "&dir="+encodeURIComponent(this.path))
                .then(result=>result.text())
                .then(result => {
                    cmd.multiLine(result.split("\n"));
                    this.getStructure();
                })
        })

        cmd.registerCommand("edit", args => {
            const filename = args.shift();
            const found = this.open(filename);
            if(found) {
                this.edit(filename, args.join(" "));
            }
        });

        
        cmd.registerCommand("rn", args => {
            try {
                const filename = args.shift();
                const found = this.open(filename) || this.open(filename, "dir");
                if(found) {
                    this.rename(filename, args.join(" "));
                }
            } catch(e) {
                throw new Error("File or Folder not found.")
            }
        });

        cmd.registerCommand("append", args => {
            const filename = args.shift();
            const found = this.open(filename);
            if(found) {
                this.edit(filename, found.content + "↵" + args.join(" "));
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

            const editor = new cmd.popup(filename, found.content, true, val => {
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
        });

        cmd.registerCommand("exec", args => {
            return this.exec(args);
        });

        cmd.registerCommand("php", args => {
            this.exec(args, "php");
        });

        cmd.registerCommand("js", args => {
            this.exec(args, "js");
        });


        cmd.registerEvent("write-output", args => {
            if(this.writeOutput) {
                this.edit(this.writeOutput, this.open(this.writeOutput).content + args.join("\n") + "\n");
            }
        });

        cmd.registerCommand("wstart", args => {
            const filename = args.shift();
            try {
                const found = this.open(filename);
            } catch(e) {
                this.newFile(filename, "");
            }
            this.writeOutput = filename;
            cmd.run(args.join(" "), false);
        });

        cmd.registerCommand("wstop", args => {
            if(this.writeOutput) {
                this.writeOutput = false;
            }
        });

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

    exec(args, allow="all") {
        try {
            let filename;
            if(typeof args === "string") {
                filename = args;
            } else {
                filename = args.shift();
            }
            const found = this.open(filename);
            if(found) {
                const split = filename.split(".");
                const ext = split[split.length-1].toLowerCase();
                if(allow === "all" || ext === allow) {
                    if(ext === "js") {
                        return eval.apply(cmd, [found.content]);
                    } else if(ext === "dan") {
                        const command = found.content.split("\n")
                        .filter(l=>l.trim()!=="")
                        .forEach(c => cmd.run(c, false))
                    } else if(ext === "php") {
                        const realpath = this.getRealPath();
                        fetch(realpath + "/" + filename + args.join(" "))
                            .then(result => result.text())
                            .then(result => cmd.multiLine(result.split("\n")));
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

    rename(old_filename, new_filename) {
        let found_file = this.open(old_filename) || this.open(old_filename, "dir");
        if(found_file) {
            found_file.name = new_filename;
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
            .then(result => {
                return result.text();
            })
            .then(result => {
                return JSON.parse(result);
            })
            .then(result => {
                this.structure = result;
                cmd.triggerEvent("files-loaded");
            })
        } else {
            this.structure = localStorage["cli-fs"] ?
            JSON.parse(localStorage.getItem("cli-fs")) : [];
            cmd.triggerEvent("files-loaded");
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
        cmd.prefix = "" + displayPath + " " + this.prefix;
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
class Term extends Canv {
    constructor() {
        super('canvas', {
            colors: {
                primary: new Color("#ffffff"),
                secondary: new Color("#000000"),

                grey: new Color(150),

                magenta: new Color(223, 98, 235),
                orange: new Color(240, 106, 65),
                yellow: new Color(226, 226, 94),
                red: new Color(212, 49, 53),
                green: new Color(135, 255, 138),
                blue: new Color(47, 197, 220),

                link: new Color(255, 140, 0)
            },
            line: class {
                constructor(text, color, bg, link=false) {
                    this.text = text;
                    this.color = color;
                    if (bg) {
                        this.background = bg;
                    }
                    if(link) {
                        this.link = link;
                    }
                    this.ghost = false;
                    this.img = false;
                }
            },
            setup() {
                this.prefix = "$ ";
                this.lines = [];
                this.functions = [];
                this.overlays = [];
                this.suggestions = [];
                this.autocomplete = [];
                this.commands = {};
                this.events = {};
                this.oldColors = false;
                this.pendingWrite = false;
                this.hasNewLine = false;
                this.history = localStorage["cli-history"] ?
                    JSON.parse(localStorage.getItem("cli-history")) : [];

                this.curHistoryIndex = this.history.length;

                this.view = new ShapeGroup;
                this.maxHistory = 10000;
                this.lineHeight = 14;
                this.fontFamily = "monospace";
                this.fontSize = 14;
                this.textIndent = 5;

                this.cursorPos = false;
                this.cursor = new Rect(0, 0, 1, this.lineHeight - 2).setColor(this.colors.primary);

                this.bindPaste();
                this.bindKeyDown();

                this.loadPlugins();


                // this.registerSuggestions(Object.keys(this).map(c => "cmd." + c));
                // window.console = this;

                this.registerFunction(() => {
                    if(this.frames % 100 === 0) {
                        let colorString = JSON.stringify(this.colors);
                        if(this.oldColors !== colorString) {
                            this.triggerEvent("color-change");
                            this.oldColors = colorString;
                        }
                    }
                });
            },

            visible() {
                return this.overlays.length === 0;
            },

            clearHistory() {
                this.history = [];
                localStorage["cli-history"] = [];
            },

            bindPaste() {
                window.addEventListener("paste", e => {
                    if (this.visible()) {
                        e.preventDefault();
                        const pasteData = e.clipboardData.getData("text");
                        if (this.cursorPos === false) {
                            this.lines[this.lines.length - 1].text += pasteData;
                        } else {
                            const lastLine = this.lines[this.lines.length - 1].text;
                            const newLine = lastLine.substring(0, this.cursorPos) +
                                pasteData +
                                lastLine.substring(this.cursorPos, lastLine.length);

                            this.lines[this.lines.length - 1].text = newLine;
                            this.cursorPos += pasteData.length;
                        }
                        this.setGhostText(this.getGhostText());
                    }
                });
            },

            bindKeyDown() {
                window.addEventListener("keydown", e => {
                    this.keyPress(e);
                    this.triggerEvent("char", e);
                });
            },

            keyPress(e) {
                if (this.visible()) {
                    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
                        // e.preventDefault();
                        return;
                    }
                    const lastLineIndex = this.lines.length - 1;
                    const lastLine = this.lines[lastLineIndex].text;
                    if (e.key === "ArrowLeft") {
                        if (this.cursorPos === false) {
                            this.cursorPos = lastLine.length - 1;
                        } else {
                            if (this.cursorPos > this.prefix.length) {
                                this.cursorPos--;
                            }
                        }
                        return;
                    }
                    if (e.key === "ArrowRight") {
                        if (this.cursorPos === false) {
                            return;
                        }
                        if (this.cursorPos < lastLine.length - 1) {
                            this.cursorPos++;
                        } else if (this.cursorPos === lastLine.length - 1) {
                            this.cursorPos = false;
                        }
                        return;
                    }

                    if (e.key === "ArrowUp") {
                        this.historyChange(-1);
                    } else if (e.key === "ArrowDown") {
                        this.historyChange(1);
                    } else if (e.key === "Enter") {
                        if(e.preventDefault) {
                            e.preventDefault();
                        }                        
                        const command = lastLine.replace(this.prefix, "");
                        this.run(command);
                    } else if (e.key === "Backspace" || e.key === "Delete") {
                        if(e.preventDefault) {
                            e.preventDefault();
                        }
                        if (lastLine !== this.prefix) {
                            if (this.cursorPos === false) {
                                this.lines[lastLineIndex].text = lastLine.substring(0, lastLine.length - 1);
                            } else if (this.cursorPos > this.prefix.length) {
                                this.lines[lastLineIndex].text = lastLine.slice(0, this.cursorPos - 1) + lastLine.slice(this.cursorPos);
                                if (this.cursorPos === lastLine.length) {
                                    this.cursorPos = false;
                                } else {
                                    this.cursorPos--;
                                }
                            }
                        }
                    } else if(e.key === "Tab") {
                        if(e.preventDefault) {
                            e.preventDefault();
                        }                        if(this.lines[this.lines.length-1].ghost) {
                            this.lines[this.lines.length-1].text = this.lines[this.lines.length-1].ghost;
                        }
                    } else if (e.key.length === 1) {
                        let maxWidth = (this.width / this.charWidth) - 1;
                        if (this.lines[lastLineIndex].text.length >= maxWidth) {
                            // this.lines.push(new this.line(
                            //     "",
                            //     this.colors.primary,
                            //     this.colors.secondary
                            // ));
                            // this.lines[lastLineIndex + 1].text += e.key;
                        } else {
                            if (this.cursorPos === false) {
                                this.lines[lastLineIndex].text += e.key;
                            } else {
                                const newLine = lastLine.substring(0, this.cursorPos) + e.key + lastLine.substring(this.cursorPos, lastLine.length);
                                this.lines[lastLineIndex].text = newLine;
                                this.cursorPos++;
                            }
                        }
                    }

                    this.setGhostText(this.getGhostText());
                }
            },


            newLine(line, color, link=false, ml=true) {
                
                if (typeof line === "undefined") {
                    this.lines.push(new this.line(
                        this.prefix,
                        this.colors.primary,
                        this.colors.secondary,
                        link
                    ));
                } else {
                    if (typeof line !== "object") {
                        line = new this.line(
                            line,
                            this.colors.primary,
                            this.colors.secondary,
                            link
                        );
                    }

                    if (color) {
                        line.color = color;
                    }

                    this.lines.push(line);
                }

                this.curHistoryIndex = this.history.length;
                this.cursorPos = false;
                this.triggerEvent("newline");
                this.clearGhosts();
                if(ml && line) {
                    this.triggerEvent("write-output", [line.text.toString()])
                }
                this.hasNewLine = true;
                return line;
            },

            multiLine(lines) {
                cmd.removeLine("last");
                this.triggerEvent("write-output", lines);
                lines.forEach(line => {
                    cmd.newLine(line, false, false, false);
                });
                cmd.newLine();
            },

            log(result, color = this.colors.primary, link=false) {
                const line = this.filterResult(result, color, link);
                this.newLine(line);
            },

            triggerEvent(type, args=[]) {
                if(!Array.isArray(args)) {
                    args = [args];
                }
                if (Array.isArray(this.events[type])) {
                    this.events[type].forEach(handler => {
                        setTimeout(() => handler(...args));
                    })
                }
            },

            registerEvent(type, fn) {
                if (!this.events[type]) {
                    this.events[type] = [];
                }

                this.events[type].push(fn);
            },

            filterResult(text, color, link=false) {
                let bg = this.colors.secondary;
                if (typeof text === "number") {
                    color = this.colors.magenta;
                } else if (typeof text === "boolean") {
                    if (text === true) {
                        color = this.colors.green;
                    } else if (text === false) {
                        color = this.colors.red;
                    }
                } else if (typeof text === "string") {
                    text = '"' + text + '"';
                    color = this.colors.green;
                } else if (typeof text === "object" && !(text instanceof Error)) {
                    color = this.colors.blue;
                    text = JSON.stringify(text, null, 2);
                    text.split("\n").forEach(line => {
                        this.lines.push({text: line, color}); 
                    })
                    return false;
                } else if (typeof text === "function") {
                    color = this.colors.orange;
                    // text.toString().split("\n").forEach(line => {
                    //     this.lines.push({text: line, color}); 
                    // });
                    // return false;
                } else if (typeof text === "undefined") {
                    color = this.colors.grey;
                    return;
                } else if (text instanceof Error) {
                    color = this.colors.red;
                }


                return new this.line(
                    text,
                    color,
                    bg,
                    link
                );
            },

            getLine(n) {
                if(n==="last") {
                    n = this.lines.length-1;
                }
                return this.lines[n];
            },

            removeLine(n) {
                if(n==="last") {
                    n = this.lines.length-1;
                }
                this.lines.splice(n, 1);
            },

            clear() {
                this.lines = [];
                this.triggerEvent("clear");
            },

            clearGhosts() {
                this.lines.map(line => {
                    line.ghost = false;
                    return line;
                });
            },

            getGhostSuggestions() {
                const searchOptions = [
                    ...Object.keys(this.commands),
                    ...this.history,
                    ...this.suggestions
                ];
                

                const search = Array.from(new Set(searchOptions.filter(historyItem => {
                    let checkLastLine = this.lines[this.lines.length-1].text.replace(this.prefix, "");
                    // return checkLastLine.trim()!=""?historyItem.startsWith(checkLastLine):false;
                    return checkLastLine.trim()!=""&&checkLastLine!=historyItem?historyItem.startsWith(checkLastLine):false;
                })));

                search.sort((a, b) => {
                    return b.length-a.length;
                });

                this.autocomplete = search;
                
                return search;
            },

            getGhostText() {
                const suggestions = this.getGhostSuggestions();
                return suggestions.length ? suggestions[suggestions.length-1] : false;
            },

            setGhostText(ghost) {
                if(ghost) {
                    this.lines[this.lines.length-1].ghost = this.prefix + ghost;
                } else {
                    this.lines[this.lines.length-1].ghost = false;
                }
            },

            execute() {
                const lastLine = this.getLine("last");
                if (typeof lastLine.text === "function") {
                    lastLine.text();
                }
                return lastLine.text;
            },

            run(command, nl = true) {
                command = command.toString();
                if (nl) {
                    this.updateHistory(command);
                }

                command.split(" && ").forEach(c => {
                    const line = this.process(c);
                    if (line) {
                        this.newLine(line);
                    }
                });
                if (nl) {
                    this.newLine();
                }
            },

            process(command, nl) {
                let line = new this.line("", this.colors.primary, this.colors.secondary);
                try {
                    let commands = Object.keys(this.commands);
                    let isCommand = false;
                    for (let i = 0; i < commands.length; i++) {
                        const c = commands[i];
                        if (command === c || command.startsWith(c + " ")) {
                            isCommand = true;
                            let params = command
                                .replace(c, '')
                                .trim()
                                .split(' ');
                            params = this.filterParams(params);
                            this.commands[c](params);
                        }
                    };


                    if (isCommand) {
                        return false;
                    } else {
                        ["const", "var", "let"].forEach(prefix => {
                            if (command.startsWith(prefix)) {
                                let setter = command.replace(prefix, "").trim();
                                eval("window." + setter);
                            }
                        });
                        line.text = eval(command);
                    }
                    line = this.filterResult(line.text, line.color);
                } catch (err) {
                    line.text = err;
                    line.color = this.colors.red;
                    console.error(err);
                }

                return line;
            },

            filterParams(params) {
                params = params.filter(p => p != "")
                    .join(' ')
                    .replace(/\{{.+?\}}/g, (match, offset, string) => {
                        return eval(match);
                    }).split(' ')
                    .filter(p => p != "")
                    .map(param => {
                        return isNaN(param) ? param : parseInt(param)
                    });

                    return params;
            },

            getParamTack(args, tack, def) {
                let search = args.indexOf(tack);
                if(search > -1 && args[search+1]) {
                    search = args[search+1]
                } else {
                    search = def;
                }

                return search;
            },

            getParams() {
                let line = this.getLine("last").text.toString();
                let params = line.replace(this.prefix, "");
                params = params.split(" ");
                params.shift();
                params.shift();
                params = this.filterParams(params);
                return params;
            },

            updateHistory(command) {
                if (command !== "" && command != this.history[this.history.length - 1]) {
                    this.history.push(command);

                    if (this.history.length >= this.maxHistory) {
                        this.history = this.history.slice(Math.max(this.history.length - this.maxHistory, 0))
                    }


                    localStorage.setItem("cli-history", JSON.stringify(this.history));
                }
            },

            historyChange(n) {
                if (n === -1) {
                    if (this.curHistoryIndex === 0) {
                        this.curHistoryIndex = this.history.length - 1;
                    } else {
                        this.curHistoryIndex--;
                    }
                } else if (n === 1) {
                    if (this.curHistoryIndex === this.history.length - 1) {
                        this.curHistoryIndex = 0;
                    } else {
                        this.curHistoryIndex++;
                    }
                }
                this.lines[this.lines.length - 1].text = this.prefix + this.history[this.curHistoryIndex];
                this.cursorPos = false;
            },

            finishedLoading() {
                this.newLine(this.prefix);
                this.loaded = true;
            },

            loadPlugin(name, config = {}, callback) {
                let file = "plugins/" + name + ".js";
                fetch(file + "?d=" + new Date().getTime())
                    .then(result => result.text())
                    .then(result => {
                        this.plugins[name] = eval(`${result}`);
                        if (typeof config === "object") {
                            Object.keys(config).forEach(prop => {
                                this.plugins[name][prop] = config[prop];
                            });
                        }

                        if (typeof callback === "function") {
                            callback();
                        }
                    });
            },

            pluginExists(name) {
                let plugins = Object.keys(this.plugins).map(r => r.split("/")[0]);
                return plugins.includes(name);
            },

            commandExists(name) {
                let commands = Object.keys(this.commands);
                return commands.includes(name);
            },

            loadPlugins() {
                fetch("./plugins.json")
                    .then(result => result.json())
                    .then(result => {
                        this.plugins = result;
                        let keys = Object.keys(this.plugins);
                        if (keys.length === 0) {
                            this.finishedLoading();
                            return;
                        }
                        let loadedCount = 0;
                        keys.forEach((name, i) => {
                            const config = this.plugins[name];
                            this.loadPlugin(name, config, () => {
                                loadedCount++;

                                if (loadedCount === keys.length) {
                                    this.triggerEvent("plugins-loaded");
                                    this.finishedLoading();
                                }
                            });
                        });
                    })
            },

            loadSketch(name, config = {}) {
                this.loadPlugin("../../sketches/" + name, config);
            },

            
            registerFunction(fn) {
                this.functions.push(fn.bind(this));
                return this.functions.length-1;
            },


            removeFunction(fn_id) {
                this.functions.splice(fn_id, 1);
                return true;
            },

            registerCommand(name, handler) {
                this.commands[name] = function() {
                    const res = handler(...arguments);
                    if (res !== undefined) {
                        cmd.log(res);
                    }
                };
            },
            
            registerSuggestion(suggestion) {
                this.suggestions.push(suggestion);
            },

            registerSuggestions(suggestions) {
                this.suggestions.push(...suggestions);
            },

            img(src) {
                const l = new cmd.line("");
                l.img = new Pic(src, 0, 0, null, null, () => {
                    cmd.removeLine("last");
                    this.newLine(l);

                    for(let i = 0; i < (l.img.height/this.lineHeight)-1; i++) {
                        let br = new cmd.line("");
                        br.background = false;
                        this.newLine(br);
                    }

                    this.newLine();
                });

                return undefined;
            },
            
            update(frame) {
                this.cursor.color = this.colors.primary;
                this.functions.forEach(fn => {
                    if (typeof fn === "function") {
                        fn(this);
                    }
                });

                this.height = ((this.lines.length + 1) * this.lineHeight);
            },

            draw() {
                if (this.loaded) {
                    this.background = this.colors.secondary;
                    document.body.style.background = this.colors.secondary;

                    let lastLineWidth = 0;
                    this.lines.forEach((line, i) => {
                        let ghost = false;
                        const text = new Text(line.text, this.textIndent, i * this.lineHeight);
                        text.color = line.color || this.colors.primary;
                        text.fontFamily = this.fontFamily;
                        text.fontSize = this.fontSize;

                        if(line.ghost) {
                            ghost = new Text(line.ghost, text.x, text.y);
                            ghost.color = this.colors.grey;
                            ghost.fontFamily = this.fontFamily;
                            ghost.fontSize = this.fontSize;
                        }

                        if (line.background) {
                            const bg = new Rect(text.x, text.y + (this.lineHeight / 4), this.width, this.lineHeight);
                            bg.color = line.background;
                            if(line.link) {
                                const origColor = text.color;
                                if(bg.contains(this.mouseX, this.mouseY)) {
                                    // text.color = this.colors.secondary;
                                    // bg.color = this.colors.primary;
                                    if(this.mouseDown && !line.clicked) {
                                        line.clicked = true;
                                        if(typeof line.link === "string") {
                                            window.open(line.link);
                                        } else if(typeof line.link === "function") {
                                            line.link(this);
                                        }

                                        setTimeout(() => {
                                            line.clicked = false;
                                        }, 400);
                                    }
                                } else {
                                    text.color = origColor;
                                }
                            }
                            
                            this.add(bg);
                        }

                        if(ghost) {
                            this.add(ghost);
                        }
                        this.add(text);

                        if(line.img) {
                            line.img.setPos(text.x, text.y + 5);
                            this.add(line.img);
                        }

                        if (i === this.lines.length - 1) {
                            lastLineWidth = text.width;
                            this.charWidth = lastLineWidth / text.string.length;
                        }
                    });

                    const cursorPos = this.cursorPos === false ? this.lines[this.lines.length - 1].text.length : this.cursorPos;

                    this.cursor.x = this.textIndent + (this.charWidth * cursorPos);
                    this.cursor.y = ((this.lines.length - 1) * this.lineHeight) + 3;
                    this.cursor.height = this.lineHeight;

                    this.add(this.cursor);
                    this.add(this.view);

                    // console.log("test");
                    if(this.height > this.canvas.parentNode.clientHeight) {
                        this.canvas.parentNode.style.overflowY = "scroll";

                        if(this.hasNewLine) {
                            this.canvas.scrollIntoView({ block: 'end' });
                            this.hasNewLine = false;
                        }
                    } else {
                        this.canvas.parentNode.style.overflowY = "hidden";
                    }
                }
            }
        });


    }
}


const cmd = new Term();
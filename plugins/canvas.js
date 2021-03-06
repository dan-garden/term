window.canvasRenderer = new Canv('canvas', {
    filename: "canvas.js",
    setup() {
        if(cmd.pluginExists("fs")) {
            cmd.registerEvent("files-loaded", () => {
                const renderDom = document.createElement('canvas');
                renderDom.id = "render";
                document.body.append(renderDom);
                window.render = false;
                this.renderCode = false;
                this.createFile();
                cmd.registerFunction(() => {
                    if(fs.path === "/") {
                        try {
                            this.createFile();
                            const file = fs.open(this.filename);
                            if(file) {
                                if(this.renderCode!==file.content) {
                                    this.renderCode = file.content;
                                    fs.exec(this.filename);
                                }
                            }
                        } catch {

                        }
                    }


                });
    
                cmd.registerCommand("render-update", () => {
                    const file = fs.open(this.filename);
                    this.renderCode = file.content;
                    fs.exec(this.filename);
                });
                
                cmd.registerCommand("render-capture", () => {
                    if(window.render) {
                        cmd.run("img {{render.toDataURL()}}", false);
                    }
                })
            });
        }
    },

    createFile() {
        if(!fs.exists(this.filename)) {
            fs.newFile(this.filename, `canvasRenderer.updateRender({
    setup() {

    },

    update() {

    },

    draw() {

    }
});`);
        }
    },

    updateRender(config) {
        if(window.render) {
            window.render.stop();
        }
        try {
            if(config.setup) {
                const update_clone = config.update || function() {};
                const setup_clone = config.setup;
                delete config.setup;
                config.update = function (frames) {
                    if(frames === 1) {
                        setup_clone.bind(this)();
                    }
                    update_clone.bind(this)(frames);
                }
            }


            window.render = new Canv('#render', config);
        } catch(e) {
            console.error(e);
        }

        window.render.width = window.innerWidth / 3;
        window.render.height = window.innerHeight;
        window.render.canvas.style.position = "fixed";
        window.render.canvas.style.top = 0;
        window.render.canvas.style.right = 0;
        window.render.fullscreen = false;
    }
})

window.updateRender = window.canvasRenderer.updateRender.bind(window.canvasRenderer);
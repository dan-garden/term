window.canvasRenderer = new Canv('canvas', {
    filename: "canvas.js",
    setup() {
        cmd.registerEvent("files-loaded", () => {
            const renderDom = document.createElement('canvas');
            renderDom.id = "render";
            document.body.append(renderDom);
    
            window.render = false;

            if(!fs.exists(this.filename)) {
                fs.newFile(this.filename);
            }


            this.renderCode = false;
            cmd.registerFunction(() => {
                const file = fs.open(this.filename);
                if(this.renderCode!==file.content) {
                    this.renderCode = file.content;
                    fs.exec(this.filename);
                }
            });

            cmd.registerCommand("update-render", () => {
                const file = fs.open(this.filename);
                this.renderCode = file.content;
                fs.exec(this.filename);
            })
        });
    },

    updateRender(config) {
        if(window.render) {
            window.render.stop();
        }
        window.render = new Canv('#render', config);

        window.render.width = 400;
        window.render.height = 400;
        window.render.canvas.style.position = "fixed";
        window.render.canvas.style.top = 0;
        window.render.canvas.style.right = 0;
        window.render.fullscreen = false;
    }
})

window.updateRender = window.canvasRenderer.updateRender.bind(window.canvasRenderer);
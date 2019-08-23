class Style {
    constructor(styles) {
        const sheet = document.createElement('style');
        sheet.innerHTML = styles;
        return sheet;
    }
}

new Canv('canvas', {
    setup() {
        document.head.appendChild(new Style(`
            .editor-modal {
                display: none;
                position: fixed;
                z-index: 1;
                padding: 30px 0;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgb(0,0,0);
                background-color: rgba(0, 0, 0, 0.4);
            }
            
            .editor-modal-content {
                background-color: ${cmd.colors.secondary};
                margin: auto;
                padding: 0 20px;
                border: 1px solid #888;
                width: 80%;
                position: relative;
                color: ${cmd.colors.primary};
            }

            .editor-close {
                color: ${cmd.colors.primary};
                position: absolute;
                top: 0;
                right: 10px;
                font-size: 28px;
                font-weight: bold;
            }
            
            .editor-close:hover,
            .editor-close:focus {
                color: #000;
                text-decoration: none;
                cursor: pointer;
            }


            .editor-modal-title {
                color: ${cmd.colors.primary};
                font-family: ${cmd.fontFamily};
                text-align: center;
                margin-bottom: 10px;

            }

            .editor-modal-body {
                text-align: center;
                font-size: 14px;
                font-family: ${cmd.fontFamily};
            }

            .editor-code-container {
                height: 300px;
            }

            .editor-modal-action {
                padding: 5px 20px;
                font-size: 16px;
                margin: 10px;
                background-color: ${cmd.colors.primary};
                color: ${cmd.colors.secondary};
                border: 0;
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
                cursor: pointer;
                transition: all 0.2s ease-in;
            }

            .editor-modal-action:hover {
                background-color: ${new Color(cmd.colors.primary).invert()};
                color: ${new Color(cmd.colors.secondary).invert()};
            }
            
        `));

        const editorModal = document.createElement("div");
        editorModal.id = "editorModal";
        editorModal.classList.add("editor-modal");

        const editorModalContent = document.createElement("div");
        editorModalContent.classList.add("editor-modal-content");
        editorModalContent.innerHTML =  `
            <span class="editor-close">&times;</span>
            <div class="editor-modal-inner">
                <h1 class="editor-modal-title"></h1>
                <div class="editor-modal-body"></div>
            </div>
        `;

        editorModal.append(editorModalContent);
        document.body.append(editorModal);


        const editorScript = document.createElement("script");
        editorScript.type = "text/javascript";
        editorScript.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/ace.js";
        document.body.append(editorScript);

        let closeFunction = () => { console.error("Modal error") };
        const closeBtn = document.getElementsByClassName("editor-close")[0];
        closeBtn.onclick = () => closeFunction();
        window.onclick = (event) => {
            event.stopPropagation();
            event.preventDefault();
            if(event.target === editorModal) {
                closeFunction();
            }
        }
        window.addEventListener("keyup", e => {
            if(e.key === "Escape") {
                closeFunction()
            }
        });

        window.addEventListener("keydown", e => {
            if(e.ctrlKey && e.key === "s" && cmd.overlays.length) {
                e.preventDefault();
                closeFunction(true);
            }
        });

        cmd.popup = class {
            constructor(title=null, body=null, code=false, onclose=false) {
                this.open();

                const titleDom = document.querySelector(".editor-modal-inner .editor-modal-title");
                const bodyDom = document.querySelector(".editor-modal-inner .editor-modal-body");
                this.bodyDom = bodyDom;
                this.code = code;
                this.closeHandler = onclose;
                closeFunction = this.close.bind(this);

                if(title) {
                    titleDom.innerHTML = title;
                }
                bodyDom.innerHTML = "";

                if(this.code) {
                    const bodyInnerDom = document.createElement("div");
                    bodyInnerDom.classList.add("editor-code-container");
                    bodyDom.append(bodyInnerDom);
                    this.editor = ace.edit(bodyInnerDom);
                    this.editor.setTheme("ace/theme/monokai");
                    this.editor.session.setValue(body);

                    let mode = "text";
                    let split = title.split(".");
                    let extension = split[split.length-1];

                    if(extension === "js") {
                        mode = "javascript";
                    } else if(extension === "php") {
                        mode = "php";
                    } else if(extension === "json") {
                        mode = "json";
                    } else if(extension === "css") {
                        mode = "css";
                    } else if(extension === "html") {
                        mode = "html";
                    }

                    this.editor.session.setMode("ace/mode/" + mode);
                    cmd.overlays[0].editor.focus();
                    const containerDom = bodyDom.querySelector(".editor-code-container");
                    containerDom.style.height = "300px";

                    if(this.closeHandler) {
                        const action = document.createElement("button");
                        action.innerText = "Save";
                        action.classList.add("editor-modal-action");
                        action.onclick = () => {
                            this.close(true);
                        }
                        bodyDom.append(action);
                    }

                    const cancel = document.createElement("button");
                    cancel.innerText = "Cancel";
                    cancel.classList.add("editor-modal-action");
                    cancel.onclick = () => {
                        this.close();
                    }
                    bodyDom.append(cancel);

                } else {
                    this.editor = false;
                    if(!Array.isArray(body)) {
                        body = [body];
                    }

                    body.forEach(el => {
                        if(el) {
                            if(el instanceof HTMLElement) {
                                bodyDom.appendChild(el);
                            } else {
                                bodyDom.innerHTML += el;
                            }
                        }
                    });
                    bodyDom.style.height = "auto";
                }
            }

            open() {
                editorModal.style.display = "block";
                cmd.overlays = [this];
            }

            close(execAction=false) {
                editorModal.style.display = "none";
                cmd.overlays = [];
                if(this.closeHandler && execAction) {
                    if(this.code) {
                        this.closeHandler(this.editor.getValue());
                    } else {
                        this.closeHandler(this.bodyDom);
                    }
                }
            }

        };
    }
})
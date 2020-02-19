const termux = new Canv('#main', {
    url: "https://termux-web.herokuapp.com",
    maxCount: 100,
    speed: 1000,
    torchState: "off",
    setup() {
        cmd.registerCommand("termux", input => {
            this.exec(input.join(" ")).then(res => {
                cmd.multiLine(res.results.output.trim().split("\n"));
            });
            return undefined;
        });







        this.commands = {
            speed: {
                fn: this.setSpeed,
                title: "Set Speed",
                icon: "fast-forward",
                inputs: {
                    speed: {
                        type: "number",
                        placeholder: "Milliseconds..."
                    }
                }
            },
            command: {
                fn: this.exec,
                title: "Command Input",
                icon: "terminal",
                inputs: {
                    command: {
                        placeholder: "Command..."
                    }
                }
            },
            clear: {
                fn: this.exec,
                title: "Clear Output",
                icon: "trash",
                inputs: {
                    cmd: {
                        type: "hidden",
                        value: "clear",
                    }
                }
            },
            ls: {
                fn: this.exec,
                title: "List Files",
                icon: "list",
                inputs: {
                    cmd: {
                        type: "hidden",
                        value: "ls"
                    }
                }
            },
            mkdir: {
                fn: this.makeDirectory,
                title: "Make Directory",
                icon: "plus-square",
                inputs: {
                    name: {
                        placeholder: "Directory Name"
                    }
                }
            },
            battery: {
                fn: this.getBattery,
                title: "Get Battery",
                icon: "battery"
            },
            location: {
                fn: this.getLocation,
                title: "Get Location",
                icon: "map-pin",
            },
            vibrate: {
                fn: this.vibrate,
                title: "Vibrate",
                icon: "smartphone",
                inputs: {
                    millis: {
                        type: "number",
                        placeholder: "Milliseconds..."
                    }
                }
            },
            torch: {
                fn: this.torch,
                title: "Torch",
                icon: "sun"
            },
            notify: {
                fn: this.notify,
                title: "Notify",
                icon: "alert-circle",
                inputs: {
                    title: {
                        placeholder: "Title..."
                    },
                    content: {
                        placeholder: "Content..."
                    }
                }
            },
        
            share: {
                fn: this.share,
                title: "Share",
                icon: "share",
                inputs: {
                    string: {
                        placeholder: "String..."
                    }
                }
            },
        
            contacts: {
                fn: this.getContacts,
                title: "Get Contacts",
                icon: "book"
            },
        
            front_photo: {
                fn: this.takePhoto,
                title: "Front Photo",
                icon: "skip-forward|camera",
                inputs: {
                    id: {
                        type: "hidden",
                        value: "1"
                    },
                    open: {
                        type: "hidden",
                        placeholder: "open value.  0 = false | 1 = true",
                        value: "0"
                    }
                }
            },
        
            back_photo: {
                fn: this.takePhoto,
                title: "Back Photo",
                icon: "skip-back|camera",
                inputs: {
                    id: {
                        type: "hidden",
                        value: "0"
                    },
                    open: {
                        type: "hidden",
                        placeholder: "open value.  0 = false | 1 = true",
                        value: "0"
                    }
                }
            }
        
        }


        cmd.registerCommand("termux-show", () => {

            const popup = new cmd.popup("Termux Controller", `
                <iframe allowTransparency="true" style="height: 700px; width: 100%; border: none;" src="${this.url}/embed.html"></iframe>
            `);

        })

    },


    async exec(cmd) {
        const req = await fetch(this.url + "/exec?input=" + encodeURIComponent(cmd));
        const res = await req.json();
        let count = 0;
        const output = await new Promise((resolve, reject) => {
            const check = setInterval(async () => {
                if (count > this.maxCount) {
                    resolve({
                        status: "error",
                        message: "Too slow"
                    });
                } else {
                    const o = await this.getOutput(res.id);
                    if (o && o.results) {
                        clearInterval(check);
                        resolve(o);
                    } else {
                        count++;
                    }
                }
            }, this.speed);
        })
        return output;
    },
    
    
    async getOutput(id) {
        const req = await fetch(this.url + "/get-output?id=" + id);
        const res = await req.json();
    
        return res;
    },
    
    async getOutputs() {
        const req = await fetch(this.url + "/get-outputs");
        const res = await req.json();
    
        return res;
    },
    
    async getBattery() {
        return await this.exec("termux-battery-status");
    },
    
    async getLocation() {
        return await this.exec("termux-location");
    },
    
    async vibrate(d = 1000) {
        return await this.exec("termux-vibrate -d " + d);
    },
    
    async notify(title, content) {
        return await this.exec(`termux-notification -t "${title}" -c "${content}"  --led-on 1000`);
    },
    
    async setSpeed(val) {
        return await this.exec(`setspeed ` + val);
    },
    
    async getContacts() {
        return await this.exec(`termux-contact-list`);
    },
    
    
    async torch() {
        this.torchState = this.torchState === 'on' ? 'off' : 'on';
    
        return await this.exec(`termux-torch ${this.torchState}`);
    },
    
    async uploadFile(filename) {
        const input = `curl -s -F "file=@${filename}" https://dan-garden.com/api/post-image.php`;
        return await this.exec(input).then(() => loadOutput());
    },
    
    async takePhoto(id="1", open="0") {
        const filename = "photos/" + id + "_" + Date.now()+".jpeg";
        const res = await this.exec(`termux-camera-photo -c ${id} ${filename}${open ==="1" ? ` && termux-open ${filename}` : ''} && echo "Photo taken using id:${id}"`);
        uploadFile(filename);
        return res;
    },
    
    async makeDirectory(name) {
        return await this.exec(`mkdir ${name}`);
    },
    
    async share(string) {
        return await this.exec(`termux-clipboard-set ${string} && echo ${string}`);
    }
})
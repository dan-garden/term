window.actions = new Canv('#main', {
    recorder: new ActionRecorder(),
    playingRecording: false,
    setup() {
        cmd.registerEvent("char", (e) => {
            if(this.recorder.recording) {
                console.log("marky");
                this.recorder.mark({key: e.key});
            }
        });
        

        cmd.registerCommand("actions start", () => {
            this.startRecording();
        });

        cmd.registerCommand("actions stop", () => {
            this.stopRecording();
        });

        cmd.registerCommand("actions replay", () => {
            this.replayRecording();
        });
    },

    startRecording() {
        this.recorder.startRecording();
    },

    stopRecording() {
        this.recorder.stopRecording();
        console.log(this.recorder.export());
    },

    replayRecording() {
        if(!this.playingRecording) {
            this.playingRecording = true;
            this.recorder.replayRecording((data) => {
                cmd.keyPress(data);
            }, () => {
                this.playingRecording = false;
            });
        }
    },
})
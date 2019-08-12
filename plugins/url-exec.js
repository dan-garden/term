new Canv('canvas', {
    setup() {
        this.loadedParts = [];
        cmd.registerEvent("files-loaded", () => {
            this.loadedParts.push("files-loaded");
            
            this.loaded();
        })

        cmd.registerEvent("plugins-loaded", () => {
            this.loadedParts.push("plugins-loaded");

            this.loaded();
        })



    },

    isLoaded() {
        return this.loadedParts.length === 2;
    },

    loaded() {
        if(this.isLoaded()) {

            const urlParams = new URLSearchParams(window.location.search);
            if(urlParams.get("cmd")) {
                cmd.run(urlParams.get("cmd"), false);
                cmd.newLine();
            }

        }
    }
})
new Canv('#main', {
    setup() {
        cmd.registerCommand("google", args => {
            window.open("https://google.com/search?q=" + args.join(" "))
        })
    }
})
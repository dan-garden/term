window.syntax = new Canv('canvas', {
    setup() {
        this.parser = new DOMParser();
        this.feed = false;

        this.checkNew();
        cmd.registerFunction(() => {
            if(cmd.frames % 10000) {
                // this.checkNew();
            }
        });
    },


    checkNew() {
        this.getFeed(podcasts => {
            if(podcasts.length > this.feed.length) {
                const latest = podcasts[0];
                const link = document.createElement("a");
                link.href = latest.href;
                link.innerText = latest.href;
                this.popup = new cmd.popup("New Syntax.FM Podcast is Out!", [
                    latest.title,
                    "<br />",
                    link,
                    "<br />",
                    latest.description
                ])

            }
            this.feed = podcasts;
        });
    },


    getFeed(callback) {
        fetch("https://feed.syntax.fm/rss")
        .then(result => result.text())
        .then(result => {
            result = this.parser.parseFromString(result, "text/xml");
            result = Array.from(result.querySelectorAll("item")).map(item => {
                return {
                    title: item.querySelector("title").innerHTML,
                    pubDate: item.querySelector("pubDate").innerHTML,
                    href: ("https://" + item.querySelector("link").innerHTML.split("https://")[1]).split("]")[0],
                    description: item.querySelector("description").innerHTML
                }
            });

            if(typeof callback === "function") {
                callback(result);
            }
        })
    }
})
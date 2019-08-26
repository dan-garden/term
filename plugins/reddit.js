window.reddit = new Canv('#main', {
    setup() {
        this.sub = false;
        cmd.registerCommand("reddit", args => {
            this.sub = args.shift();
            if(this.sub) {
                fetch(`https://www.reddit.com/r/${this.sub}.json`)
                .then(result => result.json())
                .then(result => {
                    if(result.data && result.data.children) {
                        this.showPostList(result.data.children);
                    }
                })
            }
        })
    },

    showPostList(postsResult) {
        let postItems = postsResult.map(post => {
            const data = post.data;
            let thumbnail = data.thumbnail !== "self" && data.thumbnail !== "spoiler" ? data.thumbnail : "https://bionic.com.cy/packs/_/assets/images/no-image-placeholder-eb7da0b9897e4da2bd189d1fd0c17ebb.jpg";

            return `
            <li onclick="reddit.enterPost('${escape(JSON.stringify(data))}')" style="display: block; margin: 2px 0; border: solid 1px white;">
                <a href="#" style="display: block; width: 100%; height: 100px; text-decoration: none; color: white;">
                    <img src="${thumbnail}" style="width: 100px; height: 100px; border-right: solid 1px white;"/>
                    <span style="width: calc(100% - 100px); display: inline-block; float: right; padding: 10px;">${data.title}</span>
                </a>
            </li>`;
        })

        let postList = `
            <ul style="list-style-type: none; width: 100%; text-align: left;">
                ${postItems.join('')}
            </ul>`;


        const displayPosts = new cmd.popup('r/'+this.sub, postList);
    },


    enterPost(data) {
        data = JSON.parse(unescape(data));
        let thumbnail = data.thumbnail !== "self" && data.thumbnail !== "spoiler" ? data.thumbnail : "https://bionic.com.cy/packs/_/assets/images/no-image-placeholder-eb7da0b9897e4da2bd189d1fd0c17ebb.jpg";

        const postBody = `
            <img src="${thumbnail}" style="height: 100px;" />
            <p>
                ${data.selftext.split("\n").join("<br />")}
            </p>
        `;

        const displayPost = new cmd.popup(data.title, postBody);
    }
})
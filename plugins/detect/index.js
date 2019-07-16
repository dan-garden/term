new Canv('canvas', {
    setup() {
        cmd.serverType = "js";
        fetch("./plugins/detect/test.php" + "?d=" + new Date().getTime())
        .then(result => result.text())
        .then(result => {
            if(result == "0") {
                cmd.serverType = "php";
            }
        });
    }
})
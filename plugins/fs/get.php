<?php


function getStructure() {
    $fs = [];
    function recursiveGet($fs, $dir) {
        $contents = scandir($dir);
        $blacklist = ["png", "svg", "exe", "ogg"];
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
                    
                    if (strpos($pathInfo["dirname"], '.git') === false) {
                        $fileExt = strtolower($pathInfo['extension']);
                        $contentItemObj["content"] = in_array($fileExt, $blacklist) ? "" : file_get_contents($path);
                        // print_r($pathInfo);
                    } else {
                        $contentItemObj["content"] = "";
                    }

                }

                $fs[] = $contentItemObj;
                if($contentItemObj["content"] !== "") {
                }

            }
        }
        return $fs;
    }

    $fs = recursiveGet($fs, $_GET["root"]);
    return $fs;
}





try {
    $result = json_encode(getStructure(), JSON_PRETTY_PRINT);
    echo $result;
} catch(Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
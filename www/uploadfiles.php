<?php
$uploaddir = '/var/www/uploads/';
$file = date('Ymd-His') . "-" . preg_replace('/[^-0-9A-Za-z_\.]/', '_', basename($_FILES['userfile']['name']));
$uploadfile = $uploaddir . $file;

function check_filename_length ($filename) {
   return (bool) ((mb_strlen($filename,"UTF-8") > 225) ? true : false);
}
$phpFileUploadErrors = array(
    0 => 'There is no error, the file uploaded with success',
    1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
    2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
    3 => 'The uploaded file was only partially uploaded',
    4 => 'No file was uploaded',
    6 => 'Missing a temporary folder',
    7 => 'Failed to write file to disk.',
    8 => 'A PHP extension stopped the file upload.',
 );

//echo '<pre>';
if ($_FILES['userfile']['error'] !== UPLOAD_ERR_OK) {
   echo $phpFileUploadErrors[$_FILES['userfile']['error']] . "\n";
}
elseif (move_uploaded_file($_FILES['userfile']['tmp_name'], $uploadfile)) {
    echo "Successful upload.\n";
} else {
    echo "Something went wrong with storing the uploaded file: ". $_FILES['userfile']['tmp_name'] ." --> ". $uploadfile ."\n";
}

//echo 'Here is some more debugging info:';
//print_r($_FILES);

//print "</pre>";

?>

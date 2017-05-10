<?php
	include_once('../library.php');
	include_once('../config.php');
	
	$Uploads = new Uploads($config);

	$file_id = $_POST['id'];

	/*here database query - get file by ID*/
	$file_info = array(
		'name' => 'Chrysanthemum',
		'ext' => 'jpg',
		'path' => '2017/05/10/',
		'type' => 'image/jpeg'
	);
	$subfolder = 'media_library';
	$res = $Uploads->deleteFile($subfolder, $file_info);
	/* here - remove image from database*/

	if($res){
		echo json_encode(array(
			"type" => "Success",
			"text" => "Files was removed successfull."
		));
	} else {
		echo json_encode(array(
			"type" => "Error",
			"text" => "Error of removing."
		));
	}
?>
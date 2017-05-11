<?php
	include_once('../library.php');
	include_once('../config.php');
	
	$Uploads = new Uploads($config);

	$file_info = array();
	foreach($_FILES as $one_file){
		$file_info = $one_file;
	}

	$subfolder = 'media_library';
	$file_info = $Uploads->uploadFile($file_info, $subfolder);

	if($file_info['name']){
		/*here add to database and get ID*/
		$file_id = 1;
		echo json_encode(array(
			'id' => $file_id,
			'src' => $config['base_url'] . 'images/' . $subfolder . '/' . $file_info['path'] . $file_info['name'] . '.' . $file_info['ext'],
			'thumb' => $config['base_url'] . 'images/' . $subfolder . '/' . $file_info['path'] . $file_info['name'] . '-150x200.' . $file_info['ext'],
			'width' => $file_info['width'],
			'height' => $file_info['height'],
			"file_type" => 'image/jpeg',
			"type" => "Success",
			"text" => "Files was uploaded successfull."
		));
	} else {
		echo json_encode(array(
			'type' => 'Error',
			'text' => 'Error of uploading'
		));
	}
	
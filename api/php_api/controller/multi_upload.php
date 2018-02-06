<?php
	include_once('../library.php');
	include_once('../config.php');
	
	$Uploads = new Uploads($config);

	$response = array();
	$response_index = 0;

	$files_info = $_FILES;

	$subfolder = 'media_library';
	$data = $Uploads->multiUploadFiles($files_info, $subfolder);

	if($data){
		foreach ($data as $one_data) {
			/*here add to database and get ID*/
			$file_id = 1;

			if(isset($one_data['error'])){
				$response[$response_index]['type'] = "Error"; 
				$response[$response_index]['text'] = $one_data['error'];
			} else {
				$response[$response_index]['type'] = "Success";
				$response[$response_index]['text'] = "Files was uploaded successfull.";
				$response[$response_index]['src'] = $config['base_url'] . 'images/' . $subfolder . '/' . $one_data['path'] . $one_data['name'] . '.' . $one_data['ext'];
				$response[$response_index]['thumb'] = $config['base_url'] . 'images/' . $subfolder . '/' . $one_data['path'] . $one_data['name'] . '-150x200.' . '.' . $one_data['ext'];
				$response[$response_index]['id'] = $file_id;
				$response[$response_index]['file_type'] = $one_data['mime'];
				$response[$response_index]['width'] = $one_data['width'];
				$response[$response_index]['height'] = $one_data['height'];
			}

			$response_index++;
		}
	}

	echo json_encode($response);	
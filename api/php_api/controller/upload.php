<?php
	include_once('../library.php');
	include_once('../config.php');
	
	$Uploads = new Uploads($config);

	$file_name = '';
	if(is_array($_FILES)){
		foreach ($_FILES as $key => $one_file) {
			$file_name = $key;
		}

		$response = $Uploads->uploadFile($_FILES[$file_name], 'media_library');

		/*here you can insert file to database
		ID - ID of uploaded file
		 */
		$ID = 1;

		if($response['type'] == 'success'){
			$response['text'] = "Files was uploaded successfull.";
			$response['id'] = $ID;
		}

		echo json_encode($response);
	}
	
?>

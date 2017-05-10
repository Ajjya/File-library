<?php
	include_once('../library.php');
	include_once('../config.php');
	
	$Uploads = new Uploads($config);

	$data = $_POST['dataURL'];
	$img_id = $_POST['id'];

	/*here database query - get image by ID*/
	$image_info = array(
		'name' => 'Chrysanthemum',
		'ext' => 'jpg',
		'path' => '2017/05/10/',
		'type' => 'image/jpeg'
	);

	if($image_info){
		$subfolder = 'media_library';
		$res = $Uploads->replaceCroppedImg($data, $subfolder, $image_info);
		if($res['name']){
			/*here database query - update image*/
			echo json_encode(array(
				'id' => $img_id,
				'src' => $config['base_url'] . 'images/' . $subfolder . '/' . $image_info['path'] . $res['name'] . '.' . $image_info['ext'],
				'thumb' => $config['base_url'] . 'images/' . $subfolder . '/' . $image_info['path'] . $res['name'] . '-150x200.' . $image_info['ext'],
				'width' => $res['width'],
				'height' => $res['height'],
				"type" => "Success",
				"text" => "Files was cropped successfull."
			));
		}
	} else {
		echo json_encode(array(
			'type' => 'Error',
			'text' => 'Error of cropping'
		));
	}
	
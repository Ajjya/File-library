<?php
	/**
	* Upload file class
	*
	**/

	class Uploads {
		private $sizes = array(
			'thumb' => array(
				'width' => 150,
				'height' => 200
			)
		);
		private $maxsize = 1048576;
		private $mime = ['image/*'];
		private $config = [
			'doc_root' => '.',
			'upload_folder' => 'images/',
			'base_url' => ''
		];


		public function __construct($config = array(), $sizes = false, $maxsize = false, $mime = false){
			umask(0);
			if($sizes && is_array($sizes)){
				$this->sizes = $sizes;
			}

			if($maxsize){
				$this->maxsize = (int)$maxsize;
			}

			if($mime && is_array($mime)){
				$this->mime = $mime;
			}

			if(count($config)){
				if(isset($config['doc_root'])){
					$this->config['doc_root'] = $config['doc_root'];
				}

				if(isset($config['upload_folder'])){
					$this->config['upload_folder'] = $config['upload_folder'];
				}

				if(isset($config['base_url'])){
					$this->config['base_url'] = $config['base_url'];
				}
			}
		}


		/**
		* File Validation function
		*
		* @param $file_info - $_FILES of uploaded file 
		*
		* @return array of errors. Empty array if no errors. 
		* Avaliable errors: 'wrong_file_size', 'wrong_file_type'
		**/
		private function fileValidation($file_size = false, $file_type = false){
			$errors = array();

			if($file_size !== false){
				if($file_size > $this->maxsize || $file_size <= 0){
					$errors[] = 'wrong_file_size';
				}
			}
			
			if($file_type !== false){
				$mime_res = false;
				if(strpos($file_type, 'image') !== false){
					if(in_array('image/*', $this->mime)){
						$mime_res = true;
					}
				} 

				if(!$mime_res){
					if(in_array($file_type, $this->mime)){
						$mime_res = true;
					}
				}

				if(!$mime_res){
					$errors[] = 'wrong_file_type';
				}
			}
			
			return $errors;
		}


		/**
		* createFolder function 
		* Create folder before uploading file
		*
		* @param 
		* $dir - string, path to parent dir 
		* $today - timestamp
		*
		* @return path to created folder 
		* 
		**/
		private function createFolder($dir, $today){
			$dir = $dir . date('Y', $today) . '/' . date('m', $today) . '/' . date('d', $today) . '/';
			if(!is_dir($dir)){
				mkdir ($dir, 0777, true);
			}
			return $dir;
		}


		/**
		* base64ToJpeg function 
		* convert base64 string to JPG (used for cropping files)
		*
		* @param 
		* $base64_string - string, base64 file 
		* $output_file - new file path
		*
		* @return path to created folder 
		* 
		**/
		private function base64ToJpeg($base64_string, $output_file) {
			$ifp = fopen($output_file, "wb"); 

			$data = explode(',', $base64_string);

			fwrite($ifp, base64_decode($data[1])); 
			fclose($ifp); 

			return $output_file; 
		}


		/**
		* __process_image function 
		* resize image file
		*
		* @param 
		* $sfile - path to source file
		* $dfile - path to destination file
		* $wh - new width, 
		* $hw - new height,
		* $crop - if file can be cropped
		* $x_axis - sets the X coordinate in pixels for image cropping. For example, a setting of 30 will crop an image 30 pixels from the left.
		* $y_axis - Sets the Y coordinate in pixels for image cropping. For example, a setting of 30 will crop an image 30 pixels from the top.
		* @return path to created folder 
		* 
		**/
		private function __process_image($sfile, $dfile, $wh, $hw = 0, $crop = false, $x_axis = 0, $y_axis = 0)
		{
			$dimensions = getimagesize($sfile);

			if (!$crop)
			{
				if($dimensions[0] < $wh)
				{
					$wh = $dimensions[0];
					$hw = $dimensions[1];
				} else {
					$wh = ceil( $dimensions[0] / ($dimensions[0] / $wh) );
					$hw = ceil( $dimensions[1] / ($dimensions[0] / $wh) );
				}

			} else {
				if($dimensions[0] - $x_axis < $wh)
				{
					$wh = $dimensions[0] - $x_axis;
				}
				if($dimensions[1] - $y_axis < $hw)
				{
					$hw = $dimensions[1] - $y_axis;
				}

				
			}


			$thumb = imagecreatetruecolor($wh, $hw);
			$handle_sfile = imagecreatefromjpeg($sfile);

			$res_image_resized = imagecopyresized ( $thumb , $handle_sfile , $x_axis , $y_axis , 0 , 0 , $wh , $hw , $dimensions[0] , $dimensions[1] );
			imagejpeg ( $thumb, $dfile );

			return $res_image_resized;
		}


		/**
		* uploadFile function 
		* upload files
		*
		* @param 
		* $file_info - $_FILES
		* $subfolder - subfolder
		* @return info of moved file
		* 
		**/
		public function uploadFile($file_info, $subfolder){
			/*create uploads folder*/
			if(!file_exists($this->config['doc_root'] . '/uploads/')){
				$res = mkdir ($this->config['doc_root'] . '/uploads/', 0777, true);
			}

			$response = [];

			if(!$file_info){
				$response['error'] = 'uploading_attack';
				return $response;
			}

			$response['error'] = $this->fileValidation($file_info['size'], $file_info['type']);
			if(count($response['error'])){
				return $response;
			}

			$uploaddir = $this->config['doc_root'] . '/uploads/';
			$uploadfile = $uploaddir . basename($file_info['name']);

			if (move_uploaded_file($file_info['tmp_name'], $uploadfile)) {
				$response = $this->moveFile($uploadfile, $subfolder, $file_info['type']);
			} else {
				$response['error'] = 'uploading_attack';
			}

			return $response;
		}


		public function multiUploadFiles($files_info, $subfolder){
			$files_info = $this->prepare_files($files_info);
			$response = [];

    		foreach ($files as $key => $one_file_info) {
    			$this->uploadFile($one_file_info, $subfolder);
    		}

    		return $response;
		}


		/**
		* isFileExist function 
		* function checks is file exist and generate new filename
		*
		* @param 
		* $dir - path to directory
		* $file_name - file name
		* $file_ext - file extantion
		* @return array of new file name
		* 
		**/
		private function isFileExist($dir, $file_name, $file_ext){
			$res_name = '';
			$file_index = '';
			$file_path = $dir . $file_name.'.'.$file_ext; 

			if(file_exists($file_path))
			{
				for($file_index = 1; 1 > 0; $file_index++ )
				{
					$file_path = $dir . $file_name.'_'.$file_index.'.'.$file_ext; 
					$file_name = $file_name.'_'.$file_index;
					if(!file_exists( $file_path ))
					{
						break;
					}
				}
			}

			return array(
				'new_file_name' => $file_name,
				'new_file_ext' => $file_ext,
				'new_file_index' => $file_index,
				'new_file_path' => $file_path
			);
		}

		/**
		* moveFile function 
		* function copy file to destination path and crops images to thumbnails
		*
		* @param 
		* $source - path to source file
		* $subfolder - subfolder
		* $file_mime - file mime
		* $is_copy - to remove source file or not
		* @return path to created folder 
		* 
		**/
		private function moveFile($source, $subfolder, $file_mime, $is_copy = false){
			$today = time();
			$dir = $this->config['doc_root'] . '/' . $this->config['upload_folder'] . '/' . $subfolder . '/';
			$dir = $this->createFolder($dir, $today);

			$path_info = pathinfo($source);

			$file_info = array();
			$file_info['raw_name'] = $path_info['filename'];
			$file_info['res_name'] = $path_info['filename'];
			$file_info['name'] = $path_info['filename'] . '.' . $path_info['extension'];
			$file_info['file_ext'] = $path_info['extension'];
			$file_info['server_dir'] = $path_info['dirname'];
			$file_info['server_path'] = $file_info['server_dir'] . '/' . $file_info['raw_name'] . '.' . $file_info['file_ext'];

			$file_name = $file_info['raw_name'];
			$ext = $file_info['file_ext'];

			$new_file_info = $this->isFileExist($dir, $file_name, $ext);

			$file_info['res_name'] = $new_file_info['new_file_name'];
			$new_file_index = $new_file_info['new_file_index'];
			$new_file_path = $new_file_info['new_file_path'];
			$new_file_ext = $new_file_info['new_file_ext'];

			$width = 0;
			$height = 0;
			/*create thumbs if type is image*/
			if(strpos( $file_mime , 'image' ) !== false){
				foreach ($this->sizes as $one_size) {
					if($new_file_index){
						$th_path = $dir.'/'.$file_info['raw_name'].'_' . $new_file_index . '-' . $one_size['width'] . 'x' . $one_size['height'] . '.' . $file_info['file_ext'];
					} else {
						$th_path = $dir.'/'.$file_info['raw_name'] . '-' . $one_size['width'] . 'x' . $one_size['height'] . '.' . $file_info['file_ext'];
					}
					
					$this->__process_image($file_info['server_path'], $th_path, $one_size['width']);
				}

				list($width, $height) = getimagesize($file_info['server_path']);
			}

			copy ( $file_info['server_path'], $new_file_path );

			if(!$is_copy){
				unlink($file_info['server_path']);
			}

		    $result = array(
		    	'type' => 'success',
		    	'name' => $file_info['res_name'],
		    	'ext' =>  $file_info['file_ext'],
		    	'path' => date('Y', $today) . '/' . date('m', $today) . '/' . date('d', $today) . '/',
		    	'width' => $width,
		    	'height' => $height,
		    	'mime' => $file_mime
		    );

		    $result['src'] = $this->config['base_url'] . $this->config['upload_folder'] . '/' . $subfolder . '/' . $result['path'] . $result['name'] . '.' . $result['ext'];

		    return $result;
		}


		/**
		* replaceCroppedImg function 
		* function replaces and renames cropped image 
		*
		* @param 
		* $data - base_64 image
		* $subfolder - subfolder for files of current type
		* $image_info = array(
		* 	'name' => image name,
		* 	'ext' => image extention,
		*   'path' => path to file  - Y/m/d - '2017/05/10/'
		* )
		* @return image info 
		* 
		**/
		public function replaceCroppedImg($data, $subfolder, $image_info){
			$name = preg_replace_callback(
				'/_cr([0-9])+/', 
				function ($matches) {
					return "_cr" . ((int)$matches[1] + 1);
				},
				$image_info['name']);
			if($name == $image_info['name']){
				$name = $image_info['name'] . '_cr0';
			}

			$dir = $this->config['doc_root'] . '/'. $this->config['upload_folder'] . $subfolder . '/' . $image_info['path'];
			$new_file_info = $this->isFileExist($dir, $image_info['name'], $image_info['ext']);
			$name = $new_file_info['new_file_name'];

			$old_path = $dir . $image_info['name'] . '.' . $image_info['ext'];
			unlink($old_path);

			$path = $dir . $name . '.' . $image_info['ext'];
			$this->base64ToJpeg($data, $path);

			list($width, $height) = getimagesize($path);

			/*create thumbs*/
			foreach ($this->sizes as $one_size) {
				$old_th_path = $dir . $image_info['name'] . '-' . $one_size['width'] . 'x' . $one_size['height'] . '.' . $image_info['ext'];
				unlink($old_th_path);
				$th_path = $dir . $name . '-' . $one_size['width'] . 'x' . $one_size['height'] . '.' . $image_info['ext'];
				$this->__process_image($path, $th_path, $one_size['width']);
			}

			return array(
				'name' => $name,
				'height' => $height,
				'width' => $width
			);
		}


		/**
		* deleteFile function 
		* function deletes files
		*
		* @param 
		* $subfolder - subfolder
		* $file_info - array, info about file
		* $file_info = array(
		* 	'name' => image name,
		* 	'ext' => image extention,
		*   'path' => path to file  - Y/m/d - '2017/05/10/'
		*	'type' =>  mi,me type - 'image/jpeg'
		* );
		* @return bool 
		* 
		**/
		public function deleteFile($subfolder, $file_info){
			$dir = $this->config['doc_root'] . '/'. $this->config['upload_folder'] . $subfolder . '/' . $file_info['path'];
			$filepath = $dir.'/'.$file_info['name'] . '.' . $file_info['ext'];

			if(file_exists($filepath)){
				unlink( $filepath );
				if(strpos( $file_info['type'] , 'image' ) !== false){
					foreach ($this->sizes as $one_size) {
						$th_path = $dir.'/'.$file_info['name'] . '-' . $one_size['width'] . 'x' . $one_size['height'] . '.' . $file_info['ext'];
						unlink( $th_path );
					}
				}
				return true;
			} else {
				//var_dump('Warning! File ' . $filepath . ' is not exist');
				return false;
			}

			return false;
		}


		/**
		* prepare multi $_FILES
		*
		* @param 
		* $files_input - $_FILES data
		* @return modifyed $files_input bool 
		* 
		**/
		private function prepare_files($files_input){
			$files_res = [];

			foreach ($files_input as $key => $one_file) {
				if(strpos($key, 'upl_') == 0 || strpos($key, 'multi_upl_') == 0){
					if(is_array($one_file['name'])){
						foreach($one_file['name'] as $k => $one_name){
							$files_res[$k]['name'] = $one_name;
						}
					} else {
						$files_res[0]['name'] = $one_file['name'];
					}

					if(is_array($one_file['type'])){
						foreach($one_file['type'] as $k => $one_name){
							$files_res[$k]['type'] = $one_name;
						}
					} else {
						$files_res[0]['type'] = $one_file['type'];
					}

					if(is_array($one_file['tmp_name'])){
						foreach($one_file['tmp_name'] as $k => $one_name){
							$files_res[$k]['tmp_name'] = $one_name;
						}
					} else {
						$files_res[0]['tmp_name'] = $one_file['tmp_name'];
					}

					if(is_array($one_file['error'])){
						foreach($one_file['error'] as $k => $one_name){
							$files_res[$k]['error'] = $one_name;
						}
					} else {
						$files_res[0]['error'] = $one_file['error'];
					}

					if(is_array($one_file['size'])){
						foreach($one_file['size'] as $k => $one_name){
							$files_res[$k]['size'] = $one_name;
						}
					} else {
						$files_res[0]['size'] = $one_file['size'];
					}
				}
			}

			return $files_res;
		}

	}



?>
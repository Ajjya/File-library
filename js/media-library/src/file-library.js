/* ========================================================================
 * Simple javascript library for showing, uploading, cropping, deleting files
 * ========================================================================
 * Copyright 2017.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * Author: Vladyslava Prykhodko
 * ======================================================================== */
/**
* 
* @param options - object, actions - array, filetype - array, links - object
* var fl = new FileLibrary(
*	{
*		maxUploadSize: 1000000,
*		ln: 'EN'
*	},
*	['upload', 'crop', 'remove', 'library'], 
*	['image/*'],
*	{
*		library: 'http://site.ru/library',
*		upload: 'http://site.ru/upload',
*       crop: 'http://site.ru/crop',
*       remove: 'http://site.ru/remove'
*	}
*);
*
* @param buttons - array of action buttons,  
* fl.init(
*	{
*		library_buttons: [$('#but1'), $('#but2')],
*		upload_buttons: [$('#but1'), $('#but2')],
*		crop_buttons: [$('#but1'), $('#but2')],
*		remove_buttons: [$('#but1'), $('#but2')]
*	}
* );
*
* Events:
*
* libraryActiveFileChanged
* fileUploaded
* fileCropped
* fileRemoved
*/

(function(window, $, Cropper, flmodal){
	if (typeof jQuery === 'undefined') {
		throw new Error('File library\'s JavaScript requires jQuery')
	}

	var version = $.fn.jquery.split(' ')[0].split('.')
		if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
		throw new Error('File library\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
	}


	var FileLibrary = function(settings, actions, filetypes, links, dataFileOptions){
		var self = this;

		this.translation = {};

		this.buttonIndex = {
			upload: 0,
			library: 0
		};

		this.activeFile = {
			current: null,
			upload: null,
			crop: null,
			remove: null
		};

		this.links = {
			upload: '#',
			crop: '#',
			library: '#',
			remove: '#'
		};

		this.settings = {
			maxUploadSize: 1000000,
			language: "EN"
		};

		/*use can use other options you need*/
		this.dataFileOptions = {
			aspectRatio: false,
			groupID: false 
		};

		this.status = {
			library: "closed"
		};

		this.actions = ['upload', 'crop', 'remove', 'library'];
		this.filetype = ['image/*', 'application/pdf'];

		if(settings){
			if(settings.maxUploadSize){
				this.settings.maxUploadSize = settings.maxUploadSize;
			}
			if(settings.language){
				this.settings.language = settings.language;
			}
		}

		if(links){
			this.links = links;
		};

		if(actions){
			this.actions = actions;
		};

		if(filetypes){
			this.filetypes = filetypes;
		};

		if(dataFileOptions){
			this.dataFileOptions = this.dataFileOptions;
		};

		this.filetypes_string = this.filetypes.join ( '|' );
		this.loadLanguage();
		this.addModals();
	}

	FileLibrary.prototype.loadLanguage = function(ln){
		var self = this;
		if(ln == undefined){
			ln = self.settings.language;
		}

		$.ajax({
			url: self.links.language + ln + '.json',
			async: false,
			type: "GET",
			dataType: 'text',
			success: function(data){
				self.translation = JSON.parse(data);
			},
			error: function(error){
				console.log('Error of uploading language');
			}
		});
	}

	FileLibrary.prototype.addModals = function(){
		var self = this;
		/*upload action*/
		if(this.actions.indexOf('upload') !== -1){
			/*append loader*/
			$('body').append("<div id='loading'>\
				<div class='loadWrapp'>\
					<progress id='progressBar' value='0' max='100' style='width:300px;'></progress>\
					<h3 id='status'></h3>\
					<button style='display:none' class='btn btn-default' id='OK'>" + self.translation.OK + "</button>\
				</div>\
			</div>");

		
			$('#OK').on('click', function(){
				$('#loading').hide();
			});
		}

		/*library action*/
		if(this.actions.indexOf('library') !== -1){
			/*append modal library*/
			$('body').append("<div class='modal fade' id='LibraryModal' tabindex='-1' role='dialog'>\
				<div class='modal-dialog'>\
					<div class='modal-content'>\
						<div class='modal-header'>\
							<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>\
							<h4 class='modal-title'>" + self.translation.file_library + "</h4>\
						</div>\
						<div class='modal-body' id='lib_body'>\
						</div>\
						<div class='modal-footer'>\
							<button type='button' class='btn btn-default' id='add_file' data-dismiss='modal'>" + self.translation.add_new_file + "</button>\
							<button type='button' class='btn btn-primary' id='use_file' data-dismiss='modal'>" + self.translation.use_file + "</button>\
						</div>\
					</div>\
				</div>\
			</div>");

			/*pagination*/
			$('#LibraryModal .modal-content').on('click', '.pagination a', function(){
				var href = $(this).attr('href');
					self.library(href);
				return false;
			});

			$('#use_file').on('click', self.useFile.bind(self));

			if(this.actions.indexOf('upload') !== -1){
				$('#add_file').on('click', function(){
					$(this).after('<form enctype="multipart/form-data" style="display:none;"><input type="file" action="' + self.links.upload + '" method="POST" id="add_file_form" name="add_img_form" accept="' + self.filetypes_string + '"/></form>');
					$('#add_file_form').trigger('click');
					$('#add_file_form').on('change', function(event){
						self.uploadFile(event, self);
					});
				});
			} else {
				$('#add_file').remove();
			}

			if(this.actions.indexOf('crop') !== -1){
				$('#LibraryModal .modal-content').on('click', '[data-action="crop"]', function(event){
					if(self.status.library == 'opened'){
						self.hideLibrary();
					} else {
						self.closeLibrary();
					}
					self.activeFile.crop = {
						'id' : $(this).attr('data-file-id'),
						'src' : $(this).attr('data-file-src')
					}
					self.cropImage();
					event.stopPropagation();
					return false;
				});
			}

			if(this.actions.indexOf('remove') !== -1){
				$('#LibraryModal .modal-content').on('click', '[data-action="remove"]', function(event){
					self.activeFile.remove = {
						'id' : $(this).attr('data-file-id')
					}
					self.removeFile();
					event.stopPropagation();
					return false;
				});
			}
		}

		if(this.actions.indexOf('crop') !== -1){
			/*append modal crop*/
			$('body').append("<div class='modal fade' id='CropModal' tabindex='-1' role='dialog'>\
				<div class='modal-dialog'>\
					<div class='modal-content'>\
						<div class='modal-header'>\
							<h4 class='modal-title'>Crop Image</h4>\
						</div>\
						<div class='modal-body' id='crop_body'>\
							<div class='row'>\
								<div class='col-md-12 docs-buttons'>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='setDragMode' data-option='move' title='Move'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Move'><span class='fa fa-arrows'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='setDragMode' data-option='crop' title='Crop'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Crop'><span class='fa fa-crop'></span></span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='zoom' data-option='0.1' title='Zoom In'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Zoom In'><span class='fa fa-search-plus'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='zoom' data-option='-0.1' title='Zoom Out'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Zoom Out'><span class='fa fa-search-minus'></span></span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='move' data-option='-10'  data-second-option='0' title='Move Left'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Move Left'><span class='fa fa-arrow-left'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='move' data-option='10' data-second-option='0' title='Move Right'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Move Right'><span class='fa fa-arrow-right'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='move' data-option='0' data-second-option='-10' title='Move Up'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Move Up'><span class='fa fa-arrow-up'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='move' data-option='0' data-second-option='10' title='Move Down'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Move Down'><span class='fa fa-arrow-down'></span></span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='rotate' data-option='-45' title='Rotate Left'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Rotate Left'><span class='fa fa-rotate-left'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='rotate' data-option='45' title='Rotate Right'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Rotate Right'><span class='fa fa-rotate-right'></span></span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='scaleX' data-option='-1' title='Flip Horizontal'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Flip Horizontal'><span class='fa fa-arrows-h'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='scaleY' data-option='-1' title='Flip Vertical'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Flip Vertical'><span class='fa fa-arrows-v'></span></span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='crop' title='Crop'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Crop'><span class='fa fa-check'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='clear' title='Clear'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Clear'><span class='fa fa-remove'></span></span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='disable' title='Disable'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Disable'><span class='fa fa-lock'></span></span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='enable' title='Enable'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Enable'><span class='fa fa-unlock'></span></span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='moveTo' title='Move Top Left' data-option='0'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Move Top Left'>0,0</span>\
										</button>\
										<button type='button' class='btn btn-primary' data-method='zoomTo' title='100%' data-option='1'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='100%'>100%</span>\
										</button>\
									</div>\
									<div class='btn-group'>\
										<button type='button' class='btn btn-primary' data-method='grayScale' title='Black and White'>\
											<span class='docs-tooltip' data-toggle='tooltip' title='Black and White'><span class='fa fa-adjust'></span></span>\
										</button>\
									</div>\
								</div>\
							</div>\
							<div class='row'>\
								<div class='col-md-12'>\
									<div class='img-container'>\
										<img class='cropper' id='imgAreaSelect'>\
									</div>\
								</div>\
							</div>\
						</div>\
						<div class='modal-footer'>\
							<button type='button' class='btn btn-default refuse' data-dismiss='modal' id='refuseCrop'>" + self.translation.not_crop + "</button>\
							<button type='button' class='btn btn-primary' data-dismiss='modal' id='saveCroppedToFile'>" + self.translation.crop + "</button>\
						</div>\
					</div>\
				</div>\
			</div>");
			
			/*crop options*/
			$options = {
				modal: true,
				// minContainerHeight: 344
			}

			$cropImage = $("#imgAreaSelect");
			$cropImage.cropper($options);

			$('[data-toggle="tooltip"]').fltooltip();

			if (typeof document.createElement('cropper').style.transition === 'undefined') {
				$('button[data-method="rotate"]').prop('disabled', true);
				$('button[data-method="scale"]').prop('disabled', true);
			}

			$('.docs-buttons').on('click', '[data-method]', function () {
				var $this = $(this);
				var data = $this.data();
				var $target;
				var result;

				if ($this.prop('disabled') || $this.hasClass('disabled')) {
					return;
				}

				if ($cropImage.data('cropper') && data.method) {

					data = $.extend({}, data); // Clone a new one

					if (typeof data.target !== 'undefined') {
						$target = $(data.target);

						if (typeof data.option === 'undefined') {
							try {
								data.option = JSON.parse($target.val());
							} catch (e) {
								console.log(e.message);
							}
						}
					}

					result = $cropImage.cropper(data.method, data.option, data.secondOption);
					

					switch (data.method) {
						case 'scaleX':
						case 'scaleY':
							$(this).data('option', -data.option);
							break;
					}

					if ($.isPlainObject(result) && $target) {
						try {
							$target.val(JSON.stringify(result));
						} catch (e) {
							console.log(e.message);
						}
					}

				}
			});

			// Keyboard
			$(document.body).on('keydown', function (e) {

				if (!$cropImage.data('cropper') || this.scrollTop > 300) {
					return;
				}

				switch (e.which) {
				case 37:
					e.preventDefault();
					$cropImage.cropper('move', -1, 0);
					break;

				case 38:
					e.preventDefault();
					$cropImage.cropper('move', 0, -1);
					break;

				case 39:
					e.preventDefault();
					$cropImage.cropper('move', 1, 0);
					break;

				case 40:
					e.preventDefault();
					$cropImage.cropper('move', 0, 1);
					break;
				}

			});
			$('#saveCroppedToFile').on('click', self.saveCroppedImageToFile.bind(self));
			$('#refuseCrop').on('click', function(){
				if(self.status.library == "opened"){
					self.library();
				}
			});
			/*end crop options*/
		}

		/*error modal*/
		$('body').append("<div class='modal fade' id='ErrorModal' tabindex='-1' role='dialog'>\
			<div class='modal-dialog error-modal'>\
				<div class='modal-content'>\
					<div class='modal-header'>\
						<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>\
						<h4 class='modal-title'>" + self.translation.error + "</h4>\
					</div>\
					<div class='modal-body' id='error_body'>\
					</div>\
				</div>\
			</div>\
		</div>");

		/*activate modals*/
		$('.modal').flmodal();
	}

	FileLibrary.prototype.init = function(buttons){
		var self = this;

		if(buttons){
			if(buttons.upload_buttons){
				/*each upload button - upload form*/
				buttons.upload_buttons.forEach(function(item){
					item.el.after('<form enctype="multipart/form-data" style="display:none;">\
						<input type="file" action="' + self.links.upload + '" method="POST" id="upl_' + self.buttonIndex.upload + '" name="upl_' + self.buttonIndex.upload + '" />\
					</form>');
					item.el.attr('data-uploader-id', self.buttonIndex.upload);
					item.el.on('click', function(){
						var uploader_id = $(this).attr('data-uploader-id');
						$('#upl_' + uploader_id).trigger('click');
						return false;
					});
					$('#upl_' + self.buttonIndex.upload).on('change', function(event){
						self.uploadFile(event, {aspectRatio: item.aspectRatio});
					});
					self.buttonIndex.upload++;
				});
			}

			if(buttons.library_buttons){
				buttons.library_buttons.forEach(function(item, i){
					item.el.on('click', function(event){
						self.library();
						return false;
					});
				});
			}

			if(buttons.crop_buttons){
				buttons.crop_buttons.forEach(function(item, i){
					item.el.on('click', function(){
						self.activeFile.crop = {
							'id' : $(this).attr('data-file-id'),
							'src' : $(this).attr('data-file-src')
						}
						self.cropImage();
						return false;
					});
				});
			}

			if(buttons.remove_buttons){
				buttons.remove_buttons.forEach(function(item, i){
					item.el.on('click', function(){
						self.activeFile.remove = {
							'id' : $(this).attr('data-file-id'),
						}
						self.removeFile();
						return false;
					});
				});
			}
		}
	}

	/*general*/
	FileLibrary.prototype.showError = function(error){
		if(error.length){
			var str = "";
			for(var i in error){
				str += error[i] + "\n";
			}

			$('#error_body').empty();
			$('#error_body').append(str);
			$('#ErrorModal').flmodal('show');
		}
	}

	/*library*/
	FileLibrary.prototype.showLibrary = function(){
		if($('#LibraryModal').length > 0){
			$('#LibraryModal').flmodal('show');
			this.status.library = "opened";
		}
	}

	FileLibrary.prototype.hideLibrary = function(){
		if($('#LibraryModal').length > 0){
			$('#LibraryModal').flmodal('hide');
		}
	}

	FileLibrary.prototype.openLibrary = function(){
		if($('#LibraryModal').length > 0){
			this.showLibrary();
			if(this.activeFile.current){
				var choosen_file = $('#LibraryModal li[data-file-id=' + this.activeFile.current.id + ']');
				this.chooseFile(choosen_file);
			}
		}
	}

	FileLibrary.prototype.closeLibrary = function(){
		if($('#LibraryModal').length > 0){
			this.hideLibrary();
			this.status.library = "closed";
		}
	}

	/*this function for activation dataFileOptions not only after init*/
	FileLibrary.prototype.dataFileOptionInit = function(options){
		this.dataFileOptions = options;
		// /*open library after init*/
		// this.library();
	}

	/*When user uses file - event libraryActiveFileChanged triggers with options*/
	FileLibrary.prototype.useFile = function(event){
		var self = this;
		if(self.activeFile.current !== null){
			$( document ).trigger( "libraryActiveFileChanged", [ self.activeFile.current, self.dataFileOptions ] );
		}
		self.activeFile.current = null;
		self.closeLibrary();
	}

	FileLibrary.prototype.chooseFileEvent = function(event){
		var self = this;
		var $img = $(event.target);
		self.chooseFile($img);
	}

	FileLibrary.prototype.chooseFile = function($img){
		var self = this;
		
		var $el = $img.closest('li');
		var $par = $el.closest('ul');
		self.activeFile.current = {
			'src' : $el.attr('data-file-src'),
			'id' : $el.attr('data-file-id'),
			'thumb': $img.attr('src'),
			'alt': $el.attr('alt'),
			'width': $el.attr('data-file-width'),
			'height': $el.attr('data-file-height'),
		};

		$par.find('li').removeClass('active');
		$el.addClass('active');
	}

	FileLibrary.prototype.removeImgFromLib = function(file_id){
		var self = this;
		$('#I' + file_id).remove();
	}


	FileLibrary.prototype.library = function(link){
		var self = this;
		if(link == undefined){
			link = self.links.library;
		}

		$.ajax({
			url: link,
			dataType : "json",
			type: "GET",
			success: function(data){
				img_arr = data.img_arr;

				$('#lib_body').empty();
				var lib_str = '<ul class="lib_list">';
				for(var i in img_arr){
					lib_str += '<li data-file-src="' + img_arr[i].src + '" data-file-id="' + img_arr[i].ID + '" data-file-width="' + img_arr[i].width + '" data-file-height="' + img_arr[i].height + '" class="copy_img" id="I' + img_arr[i].ID + '">\
					<div class="in_wr"><div class="lib_menu">';

					if(self.actions.indexOf('crop') !== -1){
						lib_str += '<span><a href="#" data-action="crop" data-file-id="' + img_arr[i].ID + '" data-file-src="' + img_arr[i].src + '"><i class="fa fa-fw fa-cut"></i></a></span>';
					}

					if(self.actions.indexOf('remove') !== -1){
						lib_str += '<span><a href="#" data-action="remove" data-file-id="' + img_arr[i].ID + '"><i class="fa fa-fw fa-remove"></i></a></span>';
					}
					
					lib_str += '</div>\
					<img style="max-height:100px;" src="' + img_arr[i].thumb + '" alt="' + img_arr[i].alt + '"/></div>\
					</li>';
				}
				lib_str += '</ul>';
				if(data.pagination){
					lib_str += '<ul class="pagination">' + data.pagination + '</ul>';
				}

				$('#lib_body').append(lib_str);

				$('.copy_img').on('click', self.chooseFileEvent.bind(self));

				self.openLibrary();
			}, 
			error: function(){
				console.log('Error of getting library ' + self.links.library);
			}               
		});

	}

	/*upload*/
	FileLibrary.prototype.uploadFile = function(event, options){
		var self = this;
		
		var form = event.target.parentNode;
		var el = event.target;
		var validation_res = self.validateFile(el);
		if(validation_res.length > 0){
			self.showError(validation_res);
		} else {
			self.__sendForm(form, self.links.upload, options);
		}
	}

	FileLibrary.prototype.validateFile = function(el){
		var errors = [];
		var size = el.files[0].size;
		var type = el.files[0].type;

		if(size > this.settings.maxUploadSize){
			errors.push(this.translation.error_file_size);
		}

		var flag_filetype = false;
		for(var i in this.filetypes){
			if(this.filetypes[i] == 'image/*'){
				if(type.indexOf('image') !== -1){
					flag_filetype = true;
					break;
				}
			}

			if(type.indexOf(this.filetypes[i]) !== -1){
				flag_filetype = true;
				break;
			}
		}

		if(!flag_filetype){
			errors.push(this.translation.error_file_type);
		}

		return errors;
		
	}

	FileLibrary.prototype.__sendForm = function(form, action, options){
		var self = this;
		if(self.status.library == 'opened'){
			self.hideLibrary();
		} else {
			self.closeLibrary();
		}
		
		document.getElementById("loading").style.display="block";
		document.getElementById("progressBar").style.display = "block";

		var formdata = new FormData(form);
		var ajax = new XMLHttpRequest();
		ajax.upload.addEventListener("progress", function(event){self.__progressHandler(event, self)}, false);
		ajax.addEventListener("load", function(event){self.__completeHandler(event, self, options)}, false);
		ajax.addEventListener("error", self.__errorHandler, false);
		ajax.addEventListener("abort", self.__abortHandler, false);
		ajax.open("POST", action, true);
		ajax.send(formdata);
	}

	FileLibrary.prototype.__progressHandler = function(event, self){
		//_("loaded_n_total").innerHTML = "Uploaded "+event.loaded+" bytes of "+event.total;
		var percent = (event.loaded / event.total) * 100;
		if(document.getElementById("progressBar")){
			document.getElementById("progressBar").value = Math.round(percent);
			document.getElementById("status").innerHTML = Math.round(percent) + '%';
		}

	}

	FileLibrary.prototype.__completeHandler = function(event, self, options){
		var response = JSON.parse(event.target.responseText);
		if(response.type == undefined){
			document.getElementById("status").innerHTML = self.translation.error_of_uploading;
			document.getElementById("OK").style.display = "inline-block";
		} else if(response.type == "Error"){
			document.getElementById("status").innerHTML = response.text;
			document.getElementById("OK").style.display = "inline-block";
		} else {
			document.getElementById("progressBar").value = 0;
			document.getElementById("progressBar").style.display = "none";

			self.activeFile.upload = {
				'id' : response.id,
				'src' : response.src
			}

			$( document ).trigger( "fileUploaded", [ self.activeFile.upload ] );

			if(self.actions.indexOf('crop') !== -1 && response.file_type.indexOf('image') !== -1){
				self.activeFile.crop = self.activeFile.upload;
				self.cropImage(options);
			} else {
				document.getElementById("status").innerHTML = '';
				document.getElementById("OK").style.display = 'none';
				$('#loading').hide();
			}

			self.activeFile.upload = null;
		}
	}

	FileLibrary.prototype.__errorHandler = function(event){
		document.getElementById("status").innerHTML = self.translation.upload_failed;
	}

	FileLibrary.prototype.__abortHandler = function(event){
		document.getElementById("status").innerHTML = self.translation.upload_aborted;
	}

	/*crop*/
	FileLibrary.prototype.refuseCrop = function(){
		$('img#imgAreaSelect').imgAreaSelect({remove:true});
		$('#crop_body').empty();
		/*remove uploaded file*/
	}

	FileLibrary.prototype.cropImage = function(options){
		var self = this;

		$('#loading').hide();
		$('#CropModal').flmodal('show');

		if(options != undefined && options.aspectRatio){
			$("#imgAreaSelect").cropper("setAspectRatio", options.aspectRatio);
		} else if (self.dataFileOptions.aspectRatio){
			$("#imgAreaSelect").cropper("setAspectRatio", self.dataFileOptions.aspectRatio);
		}

		$("#imgAreaSelect").cropper("replace", self.activeFile.crop.src);
		$('img#imgAreaSelect').attr('data-file-id', self.activeFile.crop.id);
	}

	FileLibrary.prototype.saveCroppedImageToFile = function(){
		var self = this;
		$image = $("#imgAreaSelect");
		var result = $image.cropper('getCroppedCanvas');

		var dataURL = result.toDataURL('image/jpeg');

    	var formData = new FormData();

		formData.append("dataURL", JSON.stringify(dataURL));
		formData.append("id", $('img#imgAreaSelect').attr('data-file-id'));

        var ajax = new XMLHttpRequest();
		
		ajax.upload.addEventListener("progress", function(event){self.__progressHandler(event, self)}, false);
		ajax.addEventListener("load", function(event){self.__completeCropHandler(event, self)}, false);
		ajax.addEventListener("error", self.__errorHandler, false);
		ajax.addEventListener("abort", self.__abortHandler, false);
		ajax.open("POST", self.links.crop, true);
		ajax.send(formData);
	};


	FileLibrary.prototype.__completeCropHandler = function(event, self){
		debugger;
		var response = JSON.parse(event.target.responseText);

		if(response.type == 'Success'){
			if(document.getElementById("progressBar")){
				document.getElementById("progressBar").value = 0;
				document.getElementById("progressBar").style.display = "none";
			}

			$('#CropModal').flmodal('hide');
			self.dataFileOptions.aspectRatio = null;

			self.activeFile.crop = response;
			$( document ).trigger( "fileCropped", [self.activeFile.crop]);

			if(self.actions.indexOf('library') !== -1){
				self.activeFile.current = self.activeFile.crop;
				if(self.status.library == "opened"){
					self.library();
				}
			}

			self.activeFile.crop = null;
		} else if(response.type === undefined){
			document.getElementById("status").innerHTML = self.translation.error_of_cropping;
			document.getElementById("OK").style.display = "inline-block";
		} else {
			document.getElementById("status").innerHTML = response.text;
			document.getElementById("OK").style.display = "inline-block";
		}
	}

	FileLibrary.prototype.removeFile = function(){
		var self = this;
		var res = confirm('Are you sure?');
		if(!res){
			return false;
		}

		$.ajax({
			url: self.links.remove,
			dataType : "json",
			type: "POST",
			data: {id: self.activeFile.remove.id},
			success: function(data){
				if(data.type == 'Success'){
					$( document ).trigger( "fileRemoved", [ self.activeFile.remove ] );
					if(self.actions.indexOf('library') !== -1){
						self.removeImgFromLib(self.activeFile.remove.id);
					}
				} else {
					alert('Error of removing');
				}
				
				self.activeFile.remove = null;
			},
			error: function(){
				console.log('Error of removing');
			}
		});
	}

	window.FileLibrary = FileLibrary;

})(window, jQuery);
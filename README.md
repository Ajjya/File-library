# File-library (Test version)
> A simple javascript library for uploading, cropping, deleting files.
## Table of contents
* [Use](#use)
* [Requirements](#requirements)
* [Features](#features)
* [Main](#main)
* [Getting started](#getting-started)
* [Methods](#methods)
* [Events](#events)
* [Visual example](#visual_example)
* [Browser support](#browser-support)
* [Support](#support)
* [License](#license)
## Use
* [jQuery v1.9.1+](https://jquery.com/)
* [Font awesome](http://fontawesome.io/)
* [Cropper](https://github.com/fengyuanchen/cropper/)
* [Bootstrap](http://getbootstrap.com/)
## Requirements
* [jQuery v1.9.1+](https://jquery.com/)
* [Font awesome](http://fontawesome.io/)
* [Cropper](https://github.com/fengyuanchen/cropper/)
## Main
```
dist/
├── file-library.css     ( 9 KB)
├── file-library.min.css ( 7 KB)
├── file-library.js      (47 KB)
└── file-library.min.js  (31 KB)
```
## Getting started
### Quick start
Four quick start options are available:
* [Download the latest release](https://github.com/Ajjya/File-library/archive/master.zip)
* Clone the repository: git clone [Download the latest release](https://github.com/Ajjya/File-library.git)
### Installation
Include files:
```html
<link rel="stylesheet" href="/font-awesome/css/font-awesome.min.css"><!--Font-awesome is required-->
<link rel="stylesheet" href="/path/to/cropper.min.css"><!-- Cropper is required -->
<link rel="stylesheet" href="/path/to/file-library.min.css">
<script src="/path/to/jquery.js"></script><!-- jQuery is required -->
<script src="/path/to/cropper.min.js"></script><!-- Cropper is required -->
<script src="/path/to/file-library.min.js"></script>
```
### Usage
#### Activation File Library
```js
var FL = new FileLibrary(library_settings, actions, types_of_files, links, data_file_options);
```
_Where:_

_library_settings - object with library settings (maxUploadSize, ln allowed)_

_actions - array with allowed actions ('upload', 'crop', 'remove', 'library')_

_types_of_files - array with allowed mimes_

_links - object with backend links (library, upload, crop, remove, language)_

_data_file_options - object with file options (aspectRatio and any other parametr)_

```js
var FL = new FileLibrary(
	{
		maxUploadSize: 1000000,
		ln: 'EN'
	},
	['upload', 'crop', 'remove', 'library'], 
	['image/*'],
	{
		library: '/api/library.json',
		upload: '/api/upload.json',
		crop: '/api/crop.json',
		remove: '/api/remove.json',
		language: '/js/media-library/ln/'
	},
	{
		aspectRatio: "4:3",
		groupID: 5
	}
);
```
#### Library settings - object
* **maxUploadSize** - maximum upload size
* **ln** - language of file library

_You can translate ln/EN.json, create needed language and add it to ln folder._

#### Actions - array
You can choose needed actions from 'upload', 'crop', 'remove', 'library'.

#### Mime type of files - array
For example, 'image/*' or 'audio/x-aac'

#### Links - object of backend links:
---
**_Library (key='library')_**

_Url, gets data from database and return json to show on the File library_

##### Params: -
##### Returns:
###### Success:
```js 

{
	"img_arr": [
		{
			"ID":1,
			"src": "http://test.local/images/Chrysanthemum.jpg",
			"thumb": "http://test.local/images/Chrysanthemum-150x200.jpg",
			"alt": "Chrysanthemum",
			"width": 500,
			"height": 375
		},
		{
			"ID":2,
			"src": "http://test.local/images/Remax Bay Street logo.jpg",
			"thumb": "http://test.local/images/Remax Bay Street logo-150x200.jpg",
			"alt": "Remax Bay Street",
			"width": 500,
			"height": 221
		}
	],
	"pagination": pagination html
}
```
###### Error:
```js 
[]
```
---
**_Upload (key='upload')_**

_Url for uploading files_
##### Params: -
##### Returns:
###### Success:
```js
{
	"type": "Success",
	"text": "Files was uploaded successfull.",
	"src": "http://test.local/images/Chrysanthemum.jpg",
	"id": 1,
	"file_type": "image"
}
```
###### Error:
```js
{
	"type": "Error",
	"text": "Error of uploading"
}
```
---
**_Crop (key='crop')_**

_Url for cropping images. Backend function saves file to folder, removes old file and replaces changes in the database. Notice, names of old file and new file have to be different._
##### Params:
POST:

dataURL - base64 images

id - id image from Database
##### Returns:
###### Success:
```js
{
	"type":"Success",
	"text": "Files was cropped successfull.",
	"id": 1,
	"src": "http://test.local/images/Chrysanthemum.jpg",
	"thumb": "http://test.local/images/Chrysanthemum-150x200.jpg",
	"width": 500,
	"height": 375
}
```
###### Error:
```js
{
	"type": "Error",
	"text": "Error of cropping"
}
```
---
**_Remove (key='remove')_**

_Url for removing files._
##### Params:
POST:

id - id file from Database
##### Returns:
###### Success:
```js
{
	"type":"Success",
	"text": "Files was removed successfull."
}
```
###### Error:
```js
{
	"type": "Error",
	"text": "Error of removing"
}
```
---
**_Language (key='language')_**

_Url for translations folder._
##### Params: -
##### Returns: -
---
#### Data file options - object:
* aspectRatio: (string) You can use this parametr if you want to crop files only on specific aspectRatio. You can change this parametr in any time
* groupID: (any) You can use this parament to pass groupID to your app when any event is occured
You can use any parametrs here, they will be passed to your app when any event is occured
#### Activation File Library
Using jQuery create arrays of action buttons:
##### Library buttons:
```js
var library_buttons = [];
$('.library').each(function(i, item){
	library_buttons.push({
		'el': $(this)
	});
});
```
_Where:_

_el - jQuery DOM element (required)_
##### Upload buttons:
```js
var upload_buttons = [];
$('.upload').each(function(i, item){
	upload_buttons.push({
		'el': $(this),
		'aspectRatio': 21 / 9
	});
});
```
_Where:_

_el - jQuery DOM element (required)_

_aspectRatio - aspect Ratio (optional)_
##### Crop buttons:
```js
var crop_buttons = [];
$('.crop').each(function(i, item){
	crop_buttons.push({
		'el': $(this),
	});
});
```
_Where:_

_el - jQuery DOM element (required)_

##### Remove buttons:
```js
var remove_buttons = [];
$('.remove').each(function(i, item){
	remove_buttons.push({
		'el': $(this),
	});
});
```
_Where:_

_el - jQuery DOM element (required)_
### Activate buttons:
```js
FL.init(
	{
		library_buttons: library_buttons,
		upload_buttons: upload_buttons,
		crop_buttons: crop_buttons,
		remove_buttons: remove_buttons
	}
);
```
## Methods
### dataFileOptionInit(options)
In order to change options use [dataFileOptions](#dataFileOptions).
@params: options - object
```js
var options = {
	aspectRatio: 4/3,
	/*any other parametr*/
}
FL.dataFileOptionInit(options);
```
To set aspectRatio for cropping images use this function.
Other parametrs uses to pass them to your app when any [event](#events) is occured.
## Events
### libraryActiveFileChanged
This event fires when file in library is choosen
```js
$( document ).on( "libraryActiveImageChanged", function(event, activeImage, dataFileOptions){
	console.log(activeImage);
	console.log(dataFileOptions);
});
```
### fileUploaded
This event fires when file is uploaded
```js
$( document ).on( "fileUploaded", function(event, uploadedFile, dataFileOptions){
	console.log(uploadedFile);
	console.log(dataFileOptions);
});
```
### fileCropped
This event fires when file is uploaded
```js
$( document ).on( "fileCropped", function(event, croppedImage, dataFileOptions){
	console.log(croppedImage);
	console.log(dataFileOptions);
})
```
### fileRemoved
This event fires when file is removed
```js
$( document ).on( "fileRemoved", function(event, removedfile, dataFileOptions){
	console.log(removedfile);
	console.log(dataFileOptions);
});
```
## Visual example
1. Create your library page
```html
<div class="dir_wrap">
	<a href="#" class="upload">Upload image</a>
	<a href="#" class="library">Library</a>
</div>
<div class="img_wrap">
	<img src="http://fl.local:8081/images/Chrysanthemum.jpg" alt />
	<div class="capture">
		<a href="#" class="crop" data-file-id="1" data-file-src="http://fl.local:8081/images/Chrysanthemum.jpg">Crop</a>
		<a href="#" class="remove" data-file-id="1">Remove</a>
	</div>
</div>
```
![html](https://github.com/Ajjya/File-library/images/123.png)
## Browser support
* Chrome (latest)
* Firefox (latest)
* Safari (latest)
* Opera (latest)
* Edge (latest)
* Internet Explorer 9+
## Support
If you found a bug or have a feature suggestion, please submit it in the [Issues tracker](https://github.com/Ajjya/File-library/issues).
## License
The plugin is available under the [MIT licens](http://opensource.org/licenses/MIT).

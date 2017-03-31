# File-library
> A simple javascript library for uploading, cropping, deleting files.
## Table of contents
* [Use](#use)
* [Requirements](#requirements)
* [Features](#features)
* [Main](#main)
* [Getting started](#getting-started)
* [Methods](#methods)
* [Events](#events)
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

#### Mime type of files
For example, 'image/*' or 'audio/x-aac'

#### Links - object of backend links:
* library 

_Url, gets data from database and return json to show on the File library_

##### Params: -

##### Returns:

###### Success:
```html 
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

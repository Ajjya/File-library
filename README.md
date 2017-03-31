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
#### Activation File Library:
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

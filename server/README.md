# How to use Fargo

	sam.phillips@thirdlight.com
	20/3/2019

## What is Fargo?

**Fargo** is an HTTP file server that specialises in serving images. It is intended to simulate many of the functions of the backend of a Digital Asset Management system (DAM). It is written in 100% Go so should be easy to install as it has no dependencies other than readily available Go packages.

Fargo **can**:

 * Auto-crop images to provide thumbnails
 * Read and serve Exif data (like Location)
 * Auto-tag images (with a Clarifai API key)
 * Store arbitrary metadata on each file
 * Search for text in data and metadata

It is also a static webserver so it is ideal for building a web front-end on top of.

Fargo currently **cannot**:

 * Move files or folders
 * Rename files or folders
 * Delete files or folders
 * Create new folders
 * Upload new files via http

Though these would be interesting features to add at some point.

## What is Fargo for?

Fargo is intended as a training and hiring tool to be part playground, part sandbox environment for front-end developer candidates to write code for. It should, hopefully, provide just-enough DAM features to be an interesting challenge.

## Warning

Fargo isn't polished/commercial software so it will no doubt be fairly easy to crash it given some odd inputs. I'd be keen to hear of any bugs you encounter (especially crashes), especially if you used normal inputs :) . Apologies in advance.
	

## Installation

To install the fargo server I'd recommend using a pre-built binary. If you need to build it, it is a Go module so can be built simply by going into the directory and typing:

	go build

## Starting the server

Usually you would create a config file and point the server at the directory containing it.

	./fargo --config=app/dir

The file will look for a file called `fargo.json` which should be a json format file of config settings (but can also contain whole-line comments beginning with `//`).

The server option `-h` should give you some idea of the options. The sample config file should cover the others.

## Serving some files

***WARNING: don't use a folder full of images you care about as fargo will mess it up!***

Create a folder that you are happy to get messy and add some files to it. You can use any files (and arrange them in folders) but image files work best as they are most likely to have exif metadata.

Point the server at the directory using the command-line of the config file.

	./fargo -v files

The `-v` turns on verbose logging which should help you sanity check your setup.

Mine says:

	[fargo] INFO: fargo (1.0.b1)
	[fargo] INFO: port 3000
	[fargo] INFO: verbose logging on
	[fargo] INFO: config /Users/sam/Desktop/fargo
	[fargo] INFO: dir /Users/sam/Desktop/fargo/files
	[fargo] INFO: www /Users/sam/Desktop/fargo
	[fargo] INFO: thumbSize 150x150
	[fargo] INFO: previewSize 640x640
	[fargo] — — —
	[fargo] INFO: Autotag off

this line:

	dir /Users/sam/Desktop/fargo/files

Tells us that it will be serving files from the fargo/files directory.
This is also where fargo will store its cache files (metadata, autotagging data, thumbnails, crops etc).

It's running on:

	port 3000

So you should now be able to see it work by going to 

	http://localhost:3000/dir/

When I do I get this piece of JSON:

	{
		"status": "OK",
		"data": {
			"dirs": [
				"docs",
				"pics"
			],
			"files": null
		}
	}

as my files directory only contains two more dirs: `docs` & `pics`. Yours might be a much longer document.

Note that the JSON status is `'OK'` and the data is contained in 'data'. Status can also be `'ERROR'`.

e.g.

	http://localhost:3000/dir/foobar/

gives:

	{
		"status": "ERROR",
		"error": "Invalid Path"
	}

I can just follow these dirs to get their contents, e.g.:

	http://localhost:3000/dir/pics/

will list any folders and give full details of any files in the pics directory:

	{
		"status": "OK",
		"data": {
			"dirs": null,
			"files": [
				{
					"name": "10H.jpg",
					"size": 7528783,
					"modTime": "2013-11-18T11:04:43Z",
					"kind": "image",
					"filetype": "jpeg",
					"imageInfo": {
						"width": 2848,
						"height": 4272,
						"created": "2008-06-07T08:16:33+01:00",
						"location": null,
						"autotags": null
					},
					"exif": null,
					"metadata": null,
					"path": "pics/10H.jpg",
					"links": {
						"dir": "/dir/pics",
						"thumb": "/image/thumb/pics/10H.jpg",
						"preview": "/image/preview/pics/10H.jpg",
						"original": "/file/pics/10H.jpg",
						"metadata": "/metadata/pics/10H.jpg"
					}
				},
				:

Generally, if a piece of data can't be found (but could be there) you will get a null rather than it being left off the list (though images will generally get more fields than non-image files) 

This part shows the other links you can follow to see this file (in this case, an image so it has a thumb and a preview):

	"links": {
		"dir": "/dir/pics",
		"thumb": "/image/thumb/pics/10H.jpg",
		"preview": "/image/preview/pics/10H.jpg",
		"original": "/file/pics/10H.jpg",
		"metadata": "/metadata/pics/10H.jpg"
	}

If you follow the thumb and the preview you will get a smart-cropped image to whatever size is set in the config (by default `150x150` for thumbs, `640x640` for previews).

This file doesn't have any location data, exif data, metadata or autotags yet.

## Crops & Caches

If you follow the thumb and preview link you should get cropped (jpeg) images returned. The images are created on-the-fly and then cached in files next to the original file.

They look like this:

	10H.jpg.preview.640x640~.jpg
	10H.jpg.thumb.150x150~.jpg

The names are ugly but they're pretty easy to search for and delete (and to filter out from the directory results). If you delete a file it will be recreated next time it's needed.
There are currently only two sizes (apart from the originals): "thumb" and "preview".

## Routes

Fargo serves the following routes:

	/dir/{path}
	/file/{path}
	/image/{thumb|preview}/{path}
	/metadata/{path}
	/search/?q={query}

## Dir

The Dir route will list all the files in a path if it is a valid directory and provide whatever data & metadata it can about them.

### Kind & Filetype

The file will be analysed to find its real filetype (not just the file-ending). e.g. try renaming a jpeg:-

			{
				"name": "1H.foo",
				"size": 4514903,
				"modTime": "2013-11-18T11:05:10Z",
				"kind": "image",
				"filetype": "jpeg",
				:

The files will be of the following kinds:

	image
	video
	audio
	application

`filetype` will not always be the same as the file extension as the actual file data is read to determine them. They will be things like 

	jpeg
	msword
	mpeg

rather than 

	jpg
	docx
	mp3

so they can't be used in filenames.

You should be able to use `kind` / `filetype` to produce a MIME header type if you need one. e.g. 

	jpg - image/jpeg
	png - image/png
	gif - image/gif
	mpg - video/mpeg
	mp3 - audio/mpeg
	pdf - application/pdf
	zip - application/zip
	doc - application/msword

etc.

A full list can be found here: [github.com/h2non/filetype](https://github.com/h2non/filetype)


### ImageInfo

As fargo mostly concentrates on displaying Images it provides extra information about them if it can find it. Images get width, height and location date if available (and autotagging if turned on). Location data and location data are pulled from exif data whether or not the full exif details are on. However not all images will have any exif data as lots of software will strip exif data. To test location data try using an image downloaded from a smartphone.

	{
		"status": "OK",
		"data": [
			{
				"name": "IMG_2985.jpeg",
				:
				"kind": "image",
				"filetype": "jpeg",
				"imageInfo": {
					"width": 3024,
					"height": 4032,
					"created": "2019-01-31T09:21:57Z",
					"location": {
						"lat": 52.10776388888889,
						"long": 0.35654166666666665
					},
					"autotags": {
						"color": "#5A86BA",
						"tags": [
							"winter",
							"house",
							"no person",
							"architecture",
							:

Lat and long can be used with, say, Google Maps or similar to provide a map. 	

## Image

The image route provides thumbnails in two sizes 'thumb' and 'preview'. The dimensions for these can be set in the config.

	// thumb image sizes width x height
	"thumb": "150x150",

	// thumb image sizes width x height
	"preview" : "640x640",

If the image dimensions are a different aspect ratio to the specified crop the server will  *smart-crop* and try to find the best place to crop the image. It should try to cut out the less visually interesting areas and focus on the more busy parts. It doesn't do face detection.

The first time a thumb is generated will be quite slow due to the analysis and resizing but the files are cached and stored so subsequent views are instant.

The cache files are stored beside the originals, e.g.:

	10H.jpg.preview.640x640~.jpg
	10H.jpg.thumb.150x150~.jpg

## File

The file route will, simply, return the original file. So, something like:

	/file/docs/Nissan_LEAF-2018_UK.pdf

will return the file (in the docs dir). i.e. in my case:

	/docs/Nissan_LEAF-2018_UK.pdf

It doesn't process it in any way, it's just a straight download.

## Search

Fargo has basic search functionality. By default it will search filenames, tags, and metadata fields specified in the config.

	/search/?q=pdf

Should give you all the jpgs. Search is case-insensitive.

Search returns a list identical in form to a call to `/dir`.


## ShowExif
To serve full exif data where available use the 'exif' option (or --exif)

The server will look for exif data on `.jpeg`,`.tif`, `.wav` files.

The most useful exif data is pulled-out by default, namely the creation date and any GPS location data. However there's all sorts of other interesting data in there e.g. camera model and photographic detail about exposure etc. You sometimes get information about software used to edit the file.

e.g.

	http://0.0.0.0:3000/search/?q=PARK

returns:

	{
		"status": "OK",
		"data": [
			{
				"name": "4H.jpg",
				"size": 4625665,
				"modTime": "2013-11-18T11:05:01Z",
				"kind": "image",
				"filetype": "jpeg",
				"imageInfo": {
					"width": 4272,
					"height": 2848,
					"created": "2009-07-05T09:02:37+01:00",
					"location": null,
					"autotags": {
						"color": "#416300",
						"tags": [
							"pool",
							"lotus",
							"leaf",
							"flora",
							"lily",
							:

## Autotagging

You will need to get an API key from Clarifai if you want to try auto-tagging as it is done via their free API. I's a straight-forward process to sign-up but each key is limited to 5000 free calls so it's best if we don't share keys. Adding the key to the config file and  setting tag to true should be enough to get it working. Note that it will by-default make `512x512` crops and send the crops to Clarifai so it can use a load of bandwidth and could be slow on home ADSL.

	// autotag settings
	"autotag": {
		// turn it on
		"tag": true,
		// clarifai API key
		"key": "your key in here"
	}

Autotagging will generate more cache files, one for the image crop and one to store the data.

	/Users/sam/Desktop/files/pics/9H.jpg.autotag.512x512~.jpg
	9H.jpg.data~.json

Once you have generated the data it will appear in the main directory listing in the autotagging.tags field. It also generates a dominant color field for the image should you want to use it in some way.
As this is just a json file you can have a look at the data. 

	{
		"color": "#BC1D0C",
		"tags": [
			"abstract",
			"design",
			"bright",
			"wallpaper",
			"decoration",
			"insubstantial",
			"pattern",
			"Christmas",
			:
			"celebration"
		]
	}

As autotagging data only applies to images the autotagging data will be added to imageInfo field

	{
		"status": "OK",
		"data": [
			{
				"name": "8H.jpg",
				:
				"kind": "image",
				"filetype": "jpeg",
				"imageInfo": {
					"width": 2448,
					"height": 3264,
					:
					"autotags": {
						"color": "#E9A812",
						"tags": [
							"fall",
							"leaf",
							"wood",
							"nature",
							"tree",
							:
						]
					}
				},

Autotagging runs once each time the server starts up  and does a single pass over all the files. It doesn't currenty watch the folder for changes so if you add files and would like them auto-tagged you need to restart the server.

## Metadata

There's a simple mechanism for adding metadata to an image: fargo will accept a POST and store any valid JSON object sent in the body. If you would like the metadata to be searched you need to add the field names to the config file. Only text fields and arrays of text can be searched. By default it looks for `"title", "description", "keywords"` but these can be changed. In testing I used text fields for `"title"` and `"description"`, and an array of strings for `"keywords"` and this worked fine.

To accept a metadata edit you need to set `edit` on in the config:

	// metadata editing on/
	"edit":    true,

You can test metadata in two ways: by adding a file manually or by using CURL (or similar) to send a POST request.

So if you add a metadata cache file like this

	{
		"keywords": ["test", "fargo"]
	}

and save it to something like this:

	8H.jpg.metadata~.json

(note the similarity to the autotag data filenames)

you should be able to search for the data (you don't need to restart the server as it doesn't do any caching)

	http://0.0.0.0:3000/search/?q=test%20fargo

you should now get a metadata field in your results

	{
		"status": "OK",
		"data": [
			{
				"name": "8H.jpg",
				:
				"metadata": {
					"keywords": [
						"test",
						"fargo"
					]
				},

## Cache files & Data files

Given an original image file like this 

	original     - 10H.jpg

fargo can generate  bunch of cache files.

**data caches:**

	autotag data - 10H.jpg.data~.json

**thumbnails:**

	preview:      10H.jpg.preview.640x640~.jpg
	thumb:        10H.jpg.thumb.150x150~.jpg
	autotag:      10H.jpg.autotag.512x512~.jpg

It's safe to delete all these files as they can be regenerated automatically.

**data store:**

The metadata files are data stores rather than a caches. If you delete these files any data they store will be deleted.


	metadata:     10H.jpg.metadata~.json


## Creating a web app

Fargo will treat anything that isn't an API request (so anything other than requests for

	/dir/
	/file/
	/image/
	/metadata/
	/search/
	
directories) as static web content.

The location for these files is set in the config using `www` or `--www`.

The http server treats 'index.html' as special and will look for it in any directory request.

If you build your web app in this directory and view it through fargo you shouldn't need to worry about CORs.

As you can set the location of the config file separately to the www directory you should be able to keep your `fargo.config` in the app directory and point it to the build directory if you use javascript build tools.


## KNOWN BUGS

Fargo is essentially a few Go libraries knocked together into a server so it lacks a lot of polish and can easily be tripped up by invalid file data. It's also rather slow.

### Rotation

Fargo currently incorrectly displays images that use an Exif flag to rotate them (rather than rotating the actual data). You will encounter this if you use images from devices that use an accelerometer to determine rotation (e.g. iPhones etc). This should be fixed in the next version.

### Incorrect or missing Exif data causing crashes

Some files have Exif data that causes Fargo to complain and spit errors into the log. We're hoping to fix it in the next version.

### Performance

**Fargo** is slow. this is mostly due to it using libraries that have no dependencies on C or C++ libraries (it's 100% Go). This is unlikely to change as it's much better to supply a static binary. The way each library is used could be improved however as we load in and generate multiple image objects rather than a single image object that gets passed around. This should improve performance a great deal (and would make the code a lot less hacky).

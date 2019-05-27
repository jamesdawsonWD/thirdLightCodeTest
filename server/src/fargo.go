// fargo.go

package main

import (
	"fmt"
	// "html"
	"encoding/json"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/jpeg"
	_ "image/png"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/cenkalti/dominantcolor"
	"github.com/corona10/goimagehash"
	"github.com/docopt/docopt-go"
	"github.com/gorilla/mux"
	"github.com/h2non/filetype"
	clarifai "github.com/mpmlj/clarifai-client-go"
	"github.com/muesli/smartcrop"
	"github.com/nfnt/resize"
	"github.com/rwcarlsen/goexif/exif"
	"github.com/rwcarlsen/goexif/mknote"
	"github.com/urfave/negroni"
)

// - - - App details - - -

const name = "fargo"
const version = "1.0.b1"

// - - - Images  & ImageInfo - - -

type ImageInfo struct {
	Width    int                    `json:"width"`
	Height   int                    `json:"height"`
	Created  *time.Time             `json:"created"`
	Location *Location              `json:"location"`
	Autotags map[string]interface{} `json:"autotags"`
}

type Location struct {
	Lat  float64 `json:"lat"`
	Long float64 `json:"long"`
}

type ImageSize struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// convert "n" or "wxh" to ImageSize struct
func aToImageSize(size string) (ImageSize, error) {
	// does s contain an 'x'
	const c = "x"
	if strings.Contains(size, c) {
		// split into two numbers
		s := strings.Split(size, c)
		w, err := strconv.Atoi(s[0])
		if err != nil {
			return ImageSize{}, err
		}
		h, err := strconv.Atoi(s[1])
		if err != nil {
			return ImageSize{}, err
		}
		return ImageSize{
			Width:  w,
			Height: h,
		}, nil
	} else {
		// assume a square then
		w, err := strconv.Atoi(size)
		if err != nil {
			return ImageSize{}, err
		}
		return ImageSize{
			Width:  w,
			Height: w,
		}, nil
	}

}
func (size ImageSize) String() string {
	return fmt.Sprintf("%vx%v", size.Width, size.Height)
}

func smartCrop(fromFile string, size ImageSize) image.Image {
	f, _ := os.Open(fromFile)
	defer f.Close()

	img, _, _ := image.Decode(f)

	analyzer := smartcrop.NewAnalyzer()
	topCrop, _ := analyzer.FindBestCrop(img, size.Width, size.Height)

	type SubImager interface {
		SubImage(r image.Rectangle) image.Image
	}
	croppedimg := img.(SubImager).SubImage(topCrop)

	return croppedimg
}

func getImageDimension(f *os.File) (int, int, error) {
	img, _, err := image.DecodeConfig(f)
	if err != nil {
		return 0, 0, err
	}

	return img.Width, img.Height, nil
}

func FindDomiantColor(img image.Image) string {
	// this turned out to be super-slow and is better suited to a post-import job
	return dominantcolor.Hex(dominantcolor.Find(img))
}

func PerceptiveHash(img image.Image) (string, error) {
	// this turned out to be super-slow and is better suited to a post-import job
	hash, err := goimagehash.PerceptionHash(img)
	if err != nil {
		return "", err
	}
	return hash.ToString(), nil
}

// - - - Dirs & Files - - -

type DirEntry struct {
	Dirs    []string    `json:"dirs"`
	Files   []FileEntry `json:"files"`
	dirPath string
}

type Links struct {
	Dir      string `json:"dir"`
	Thumb    string `json:"thumb,omitempty"`
	Preview  string `json:"preview,omitempty"`
	Original string `json:"original"`
	Metadata string `json:"metadata"`
}

type FileEntry struct {
	Name      string                 `json:"name"`
	Size      int64                  `json:"size"`
	ModTime   time.Time              `json:"modTime"`
	Kind      string                 `json:"kind"`
	Filetype  string                 `json:"filetype"`
	ImageInfo *ImageInfo             `json:"imageInfo"`
	Exif      *exif.Exif             `json:"exif"`
	Metadata  map[string]interface{} `json:"metadata"`
	RelPath   string                 `json:"path"`
	Links     Links                  `json:"links"`
	filepath  string                 // absolute filepath
	server    *Server
}

func (f *FileEntry) isImage() bool {
	return f.Kind == "image"
}

func (f *FileEntry) decodeExif(full bool) {

	// TODO: pass all these WARNs back to caller

	file, err := os.Open(f.filepath)
	defer file.Close()
	if err != nil {
		fmt.Fprintf(os.Stderr, "WARN: %s: %v\n", f.filepath, err)
		return
	}

	// Optionally register camera makenote data parsing - currently Nikon and
	// Canon are supported.
	exif.RegisterParsers(mknote.All...)

	x, err := exif.Decode(file)
	if err != nil {
		fmt.Fprintf(os.Stderr, "WARN: %s: %v\n", f.filepath, err)
		return
	}

	tm, err := x.DateTime()
	if err == nil {
		f.ImageInfo.Created = &tm
	} else {
		fmt.Fprintf(os.Stderr, "WARN: %s: %v\n", f.filepath, err)
	}

	lat, long, err := x.LatLong()
	if err == nil {
		f.ImageInfo.Location = &Location{
			Lat:  lat,
			Long: long,
		}
	} else {
		fmt.Fprintf(os.Stderr, "WARN: %s: %v\n", f.filepath, err)
	}
	if full {
		f.Exif = x
	}
}

func (f *FileEntry) identifyImage(findDomiantColor, findPerceptiveHash bool) {
	// TODO: pass all these WARNs back to caller

	file, err := os.Open(f.filepath)
	defer file.Close()
	if err != nil {
		fmt.Fprintf(os.Stderr, "WARN: Open: %s: %v\n", f.filepath, err)
		return
	}

	w, h, err := getImageDimension(file)
	if err != nil {
		fmt.Fprintf(os.Stderr, "WARN: getImageDimension: %s: %v\n", f.filepath, err)
		return
	}
	f.ImageInfo = &ImageInfo{
		Width:  w,
		Height: h,
	}
	data, _ := f.server.getDataForPath(f.RelPath)
	if data != nil {
		f.ImageInfo.Autotags = data
	} else {
		if findDomiantColor || findPerceptiveHash {
			file.Seek(0, 0)
			img, _, err := image.Decode(file)
			if err != nil {
				fmt.Fprintf(os.Stderr, "WARN: image.Decode: %s: %v\n", f.filepath, err)
				return
			}
			f.ImageInfo.Autotags = make(map[string]interface{})
			if findDomiantColor {
				c := FindDomiantColor(img)
				f.ImageInfo.Autotags["color"] = c
			}
			if findPerceptiveHash {
				h, err := PerceptiveHash(img)
				if err != nil {
					f.ImageInfo.Autotags["hash"] = h
				}
			}
		}
	}

}

func (f *FileEntry) identifyFile(withAllExifData, findDomiantColor, findPerceptiveHash bool) {
	// Open a file descriptor
	file, _ := os.Open(f.filepath)

	// We only have to pass the file header = first 261 bytes
	head := make([]byte, 261)
	file.Read(head)
	file.Close()

	ft, _ := filetype.Match(head)
	if ft != filetype.Unknown {
		f.Kind = ft.MIME.Type
		f.Filetype = ft.MIME.Subtype
		if f.isImage() {
			f.identifyImage(findDomiantColor, findPerceptiveHash)
		}
		// jpeg, tif, wav can have exif
		if f.Filetype == "jpeg" || f.Filetype == "tif" || f.Filetype == "wav" {
			f.decodeExif(withAllExifData)
		}
	}
}

// - - - Server - - -

type Server struct {
	name        string
	version     string
	port        string
	dirPath     string
	wwwPath     string
	configPath  string
	thumbSize   ImageSize
	previewSize ImageSize
	autotagSize ImageSize
	options     *Options
	logger      *negroni.Logger
	negroni     *negroni.Negroni
}

type AutotagSettings struct {
	Tag       bool    `json:"tag"`
	Size      string  `json:"size"`
	APIkey    string  `json:"key"`
	Threshold float64 `json:"threshold"`
}

type APIResponse struct {
	Status string      `json:"status"`          // "OK" || "ERROR"
	Data   interface{} `json:"data,omitempty"`  // if OK
	Error  string      `json:"error,omitempty"` // if ERROR
}

// hide files with this prefix just before extension
const ignorePrefix = "~"

// log an error as a warning to server logger
func (server *Server) warn(err error) {
	if server.options.Verbose {
		server.logger.Printf("WARN: %s", err)
	}
}

// log info string to server logger
func (server *Server) info(s string) {
	if server.options.Verbose {
		server.logger.Printf("INFO: %s", s)
	}
}

// find n chars just before file extension (or at end of name if no extension)
func lastCharsBeforeExt(filename string, n int) string {
	withoutExt := strings.TrimSuffix(filename, filepath.Ext(filename))
	wlen := len(withoutExt)
	if wlen < n {
		return ""
	}
	return withoutExt[wlen-n:]
}

func (server *Server) readDir(reqPath string, withAllExifData, findDomiantColor, findPerceptiveHash bool) (*DirEntry, error) {
	// options := server.options

	dirPath, err := filepath.Abs(filepath.Join(server.dirPath, reqPath))
	if err != nil {
		server.warn(err)
		return nil, fmt.Errorf("Invalid Path")
	}
	info, err := os.Stat(dirPath)
	if err != nil {
		server.warn(err)
		return nil, fmt.Errorf("Invalid Path")
	}
	if info.IsDir() == false {
		server.warn(err)
		return nil, fmt.Errorf("Invalid Path")
	}
	var dirs []string
	var files []FileEntry

	dirEntries, _ := ioutil.ReadDir(dirPath)

	for _, f := range dirEntries {
		name := f.Name()
		if name[0] == '.' || lastCharsBeforeExt(name, len(ignorePrefix)) == ignorePrefix {
			continue
		}
		if f.IsDir() {
			dirs = append(dirs, name)
		} else {
			fpath := filepath.Join(dirPath, name)
			info, err := os.Stat(fpath)
			if err != nil {
				server.warn(err)
				return nil, fmt.Errorf("Invalid Filepath")
			}
			ft := path.Ext(name)
			// strip . from front of ft
			if len(ft) > 1 && ft[0] == '.' {
				ft = ft[1:]
			}
			relPath := filepath.Join(reqPath, name)
			file := FileEntry{
				Name:     name,
				filepath: fpath,
				RelPath:  relPath,
				server:   server,
				Size:     info.Size(),
				ModTime:  info.ModTime(),
				Filetype: ft,
				Kind:     "Unknown",
				Links: Links{
					Dir:      path.Join("/dir/", reqPath),
					Original: path.Join("/file/", relPath),
					Metadata: path.Join("/metadata/", relPath),
				},
			}
			file.identifyFile(withAllExifData, findDomiantColor, findPerceptiveHash)
			if file.isImage() {
				file.Links.Thumb = path.Join("/image/thumb/", relPath)
				file.Links.Preview = path.Join("/image/preview/", relPath)
			}
			md, _ := server.getMetadataForPath(relPath)
			file.Metadata = md
			files = append(files, file)
		}
	}

	return &DirEntry{
		Dirs:    dirs,
		Files:   files,
		dirPath: dirPath,
	}, nil
}

func (server *Server) splitFilename(filename string) (string, string, string, error) {
	infile, err := filepath.Abs(filepath.Join(server.dirPath, filename))
	dir, filename := path.Split(infile)
	return infile, dir, filename, err
}

func makeCachedImageFilename(dir, filename, class string, size ImageSize) (string, error) {
	cacheFilename := fmt.Sprintf("%s.%s.%s%s.jpg", filename, class, size, ignorePrefix)
	return filepath.Abs(filepath.Join(dir, cacheFilename))
}

func (server *Server) makeCachedDataFilename(filename string) (string, error) {
	_, dir, filename, err := server.splitFilename(filename)
	if err != nil {
		server.warn(err)
	}
	cacheFilename := fmt.Sprintf("%s.data%s.json", filename, ignorePrefix)
	return filepath.Abs(filepath.Join(dir, cacheFilename))
}

func (server *Server) makeCachedMetadataFilename(filename string) (string, error) {
	_, dir, filename, err := server.splitFilename(filename)
	if err != nil {
		server.warn(err)
	}
	cacheFilename := fmt.Sprintf("%s.metadata%s.json", filename, ignorePrefix)
	return filepath.Abs(filepath.Join(dir, cacheFilename))
}

func (server *Server) readAndVerifyJsonData(filename string) (map[string]interface{}, error) {
	data := make(map[string]interface{})
	file, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(file, &data)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (server *Server) getDataForPath(filename string) (map[string]interface{}, error) {
	fileData := map[string]interface{}{}
	filename, err := server.makeCachedDataFilename(filename)
	if err == nil {
		fileData, err = server.readAndVerifyJsonData(filename)
	}
	return fileData, err
}

func (server *Server) getMetadataForPath(filename string) (map[string]interface{}, error) {
	fileData := map[string]interface{}{}
	filename, err := server.makeCachedMetadataFilename(filename)
	if err == nil {
		fileData, err = server.readAndVerifyJsonData(filename)
	}
	return fileData, err
}

func (server *Server) writeDataForPath(filename string, data interface{}) error {
	filename, err := server.makeCachedDataFilename(filename)
	if err == nil {
		err = server.writeDataAsJsonFile(filename, data)
	}
	return err
}

func (server *Server) writeMetadataForPath(filename string, data interface{}) error {
	filename, err := server.makeCachedMetadataFilename(filename)
	if err == nil {
		err = server.writeDataAsJsonFile(filename, data)
	}
	return err
}

func (server *Server) makeCachedImage(class string, reqPath string) (filename string) {

	infile, dir, filename, err := server.splitFilename(reqPath)
	if err != nil {
		server.warn(err)
	}

	size := server.thumbSize
	if class == "preview" {
		size = server.previewSize
	} else if class == "autotag" {
		size = server.autotagSize
	}

	// TODO: Check if really an image here!
	outfile, err := makeCachedImageFilename(dir, filename, class, size)
	server.info("INFO: outfile: " + outfile)

	if !pathExists(outfile) {
		server.info("INFO: creating: " + outfile)
		img := smartCrop(infile, size)

		w, err := os.Create(outfile)
		if err != nil {
			server.warn(err)
		}
		defer w.Close()
		m := resize.Resize(uint(size.Width), uint(size.Height), img, resize.MitchellNetravali) //resize.Lanczos2)

		jpeg.Encode(w, m, &jpeg.Options{Quality: 95})
		if err != nil {
			server.warn(err)
		}
	}

	return outfile
}

func (server *Server) outputDataAsJson(data interface{}, err error) []byte {
	logger := server.logger
	response := APIResponse{}
	if err == nil {
		response.Status = "OK"
		response.Data = data
	} else {
		response.Status = "ERROR"
		response.Error = err.Error()
		server.warn(err)
	}
	json, err := json.MarshalIndent(response, "", "\t")
	if err != nil {
		logger.Println(err)
		os.Exit(1)
	}
	return json
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func (server *Server) writeDataAsJsonFile(filename string, data interface{}) error {
	json, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(filename, json, 0644)
	return err
}

func (server *Server) makeDirHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		enableCors(&w)
		d, err := server.readDir(req.URL.Path, server.options.ShowExif, false, false)
		fmt.Fprintf(w, "%s\n", server.outputDataAsJson(d, err))
	})
}

func (server *Server) makeImageHandler() func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		enableCors(&w)
		vars := mux.Vars(req)
		filename := server.makeCachedImage(vars["size"], vars["path"])
		http.ServeFile(w, req, filename)
	}
}

func (server *Server) makeMetadataHandler() func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		enableCors(&w)
		if (*req).Method == "OPTIONS" {
			return
		}
		data := make(map[string]interface{})
		var err error //= fmt.Errorf("Oops!")

		vars := mux.Vars(req)
		switch req.Method {
		case "OPTIONS":
			return
		case "GET":
			data, err = server.getMetadataForPath(vars["path"])
		case "POST":
			var body []byte
			body, err = ioutil.ReadAll(req.Body)
			if err != nil {
				break
			}
			err = json.Unmarshal(body, &data)
			if err != nil {
				break
			}
			if server.options.EditMode {
				err = server.writeMetadataForPath(vars["path"], data)
			} else {
				err = fmt.Errorf("Editing is not allowed")
				server.warn(err)
			}
		default:
			err = fmt.Errorf("Method not allowed")
		}
		fmt.Fprintf(w, "%s\n", server.outputDataAsJson(data, err))
	}
}

func (server *Server) makeSearchHandler() func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		enableCors(&w)

		var err error
		// vars := mux.Vars(req)
		req.ParseForm()
		q := req.FormValue("q")
		search := Search{
			Phrase: q,
			Terms:  unique(strings.Split(q, " ")),
			Fields: server.options.SearchFields,
			Found:  []FileEntry{},
			server: server,
		}
		search.searchDir("")
		fmt.Fprintf(w, "%s\n", server.outputDataAsJson(search.Found, err))
	}
}

func (server *Server) setupImageSizes() {

	server.thumbSize = ImageSize{Width: 150, Height: 150}
	server.previewSize = ImageSize{Width: 640, Height: 640}
	options := server.options
	if options.ThumbSize != "" {
		thumbSize, err := aToImageSize(options.ThumbSize)
		if err != nil {
			server.warn(fmt.Errorf("invalid thumb size: %s", options.ThumbSize))
		} else {
			server.thumbSize = thumbSize
		}
	}
	if options.PreviewSize != "" {
		previewSize, err := aToImageSize(options.PreviewSize)
		if err != nil {
			server.warn(fmt.Errorf("invalid preview size: %s", options.PreviewSize))
		} else {
			server.previewSize = previewSize
		}
	}
}

func (server *Server) setupLogger() {
	logFormat := "{{.Method}} {{.Path}} --> {{.Status}}"
	logPrefix := ""
	if server.options.Verbose {
		logFormat = negroni.LoggerDefaultFormat
		logPrefix = "[" + name + "] "
	}
	server.logger = negroni.NewLogger()
	if !server.options.Verbose {
		server.logger.SetFormat(logFormat)
	}
	server.logger.ALogger = log.New(os.Stdout, logPrefix, 0)
}

func (server *Server) setup() {

	server.setupLogger()
	// router
	router := mux.NewRouter()
	router.PathPrefix("/dir/").Handler(http.StripPrefix("/dir/", server.makeDirHandler()))
	router.HandleFunc("/image/{size:(?:thumb|preview)}/{path:.*}", server.makeImageHandler())
	router.HandleFunc("/metadata/{path:.*}", server.makeMetadataHandler())
	router.HandleFunc("/search/{path:.*}", server.makeSearchHandler())

	// setup negroni
	n := negroni.New()
	n.Use(negroni.NewRecovery())
	n.Use(server.logger)

	// setup files directory
	staticFiles := negroni.NewStatic(http.Dir(server.dirPath))
	staticFiles.Prefix = "/file"
	n.Use(staticFiles)

	//setup web-app directory
	staticWeb := negroni.NewStatic(http.Dir(server.wwwPath))
	n.Use(staticWeb)

	// steup image sizes

	server.setupImageSizes()

	// bind router to negroni
	n.UseHandler(router)
	server.negroni = n
}

func (server *Server) run() {
	logger := server.logger
	options := server.options

	// run server
	server.info(server.name + " (" + server.version + ")")
	server.info("port " + server.port)
	if options.Verbose {
		server.info("verbose logging on")
	}
	if options.ShowExif {
		server.info("exif Metadata on")
	}
	if server.options.EditMode {
		server.info("edit mode on")
	}
	// I'd love to do this with reflection
	server.info("config " + server.configPath)
	server.info("dir " + server.dirPath)
	server.info("www " + server.wwwPath)
	server.info("thumbSize " + server.thumbSize.String())
	server.info("previewSize " + server.previewSize.String())
	if options.Verbose {
		logger.Println("— — —")
	}
	// start autotagger
	server.autotag()
	// run
	http.ListenAndServe(":"+options.Port, server.negroni)

}

// - - - Search - - -

type Search struct {
	Phrase string      `json:"q"`
	Terms  []string    `json:"terms"`
	Fields []string    `json:"fields"`
	Found  []FileEntry `json:"found"`
	server *Server
}

func findTermsInString(terms []string, s string) []string {
	found := []string{}
	for _, t := range terms {
		if strings.Contains(strings.ToLower(s), strings.ToLower(t)) {
			found = append(found, t)
		}
	}
	return found
}

func findTermsInStringArray(terms, array []string) []string {
	found := []string{}
	for _, t := range terms {
		for _, a := range array {
			if strings.ToLower(t) == strings.ToLower(a) {
				found = append(found, t)
				break
			}
		}
	}
	return found
}

func interfaceToStrings(keywords interface{}) []string {
	keys := keywords.([]interface{})
	ks := make([]string, len(keys))
	for i := range keys {
		ks[i] = keys[i].(string)
	}
	return ks
}

func findTermsInMetadataFields(terms []string, fieldnames []string, metadata map[string]interface{}) []string {
	founds := []string{}
	for _, field := range fieldnames {
		if val, ok := metadata[field]; ok {
			switch v := val.(type) {
			case string:
				founds = append(founds, findTermsInString(terms, v)...)
			case []interface{}:
				// convert []interface{} to []strings
				vv := interfaceToStrings(v)
				founds = append(founds, findTermsInStringArray(terms, vv)...)
			}
		}
	}
	return founds
}

func unique(stringSlice []string) []string {
	keys := make(map[string]bool)
	list := []string{}
	for _, entry := range stringSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}

func (search *Search) searchDir(dirName string) {
	server := search.server

	// TODO: MAKE THIS CASE INSENSITIVE!

	server.info(fmt.Sprintf("searching dir: %s for: %v", dirName, search.Terms))

	dir, err := server.readDir(dirName, server.options.ShowExif, false, false)
	if err != nil {
		server.warn(err)
	}
	for _, file := range dir.Files {
		founds := []string{}

		founds = append(founds, findTermsInString(search.Terms, file.Name)...)

		if file.Kind == "image" {
			if keywords, ok := file.ImageInfo.Autotags["tags"]; ok {
				founds = append(founds, findTermsInStringArray(search.Terms, interfaceToStrings(keywords))...)
			}
		}
		if file.Metadata != nil {
			founds = append(founds, findTermsInMetadataFields(search.Terms, search.Fields, file.Metadata)...)
		}
		if len(founds) > 0 {
			if len(search.Terms) == len(unique(founds)) {
				search.Found = append(search.Found, file)
				server.info(fmt.Sprintf("search found: %s", file.Name))
			}
		}

	}
	for _, d := range dir.Dirs {
		dirPath := filepath.Join(dirName, d)
		search.searchDir(dirPath)
	}
}

// - - - Autotag - - -

type Autotagger struct {
	session   *clarifai.Session
	server    *Server
	threshold float64
}

const defaultThreshold = 0.915

func (at *Autotagger) tagImage(filepath string) []string {
	var err error
	at.server.info("tagging file: " + filepath)
	filename := at.server.makeCachedImage("autotag", filepath)
	at.server.info("image for autotagger: " + filename)

	data := clarifai.InitInputs()

	i, err := clarifai.NewImageFromFile(filename)
	if err != nil {
		panic(err)
	}
	_ = data.AddInput(i, "")

	data.SetModel(clarifai.PublicModelGeneral)

	resp, err := at.session.Predict(data).Do()
	if err != nil {
		panic(err)
	}

	const threshold = 0.915
	keywords := []string{}
	for _, t := range resp.Outputs[0].Data.Concepts {
		if t.Value > threshold {
			keywords = append(keywords, t.Name)
		}
	}
	return keywords
}

func (at *Autotagger) tagDir(dirName string) {
	// autotag files
	server := at.server

	server.info("tagging dir: " + dirName)
	dir, err := server.readDir(dirName, false, true, false)
	if err != nil {
		server.warn(err)
	}
	for _, file := range dir.Files {
		if file.Kind == "image" {
			f := filepath.Join(dirName, file.Name)
			atags := make(map[string]interface{})
			if tags, ok := file.ImageInfo.Autotags["tags"]; !ok {
				atags["tags"] = at.tagImage(f)
			} else {
				atags["tags"] = tags
			}
			if color, ok := file.ImageInfo.Autotags["color"]; ok {
				atags["color"] = color
			}
			server.writeDataForPath(f, atags)
		}
	}
	for _, d := range dir.Dirs {
		dirPath := filepath.Join(dirName, d)
		at.tagDir(dirPath)
	}
}

func (server *Server) autotag() {
	options := server.options

	if options.Autotag == nil {
		return
	}
	autotagOptions := *options.Autotag

	if autotagOptions.Tag == false {
		server.info("Autotag off")
		return
	}

	apiKey := autotagOptions.APIkey
	if apiKey == "" {
		server.warn(fmt.Errorf("No Clarifai API Key, cannot autotag"))
		return
	} else {
		server.info("Autotag on, API Key is: " + apiKey)
	}
	thumbSize, err := aToImageSize(autotagOptions.Size)
	if err != nil {
		server.warn(fmt.Errorf("invalid autotag option: size: %s", autotagOptions.Size))
	} else {
		thumbSize = ImageSize{Width: 512, Height: 512}
	}
	server.autotagSize = thumbSize

	threshold := autotagOptions.Threshold
	if threshold == float64(0.0) {
		threshold = defaultThreshold
	}

	if options.Verbose {
		server.logger.Println("— — —")
	}
	go func() {
		autotagger := Autotagger{
			session:   clarifai.NewApp(apiKey),
			server:    server,
			threshold: threshold,
		}
		// fmt.Printf("%#v\n", autotagger)
		autotagger.tagDir("")
		server.info("autotagger done")
	}()
}

// - - - Options, Config file & Setup - - -

type Options struct {
	DirPath      string   `json:"dir"       docopt:"DIR"`
	WWWPath      string   `json:"www"       docopt:"--www"`
	Verbose      bool     `json:"verbose"   docopt:"--verbose"`
	Port         string   `json:"port"      docopt:"--port"`
	ConfigPath   string   `json:"config"    docopt:"--config"`
	EditMode     bool     `json:"edit"      docopt:"--edit"`
	ThumbSize    string   `json:"thumb"     docopt:"--thumb"`
	PreviewSize  string   `json:"preview"   docopt:"--preview"`
	SearchFields []string `json:"search"    docopt:"--search"`
	ShowExif     bool     `json:"exif"      docopt:"--exif"`
	// ShowColor    bool             `json:"color"     docopt:"--color"` // very slow!
	// ShowHash     bool             `json:"hash"      docopt:"--hash"`  // very slow!
	Autotag *AutotagSettings `json:"autotag"`
}

const jsonSettingsFilename = "fargo.json"

func (A *Options) overideWith(B Options) {
	// yes this is ove the top but…
	//
	// This is the one thing the wonderful docopt gets wrong (well that and
	// being at the whim of reformatters). The sane thing would be to be
	// able to choose to bind some options over existing ones e.g. override
	// a config file with a command-line option when developing or testing.
	//
	// I made this assuption and then spent ages wondering why a feature
	// was broken, so now I' doing it manually. I guess that the explicit
	// nature of this has soething going for it. I'd jope I'd be less
	// likely spreading tons of debug throughout my app at 4:30am. Again.
	//
	// I assume that the cool kids would do this with reflection… but…
	// hey-ho!
	//
	// TODO: Redo this with reflection like a cool kid would
	//
	if B.DirPath != "" {
		A.DirPath = B.DirPath
	}
	if B.WWWPath != "" {
		A.WWWPath = B.WWWPath
	}
	if B.Verbose != false {
		A.Verbose = B.Verbose
	}
	if B.Port != "" {
		A.Port = B.Port
	}
	if B.ConfigPath != "" {
		A.ConfigPath = B.ConfigPath
	}
	if B.EditMode != false {
		A.EditMode = B.EditMode
	}
	if B.ThumbSize != "" {
		A.ThumbSize = B.ThumbSize
	}
	if B.PreviewSize != "" {
		A.PreviewSize = B.PreviewSize
	}
	if len(B.SearchFields) != 0 {
		A.SearchFields = B.SearchFields
	}
	if B.ShowExif != false {
		A.ShowExif = B.ShowExif
	}
	if B.Autotag != nil {
		if B.Autotag.Tag != false {
			A.Autotag.Tag = B.Autotag.Tag
		}
		if B.Autotag.Size != "" {
			A.Autotag.Size = B.Autotag.Size
		}
		if B.Autotag.APIkey != "" {
			A.Autotag.APIkey = B.Autotag.APIkey
		}
		if B.Autotag.Threshold != 0.0 {
			A.Autotag.Threshold = B.Autotag.Threshold
		}
	}
}

// Get options from command line arguments
func getArgOptions() *Options {
	usage := `Fargo: json file API server.

Usage:
	fargo [options] [DIR]

Description: 
	Fargo is an HTTP server that serves static files & folders from a
	directory and provides a JSON REST-like API describing them. It will
	inspect media files to provide metadata such as width and height for
	images and GPS Locatation data if available. It can provide EXIF
	data if requested.  

Arguments:
	DIR             Server root directory, defaults to '.'

Options:
	-p --port=<n>      Port to listen on [default: 3000].
	-w --www=<DIR>     Location of seperate web app directory.
	-c --config=<DIR>  Location of config file.
	-e --edit          Edit/Admin mode on.
	-x --exif          Show all Exif Metadata.
	-v --verbose       Verbose logging.
	-h --help          Show this screen.
	-V --version       Show version.`

	opts, err := docopt.ParseArgs(usage, os.Args[1:], version)
	if err != nil {
		log.Fatal("FATAL: Invalid options: ", err)
	}

	options := &Options{}

	err = opts.Bind(options)
	if err != nil {
		log.Fatal("FATAL: bind error: ", err)
	}
	return options
}

func localisePath(dir, p string) string {
	if p == "" {
		return dir
	}
	if p[0] == '/' {
		return p
	}
	p = filepath.Join(dir, p)
	return p
}

// Check if path exists
func pathExists(absPath string) bool {
	_, err := os.Stat(absPath)
	if err != nil {
		return false
	}
	return true
}

// Clean & check that path exists
func checkPath(p string) (string, error) {
	absPath, err := filepath.Abs(p)
	if err != nil {
		return "", err
	}
	_, err = os.Stat(absPath)
	if err != nil {
		return "", err
	}
	return absPath, nil
}

// Import settings from json config file
func getJSONFileConfig(configPath string, stripComments bool) (*Options, error) {

	options := &Options{}

	// is there a config file in the ConfigPath?
	configFile := filepath.Join(configPath, jsonSettingsFilename)
	if pathExists(configFile) {
		// read it in
		configFileData, err := ioutil.ReadFile(configFile)
		if err != nil {
			return nil, err
		}
		if stripComments {
			//strip full comment lines (any line that is just a comment)
			re := regexp.MustCompile(`(?m)^\s*\/\/.*?$`)
			configFileData = re.ReplaceAllLiteral(configFileData, []byte{})
			//
		}

		// unmarshal the json over the options already read
		err = json.Unmarshal(configFileData, options)
		if err != nil {
			return nil, err
		}
	}
	options.WWWPath = localisePath(configPath, options.WWWPath)
	options.DirPath = localisePath(configPath, options.DirPath)
	// return merged config
	return options, nil
}

// Get & merge options from command line args & config file.
// The command line overrides the config file
func getOptions() (*Options, error) {

	defaultOptions := &Options{
		ThumbSize:    "150x150",
		PreviewSize:  "640x640",
		ConfigPath:   ".",
		WWWPath:      ".",
		DirPath:      ".",
		SearchFields: []string{"title", "description", "keywords"},
		Autotag: &AutotagSettings{
			Size:      "512x512",
			Threshold: 0.915,
		},
	}

	// Get the command-line options first so we can use the configDir
	//to find any settings file
	argOptions := getArgOptions()
	// check the www path before we use it
	configPath, err := checkPath(argOptions.ConfigPath)
	if err != nil {
		return nil, err // err if doesn't exist
	}
	argOptions.ConfigPath = configPath

	// Read configFile (if its there)
	configFileOptions, err := getJSONFileConfig(configPath, true)
	if err != nil {
		return nil, err
	}

	// now merge the three settings files
	options := defaultOptions
	options.overideWith(*configFileOptions)
	options.overideWith(*argOptions)

	// check & clean paths
	dirPath, err := checkPath(options.DirPath)
	if err != nil {
		return nil, err
	}
	options.DirPath = dirPath

	if options.WWWPath != "" {
		wwwPath, err := checkPath(options.WWWPath)
		if err != nil {
			return nil, err
		}
		options.WWWPath = wwwPath
	}

	return options, nil
}

// - - - Main - - -

func main() {

	// options
	options, err := getOptions()
	if err != nil {
		log.Fatal("FATAL: ", err)
	}

	// create server
	server := Server{
		name:       name,
		version:    version,
		port:       options.Port,
		dirPath:    options.DirPath,
		wwwPath:    options.WWWPath,
		configPath: options.ConfigPath,
		options:    options,
	}
	server.setup()
	server.run()
}

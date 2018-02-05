var express = require('express');
var fs = require('fs');
var path = require('path');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var router = express.Router();
var multer = require('multer');
const SensorData = require('../models/sensordata');


// mongoDB connection
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/wsnlab", { useMongoClient: true });
var db = mongoose.connection;

//mongo Error Handeller 
db.on('error', console.error.bind(console, 'connection error:'));

// parse incoming requests
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// GET /
router.get('/', function(req, res, next) {
	db.collection('sensordatas').find().sort({_id: -1}).limit(1).toArray((err, data) => {
		if (err) throw err
		if(data){
			return res.render('index', { title: 'Sensor Data',data: data[0]});
		}
	});
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /about
router.get('/contact', function(req, res, next) {
	return res.render('contact', { title: 'Contact' });
  });

//GET /register
router.get('/upload', function(req, res, next){
  return res.render('upload', { title: 'upload'});
});

//var upload = multer({ dest: './uploads/' });
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, './uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, Date.now()+ '.json');
	  }
  });
  
var upload = multer({ storage: storage });
  

//POST /register
router.post('/upload', upload.single('file'),function(req, res, next){
	if(req.file){
		var filePath = req.file.path;
		var fileName = req.file.filename;
		var obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		
		if(obj){
			//console.log(obj);
			var dateTimeSting = obj.dateTime;
			var monthNames = [
				"January", 
				"February", 
				"March", 
				"April", 
				"May", 
				"June",
				"July", 
				"August", 
				"September", 
				"October", 
				"November", 
				"December"
			];
			var dt = new Date(dateTimeSting*1000);
			let dateString = dt.getDay();
			let timeString = dt.getSeconds()+':'+ dt.getMinutes()+':'+dt.getHours();
			let monthString = monthNames[dt.getMonth()];
			let yearString = dt.getFullYear();
				
		
			var sensorData = {
				dateTime: obj.dateTime,
				date: dateString,
				time : timeString,
				month: monthString,
				year: yearString,
				temperature: obj.temperature,
				humidity: obj.humidity,
				sound: obj.sound
			};
			SensorData.create(sensorData, function (err){
				if(err){
					return next(err);
				}else{
					console.log('YES');
					return  res.redirect('/');
				}
			});
			console.log('well done!. file proccsed');
			
			fs.unlinkSync(filePath);

		}else{
			console.log('something is wrong');
			var err = new Error('Please Choose a file first');
			err.status = 400;
			return next(err);
		}
	}else{
		var err = new Error('Error');
		err.status = 400;
		return next(err);
	}
	
});

module.exports = router;


	var dbcreation = require('./lib/config/dbCreation');
	
var express = require('express'),
	path = require('path'),
	bodypareser = require('body-parser'),
	fs = require('fs'),
	morgan = require('morgan');
	// logger = require('./lib/config/logger'),
	var loggerConf = require('./lib/config/loggerConfig');
	var env = require('./lib/config/env');

	var cors = require("cors")

	var dbBackup = require('./lib/config/dbBackup');
	
	var routes = require('./lib/routes');
const cryptConfig = require('./lib/config/crypt.config');

	var app = express();

	let http = require('http').Server(app);

	app.all("/api/*", function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
		res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
		return next();
	});
 
app.use(bodypareser.urlencoded({limit:'20mb',extended:true}));
app.use(bodypareser.json({limit:'20mb'}));
	
app.use(express.static(path.join(__dirname,'app')));

routes.configure(app);

dbcreation.createDB();
dbcreation.CreateTables();



var server = app.listen(parseInt(8029),function(){
	console.log('server start on '+ server.address().port+ ' port');
})	

	// Socket setting
	/* let io = require('socket.io')(server);
	require('./lib/config/socket.Ctrl')(io); */
	// Socket setting

	

dbBackup.GenerateBackup();
	
app.use(morgan('tiny', {
    stream: loggerConf.stream
})); 


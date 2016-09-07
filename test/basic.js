var sanpassport;
var app;
var userModel;
var request = require('supertest');

describe('Basic tests ::', function() {
	before(function (done) {
		var mongoose = require('mongoose');
		
		// Database connect
		var uristring = "mongodb://localhost:27017/sanpassport";
		
		var mongoOptions = { db: { safe: true }};
		
		mongoose.connect(uristring, mongoOptions, function (err, res) {
			if (err) {
				console.log ('Error al conectarse con: ' + uristring + '. ' + err);
			} else {
				console.log ('Conectado con: ' + uristring);
			}
		});
		
		var Schema = mongoose.Schema;
		
		// se usa un Schema para crear la estructura de lo necesario para registrar un usuario
		var userSchema = new Schema({
			username: { type: String, required: true, unique: true },
			email: { type: String, required: true, unique: true },
			password: { type: String, required: true},
			admin: { type: Boolean, required: true }
		});
		
		// Metodo para comparar el pass dado por el usuario y el encriptado que esta en al base de datos
		userSchema.methods.comparePassword = function(candidatePassword, cb) {
			cb(null, candidatePassword==this.password);
		};
		
		// Exportamos el modelo usado para crear los usuarios
		userModel = mongoose.model('User', userSchema);
		
		userModel.findOne({ username: "sanjorgek" }, function(err, user) {
			if(!err && !user) userModel.create({username: "sanjorgek", password: "12345678", email: "sanjorgek@prueba.com", admin: true}, function(err, user) {});
		});
		
		userModel.findOne({ username: "notadmin" }, function(err, user) {
			if(!err && !user) userModel.create({username: "notadmin", password: "12345678", email: "notadmin@prueba.com", admin: false}, function(err, user) {});
		});
		
		sanpassport = require('../')(userModel);
		console.log(sanpassport);
		var express = require('express');
		
		app = express();
		
		app.use(express.static( "public" ) );
		//app.use(express.logger());
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(
			express.session(
				{
					name: 'EncuentrosDiscretosCart',
					secret: "test",
					cookie: {
						maxAge: 1000*60*60*24*5
					}
				}
			)
		);
		app.use(sanpassport.initialize);
		app.use(sanpassport.session);
		app.use(app.router);
		
		app.get('/', function (req, res, next) {
			res.send(200);
		});
		
		app.get('/notAuth', sanpassport.ensureAuthenticated, function (req, res, next) {
			res.send(200);
		});
		
		app.get('/notAdmin', sanpassport.ensureAdmin, function (req, res, next) {
			res.send(200);
		});
		
		app.post('/login', sanpassport.login);
		
		// catch 404 and forward to error handler
		app.use(function(req, res, next) {
			var err = new Error('Not found.');
			err.status = 404;
			next(err);
		});
		
		// development error handler
		// will print stacktrace
		app.use(function(err, req, res, next) {
			if(err.status){
				res.send(err.status);
			}else if(err.view){
				err.status = 405;
				res.status(err.status || err);
				res.redirect("/");
			}else if(err){
				res.send(err);
			}else res.send(400);
		});
		
		app.listen(1337, function () {
			done();
		});
	});
	
	after(function (done) {
		return done();
	});
	
	it("dont die", function (done) {
		request(app).get('/')
		.expect(200)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("dont auth", function (done) {
		request(app).get('/notAuth')
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("login empty", function (done) {
		request(app).post('/login')
		.send({})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("login empty2", function (done) {
		request(app).post('/login')
		.send({username: "", password: ""})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("login empty3", function (done) {
		request(app).post('/login')
		.send({username: "fefe", password: ""})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("bad password", function (done) {
		request(app).post('/login')
		.send({username: "sanjorgek", password: "wsdfw"})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("good password", function (done) {
		request(app).post('/login')
		.send({username: "sanjorgek", password: "12345678"})
		.expect(302)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	it("not admin", function (done) {
		request(app).get('/notAdmin')
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
});
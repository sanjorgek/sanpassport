var sanpassport;
var app;
var request = require('supertest');

describe('Basic tests ::', function() {
	before(function (done) {
		var mongoose = require('mongoose');
		var passport = require('passport');
		
		// Database connect
		var uristring = "mongodb://localhost:27017/sanjorge";
		
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
			name: {type: String, required: true},
			apaterno: {type: String, required: true},
			amaterno: {type: String, required: true},
			email: { type: String, required: true, unique: true },
			password: { type: String, required: true},
			admin: { type: Boolean, required: true }
		});
		
		
		// Uso del metodo para encriptar los passwords
		userSchema.pre('save', function(next) {
			var user = this;
		
			if(!user.isModified('password')) return next();
		
			bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
				if(err) return next(err);
		
				bcrypt.hash(user.password, salt, function(err, hash) {
					if(err) return next(err);
					user.password = hash;
					next();
				});
			});
		});
		
		// Metodo para comparar el pass dado por el usuario y el encriptado que esta en al base de datos
		userSchema.methods.comparePassword = function(candidatePassword, cb) {
			bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
				if(err) return cb(err);
				cb(null, isMatch);
			});
		};
		
		// Exportamos el modelo usado para crear los usuarios
		var userModel = mongoose.model('User', userSchema);
		
		sanpassport = require('../')(passport, userModel);

		var express = require('express');
		
		app = express();
		
		app.use(express.static( "public" ) );
		app.use(express.logger());
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
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(app.router);
		
		app.get('/', function (req, res, next) {
			res.send(200);
		});
		
		app.get('/notAuth', sanpassport.ensureAuthenticated, function (req, res, next) {
			res.send(200);
		});
		
		// catch 404 and forward to error handler
		app.use(function(req, res, next) {
			var err = new Error('Not found.');
			err.status = 404;
			next(err);
		});
		
		// development error handler
		// will print stacktrace
		app.use(function(err, req, res, next) {
				if(err.view) err.status = 405;
				res.status(err.status || 500);
				res.redirect("/");
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
		.expect(302)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
});
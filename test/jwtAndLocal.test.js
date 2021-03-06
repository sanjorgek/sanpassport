let sanpassport;
let app;
let userModel;
let express;
const request = require('supertest');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const _ = require('lodash');
const methodOverride = require('method-override');
const expressSession = require('express-session');

const users = [
  {
    id: 1,
    username: 'sanjorgek',
    password: '12345678'
  },
  {
    id: 2,
    username: 'test',
    password: 'test'
  }
];

const success = (req, res) => {
	return res.sendStatus(200);
};

describe('JWT and Local tests ::', function() {
	before(function (done) {
		const moduleIndex = require('../');
		sanpassport = moduleIndex.initialize({
			jwt: {
				options: {
					jwtFromRequest: moduleIndex.ExtractJwt.fromAuthHeader(),
					secretOrKey: 'tasmanianDevil'
				},
				func(jwt_payload, next) {
					// usually this would be a database call:
					var user = _.find(users, {id: jwt_payload.sub});
					if (user) {
						next(null, user);
					} else {
						next(null, false);
					}
				}
			},
			local:{
				func: (username, password, done) => {
					let user = _.find(users, {username: username, password: password});
					(!user)?
						done(null, false, { message: 'Unknown user ' + username }):
						done(null, user);
				},
				options: { //optional
					usernameField: 'username',
					passwordField: 'password'
				}
			}
		});
		express = require('express');
		
		app = express();
		
		app.use(express.static( "public" ) );
		//app.use(express.logger());
		app.use(cookieParser());
		app.use(bodyParser.json());
		app.use(methodOverride());
		app.use(
			expressSession(
				{
					name: 'EncuentrosDiscretosCart',
					secret: "test",
					cookie: {
						maxAge: 1000*60*60*24*5
					},
					resave: true,
					saveUninitialized: false
				}
			)
		);
		app.use(sanpassport.initialize);
		app.use(sanpassport.session);		
		
		app.get('/', success);

		app.post("/login", function(req, res) {
			let user = _.find(
				users,
				{username: req.body.username, password: req.body.password});
			if(user){
				// from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
				let token = sanpassport.jwt.sign(
					{sub: user.id},
					'tasmanianDevil',
					{"issuer": user.name,"expiresIn": '1d'});
				return res.send({message: "ok", token: token});
			}else{
				return res.status(401).json({message:"no such user found"});
			}
		});

		app.get("/needAuth", (req, res, next) => {
			sanpassport.jwt.authenticate(req, res, (err) => {
				(err)?
					sanpassport.local.authenticate(req, res, next):
					next();
			});
		}, success);
			
		app.post('/login2', sanpassport.local.login, success);

		app.post('/logout', sanpassport.local.logout, success);
		
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
				res.sendStatus(err);
			}else res.send(400);
		});
		
		app.listen(1335, function () {
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
		request(app).get('/needAuth')
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});

	it("login empty", function (done) {
		request(app).post('/login')
		.send({})
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});

	it("login empty2", function (done) {
		request(app).post('/login')
		.send({username: "", password: ""})
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});

	it("login empty3", function (done) {
		request(app).post('/login')
		.send({username: "fefe", password: ""})
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});

	it("bad password", function (done) {
		request(app).post('/login')
		.send({username: "sanjorgek", password: "wsdfw"})
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});

	it("good password", function (done) {
		request(app).post('/login')
		.send({username: "sanjorgek", password: "12345678"})
		.expect(200)
		.end(function (err, res) {
			if(err) done(err);
			else sanpassport.jwt.verify(
				res.body.token,
				"tasmanianDevil",
				{subject: 1}, 
				done);
		});
	});

	it("good password2", function (done) {
		request(app).post('/login')
		.send({username: "sanjorgek", password: "12345678"})
		.expect(200)
		.end(function (err, res) {
			if(err) done(err);
			else request(app).get('/needAuth')
        .set('Authorization','JWT '+res.body.token)
        .expect(200)
        .end(function (err, res) {
          if(err) done(err);
          else done();
        });
		});
	});

	it("dont auth", function (done) {
		request(app).get('/needAuth')
		.expect(401)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("login empty", function (done) {
		request(app).post('/login2')
		.send({})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("login empty2", function (done) {
		request(app).post('/login2')
		.send({username: "", password: ""})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("login empty3", function (done) {
		request(app).post('/login2')
		.send({username: "fefe", password: ""})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("bad password", function (done) {
		request(app).post('/login2')
		.send({username: "sanjorgek", password: "wsdfw"})
		.expect(403)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
	it("good password", function (done) {
		request(app).post('/login2')
		.send({username: "sanjorgek", password: "12345678"})
		.expect(200)
		.end(function (err, res) {
			if(err) done(err);
			else done();
		});
	});
	
  it("good password2", function (done) {
		request(app).post('/login2')
		.send({username: "sanjorgek", password: "12345678"})
		.expect(200)
		.end(function (err, res) {
			if(err) done(err);
			else request(app).post('/logout')
        .set('Cookie',res.header['set-cookie'])
        .expect(200)
        .end(function (err, res) {
          if(err) done(err);
          else done();
        });
		});
	});
});
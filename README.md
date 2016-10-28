# sanpassport

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-month]][downloads-url]

## About
[Passport](https://www.npmjs.com/package/passport) and [passport-local](https://www.npmjs.com/package/passport-local) wrapper.

  [![NPM][downloads-chart]][chart-url]

## Settings
Install sanpassport
~~~bash
$ npm install sanpassport 
~~~
Then you need a valid user model/schema with his constructor, findById and findOne async-functions, also every object need comparePassword and create async-functions. 

An example with mongoose:
~~~js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  name: {type: String, required: true},
  apaterno: {type: String, required: true},
  amaterno: {type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  admin: { type: Boolean, required: true }
});
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  // do things
  var isMatch = this.password == isMatch;
  cb(null, isMatch);
};

var UserModel = mongoose.model('User', userSchema);

//optional, in case of successful login
function redirectCb(req, res, next){
  //...
};

//optional
function ensureAuthenticated(req, res, next){
  //...
};

//optional, see http://passportjs.org/docs/configure
// option1
function strategyFunc(username, password, done){
  //...
};
var sanpassport = require('sanpassport')(
  UserModel, 
  strategyFunc, 
  ensureAuthenticated);
// option2
var strategyJson = {
  func: strategyFunc,
  options: {
    usernameField: 'email',
    passwordField: 'password'
  }
};
var sanpassport = require('sanpassport')(
  UserModel, 
  strategyJson, 
  ensureAuthenticated);
~~~

## Use
An example with [express.js](http://expressjs.com/):
~~~js
app.use(sanpassport.initialize);
app.use(sanpassport.session);
//...
app.post("/login", sanpassport.login, function(req, res, next){
  //...
});
app.post("/logout", sanpassport.logout, function(req, res, next){
  //...
});
app.post("/secure/route", sanpassport.ensureAuthenticated, function(req, res){
  //...
});
app.post("/signin", function(req, res){
  var jsonBody = req.body;
  sanpassport.createUser(jsonBody, function(err, user){
    if(err || !user){
      res.send(404);
    }else{
      res.send(200);
    }
  });
});
~~~
See `test/basic.js` for more details.


[npm-image]: https://img.shields.io/npm/v/sanpassport.svg
[npm-url]: https://npmjs.org/package/sanpassport
[downloads-month]: https://img.shields.io/npm/dm/sanpassport.svg
[downloads-url]: https://npmjs.org/package/sanpassport
[downloads-chart]: https://nodei.co/npm-dl/sanpassport.png?months=6&height=1
[chart-url]: https://nodei.co/npm/sanpassport/

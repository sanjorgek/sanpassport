# sanpassport

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-month]][downloads-url]

## About
[Passport](https://www.npmjs.com/package/passport) and [passport-local](https://www.npmjs.com/package/passport-local) wrapper

  [![NPM][downloads-chart]][chart-url]

## Settings
Add sanpassport to your app
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
  //do things
};
var UserModel = mongoose.model('User', userSchema);
//optional
function redirectCb(req, res){
  //...
};
//optional
function strategyFunc(username, password, done){
  //...
};
//optional
function ensureAuthenticated(req, res, next){
  //...
};
//optional
function logout(req, res, next){

}
var sanpassport = require('sanpassport')(UserModel, redirectCb, strategyFunc, ensureAuthenticated, logout);
~~~

## Use
An example with [express.js](http://expressjs.com/):
~~~js
app.use(sanpassport.initialize);
app.use(sanpassport.session);
//...
app.post("/login", sanpassport.login);
app.post("/logout", sanpassport.logout);
app.post("/secure/route", sanpassport.ensureAuthenticated, function(req, res){
  //...
});
app.get("/adm/route", sanpassport.ensureAdmin, function(req, res){
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

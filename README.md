# sanpassport
[Passport](https://www.npmjs.com/package/passport) and [passport-local](https://www.npmjs.com/package/passport-local) simple adapter

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]

## Settings
First
~~~bash
$ npm install sanpassport 
~~~
Then you need a valid user model/schema with constructor, findById and findOne functions, also every object need comparePassword and create. One example with mongoose:
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
~~~

## Use
~~~js
//optional
var redirectCb = function(req, res){
  //...
};
//optional
var strategyFun = function(username, password, done){
  //...
};
var sanpassport = require('sanpassport')(UserModel, redirectCb, strategyFun);
~~~
Then you can use, example with [express.js](http://expressjs.com/):
~~~js
app.use(sanpassport.initialize);
app.use(sanpassport.session);
//...
app.post("/login", sanpassport.login);
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


[npm-image]: https://img.shields.io/npm/v/sanpassport.svg
[npm-url]: https://npmjs.org/package/sanpassport
[downloads-image]: https://img.shields.io/npm/dm/sanpassport.svg
[downloads-url]: https://npmjs.org/package/sanpassport

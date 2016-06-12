# sanpassport
[nodemailer](https://www.npmjs.com/package/passport) and [email](https://www.npmjs.com/package/passport-local) simple adapter

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]

## Settings
First
~~~bash
$ npm install sanpassport 
~~~
Then you need a valid user model/schema with constructor, findById, comparePassword and findOne functions. For example:
~~~js
var mongoose = require('mongoose'),
  bcrypt = require('bcrypt');
//...
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
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};
var userModel = mongoose.model('User', userSchema);
~~~

## Use
~~~js
var sanpassport = require('sanpassport')(userModel);
~~~


[npm-image]: https://img.shields.io/npm/v/sanpassport.svg
[npm-url]: https://npmjs.org/package/sanpassport
[downloads-image]: https://img.shields.io/npm/dm/sanpassport.svg
[downloads-url]: https://npmjs.org/package/sanpassport

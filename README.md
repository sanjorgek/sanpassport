# sanpassport

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-month]][downloads-url]
  [![Build Status][travis-image]][travis-url]
  [![bitHound Overall Score](https://www.bithound.io/github/sanjorgek/sanpassport/badges/score.svg)](https://www.bithound.io/github/sanjorgek/sanpassport)
  [![bitHound Dependencies](https://www.bithound.io/github/sanjorgek/sanpassport/badges/dependencies.svg)](https://www.bithound.io/github/sanjorgek/sanpassport/Integrations/dependencies/npm)
  [![bitHound Dev Dependencies](https://www.bithound.io/github/sanjorgek/sanpassport/badges/devDependencies.svg)](https://www.bithound.io/github/sanjorgek/sanpassport/Integrations/dependencies/npm)
  [![bitHound Code](https://www.bithound.io/github/sanjorgek/sanpassport/badges/code.svg)](https://www.bithound.io/github/sanjorgek/sanpassport)
  [![Code Climate](https://codeclimate.com/github/sanjorgek/sanpassport/badges/gpa.svg)](https://codeclimate.com/github/sanjorgek/sanpassport)
  [![Issue Count](https://codeclimate.com/github/sanjorgek/sanpassport/badges/issue_count.svg)](https://codeclimate.com/github/sanjorgek/sanpassport)  

## About
[Passport](https://www.npmjs.com/package/passport) [passport-local](https://www.npmjs.com/package/passport-local) and [passport-google-oauth](https://www.npmjs.com/package/passport-google-oauth) wrapper.

  [![NPM][downloads-chart]][chart-url]

## Settings
Install sanpassport

```bash
$ npm install sanpassport
```
Then you need a valid user model/schema with his constructor, findById and findOne async-functions, also every object need comparePassword and create async-functions.

An example with mongoose:

```js
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

//optional
function ensureAuthenticated(req, res, next){
  //...
};

//optional, see http://passportjs.org/docs/configure
// option1
function strategyFunc(username, password, done){
  //...
};

function googleFunc(accessToken, refreshToken, profile, done){
  //...
};
var sanpassport = require('sanpassport')([
  // Local
  {
    name: 'local',
    strategyFunc: {
      func: strategyFunc,
      options: {
        usernameField: 'email',
        passwordField: 'password'
      }
    },
    model: UserModel,
  },
  // or
  {
    name: 'local',
    strategyFunc: strategyFunc,
    model: UserModel
  },
  // or
  {
    name: 'local',
    model: UserModel
  },
  // Google
  {
    name: 'google-oauth',
    strategyFunc: googleFunc,
    config: {
      clientID: "your_client_id",
      clientSecret: "SHHHH! It's a secret",
      failureRedirect : "/"
    }
  }
],  
ensureAuthenticated, // optional
serialiseFunc, // optional
deserialiseFunc // optional
);
```

## Use
An example with [express.js](http://expressjs.com/):

```js
app.use(sanpassport.initialize);
app.use(sanpassport.session);
//
app.post("/login", sanpassport.local.login, function(req, res, next){
  //...
});
//
app.post("/loginGoogle", sanpassport.google.login, function(req, res, next){
  //...
});

app.get("callback/URL", sanpassport.google.callback, function(req,res, next){
  //...
});

app.post("/logout", sanpassport.logout, function(req, res, next){
  //...
});
app.post("/signin", function(req, res){
  var jsonBody = req.body;
  sanpassport.local.createUser(jsonBody, function(err, user){
    if(err || !user){
      res.send(404);
    }else{
      res.send(200);
    }
  });
});

app.post("/secure/route", sanpassport.authenticate, function(req, res){
  //...
});
```

See `test/basic.js` for more details.

## To Do

- [ ] Strategies
  - [x] Local
  - [x] Google OAuth2.0
  - [ ] Facebook
  - [ ] Twitter
  - [ ] OAuth
- [ ] New Strategy

## Changelog

### [4.0.0]()

* Node v6 or newer only.
* Google Oauth supported.

### [3.0.0](https://github.com/sanjorgek/sanpassport/tree/1b25fe6e5359c16c6b998948f85bc57aac1b9930) (27-10-2016)

* Travis integration.
* Logout removed as param.
* Strategy Local options added as params.


### [2.2.0](https://github.com/sanjorgek/sanpassport/tree/052131af5834d2bec9d55b49e5cbab45f8e263bb) (26-10-2016)

* Logout function added as param.

### [2.1.0](https://github.com/sanjorgek/sanpassport/tree/9cacdcfdc7d2c9ed379c94789dee8f43e3736f9c) (7-10-2016)

* ensureAuthenticated functions added as param.

### [2.0.2](https://github.com/sanjorgek/sanpassport/tree/6784fbbffd515f87be2246cbc521161085a8f6f9) (8-9-2016)

* Password validation.

### [2.0.1](https://github.com/sanjorgek/sanpassport/tree/a20e2d1b8b0a0ba8af6a3a8e667dd2f771c42f80) (7-9-2016)

* Strategy Function added as param.
* Passport dependencie and removed as param.
* Serialize user with id or _id.
* Model create method beside new instance.
* Test module

### [1.4.0](https://github.com/sanjorgek/sanpassport/tree/110fdaadad1de9ef10d8bb5847f0fa29ee358d7a) (25-7-2016)

* README with examples.

### [1.0.0](https://github.com/sanjorgek/sanpassport/tree/f131338f16829c32063a18761ca0463b07432a4f) (12-06-2016)

Start



[npm-image]: https://img.shields.io/npm/v/sanpassport.svg
[npm-url]: https://npmjs.org/package/sanpassport
[downloads-month]: https://img.shields.io/npm/dm/sanpassport.svg
[downloads-url]: https://npmjs.org/package/sanpassport
[downloads-chart]: https://nodei.co/npm-dl/sanpassport.png?months=6&height=1
[chart-url]: https://nodei.co/npm/sanpassport/
[travis-image]: https://travis-ci.org/sanjorgek/sanpassport.svg?branch=master
[travis-url]: https://travis-ci.org/sanjorgek/sanpassport

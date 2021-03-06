'use strict';
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./db.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const middlewares = require('./middlewares');
const app = express();
const users = require('./user.js')
const jwt = require('jsonwebtoken');
const jwtKey = 'onssuperSeCr_eTKKey?ffcafff';
const jwtExpirySeconds = 300;

const token = null;

app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }))
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use((req, res, next) => {
  //res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});



app.get('/api', (req, res) => {
  res.send({ express: 'Server online' });
  
});

app.post('/login', async (request, response, next) => {
  let succeded = null;
  const password = request.body.key;
  const user = request.body.user;
  //uncomment to genrate password for new user
  //generatePassword(password, 10);
  
  let p = await db.password(user);
  if (p.rows.length == 0) { //user doesn't exist
    response.send({ result: false });
    succeded = false;
    console.log("failed login");
  } else {
    bcrypt.compare(password, p.rows[0].password.toString(), async (err, res) => {
      if (err) throw err;     
      if (res) {
          const token = jwt.sign({ user }, jwtKey, {
          algorithm: 'HS256',
          expiresIn: jwtExpirySeconds
        });
        succeded = true;
        this.token = token;
        let projects = await db.projects(user);
        let arr = [];
        console.log("login: " + user);
        for (var i = 0; i < projects.rows.length; i += 1) {
          arr.push(projects.rows[i]);
        }
        response.set('Content-Type', 'application/json')
        response.cookie('token', token, { maxAge: jwtExpirySeconds * 1000 })
        response.json({ result: true, user: user, token: token, projects: arr});
        users.addUser({
          name: user,
          token: token,
          }
        );
        users.printUsers();
        
      } else {    
        console.log("Incorrect password")   
        response.send({ result: false });
      }
    }); 
  }  
});

app.post('/logout', (req, res, next) => {
  console.log("logout");
  
  if (req.headers.authorization === this.token) {
    users.deleteUser(req.body.user);
    res.send({success: true});
  } else {
    res.send({success: false});
  }
  
  // const user = req.body.user;
  // console.log(user);
  // res.send({logout: true})
});

app.post('/filter', async (req, res, next) => {
  console.log("logout");
  
  if (req.headers.authorization === this.token) {
    var fclass = await db.class();
    res.set('Content-Type', 'application/json')
    res.send(fclass.rows);
  } else {
    console.log("invalid token");
    res.send({success: false});
  }
  
  // const user = req.body.user;
  // console.log(user);
  // res.send({logout: true})
});

app.post('/layer', async (req, res, next) => {
  //console.log(req.headers.authorization);
  //console.log(req.body.user);
  const result = users.findUserToken(req.headers.authorization, req.body.user);
  //console.log("result: " + result);
  if (result) {
    var layer = req.body.menu;
    var geometry = await db.layer(layer);
    //console.log(geometry.rows);
    res.set('Content-Type', 'application/json')
    res.send(geometry.rows);
  } else {
    console.log("Resource unavailable")
    next();
  }
  
});

app.post('/roads', async (req, res, next) => {
  console.log(req.body);
  const result = users.findUserToken(req.headers.authorization, req.body.user);
  const code = req.body.code;
  if (result) {
    var layer = req.body.menu;
    var geometry = await db.road(code);
    //console.log(geometry.rows);
    res.set('Content-Type', 'application/json')
    res.send(geometry.rows);
  } else {
    console.log("Resource unavailable")
    next();
  }
  
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

async function  generatePassword(password, rounds) {
  await bcrypt.genSalt(rounds, function(err, salt) {
      if (err) throw err;
      bcrypt.hash(password, salt, function(err, hash) {
        console.log(hash);
        
      });
    });
}

module.exports = app;

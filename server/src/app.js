const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors')
const db = require('./db.js')
const bodyParser = require('body-parser')

const middlewares = require('./middlewares');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }))
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});

app.get('/api', (req, res) => {
  res.send({ express: 'Server online' });
  
});

app.post('/login', async (req, res, next) => {
  console.log(req.body);
  res.send({ express: 'Login' });
});

app.post('/layer', async (req, res, next) => {
  var layer = req.body.menu;
  var geometry = await db.layer(layer);
  console.log(geometry.rows);
  res.set('Content-Type', 'application/json')
  res.send(geometry.rows);
});


app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;

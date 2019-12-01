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
  db.c
  next();
});

app.get('/api', (req, res) => {
  res.send({ express: 'Server online' });
  
});

app.post('/layer', (req, res, next) => {
  var layer = req.body.menu;
  var geometry = db.layer(layer);
  res.set('Content-Type', 'application/json')
  const body = res.body()
  res.send(JSON.stringify(geometry));
});


app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;

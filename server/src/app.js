const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors')
const db = require('./db')
const bodyParser = require('body-parser')

//require('dotenv').config();

const middlewares = require('./middlewares');
//const api = require('./api');

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
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  };
  next();
});



app.get('/api', (req, res) => {
  res.send({ express: 'Server online' });
  
});

app.post('/api', (req, res) => {
  console.log(req.body);
  res.set('Content-Type', 'text/html')
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;

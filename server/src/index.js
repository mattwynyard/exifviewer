const app = require('./app');
const fs = require('fs');
const https = require('https');
const port = process.env.PORT || 443;

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

https.createServer(options, function(req, res) {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: https://localhost:${port}`);
    /* eslint-enable no-console */
  });

// app.listen(port, () => {
//   /* eslint-disable no-console */
//   console.log(`Listening: http://localhost:${port}`);
//   /* eslint-enable no-console */
// });

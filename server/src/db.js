const { Pool, Client } = require('pg')

const connection = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dbtemp',
    password: 'Glacier_7',
    port: 5432,
    max: 20,
    connectionTimeoutMillis: 2000,
  })
  connection.connect(function(err) {
        if (err) throw err;
    });

connection.query('SELECT ST_AsGeoJSON(geom) FROM nzta_centrelines_marlborough', (err, result) => {
    if (err) {
        return console.error('Error executing query', err.stack)
    }
    console.log(result.rows[0]); // brianc
    var geometry = JSON.parse(result.rows[0].st_asgeojson);
    console.log(geometry.coordinates[0]);
    })


connection.on('connect', () => {
console.log("connected to database on port: " );
  });
  

 module.exports = connection;
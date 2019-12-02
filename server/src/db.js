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

connection.on('connect', () => {
console.log("connected to database on port: " );
});

module.exports = { 
    layer: function(layer) { 
        return new Promise((resolve, reject) => {
            let district = "Waitomo District";
            connection.query("SELECT ST_AsGeoJSON(geom) FROM nzta_centrelines WHERE taname = '" + district + "'", (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                var geometry = resolve(result);
                return geometry;
            })
        })
    }
}

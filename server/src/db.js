const { Pool, Client } = require('pg')

const connection = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tempdb',
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
        connection.query('SELECT ST_AsGeoJSON(geom) FROM centrelines', (err, result) => {
            if (err) {
                return console.error('Error executing query', err.stack)
            }
            var geometry = result.rows[0].st_asgeojson;
            return geometry;
        })
    }
}

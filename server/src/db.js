'use strict'
const { Pool } = require('pg')

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
    console.log("connected to database on port: 5432");
});

module.exports = { 
    projects : (user) => {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT description, date FROM project WHERE client = $1::text AND active = true';
            connection.query(sql, [user], (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                var project = resolve(result);
                return project;
            });
        });
    },

    layer: function(layer) { 
        return new Promise((resolve, reject) => {
            connection.query("SELECT gid, roadid, carriagewa, location, fault, size, priority, photoid, faulttime, ST_AsGeoJSON(geom) FROM fault", (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                var geometry = resolve(result);
                return geometry;
            });
        });
    },

    password: function(username) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT password FROM users WHERE username = $1::text';
            connection.query(sql, [username], (err, results) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                var p = resolve(results);
                //console.log(results);
                return p;
            });
        });
    }
}

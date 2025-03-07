const { MongoClient } = require('mongodb');

let dbConnection;

// initially connects to database
function connectToDb(cb){
    MongoClient.connect('mongodb://localhost:27017/spammer-guide')
    .then((client) => {
        dbConnection = client.db();
        return cb();
    })
    .catch(error => {
        console.log(error);
        return cb(error);
    });
}

// retrives existing database connection
function getDb() {
    if (!dbConnection) 
        throw new Error('Database not connected!');
    return dbConnection;
}

module.exports = {
    connectToDb,
    getDb
}
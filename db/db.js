const { MongoClient } = require('mongodb');

let dbConnection;

// initially connect to database
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

// retrive database connection once we already have connected to it
function getDb() {
    if (!dbConnection) 
        throw new Error('Database not connected!');
    return dbConnection;
}

module.exports = {
    connectToDb,
    getDb
}
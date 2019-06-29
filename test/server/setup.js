const mongoose = require('mongoose');
const config = require('config');
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
    mongoose.set('useNewUrlParser', true);
    const connection = mongoose.createConnection(config.get('db'));
    await connection.dropDatabase();

    // Make sure the mongod binary is downloaded before running tests
    const mongod = new MongoMemoryServer();
    await mongod.getConnectionString();
    await mongod.stop();

    return new Promise(resolve => {
        connection.close(resolve);
    });
};

const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://velu:laravelfirebase@cluster0.7gv7fkg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
// await client.connect();
// await listDatabases(client);

console.log(client);


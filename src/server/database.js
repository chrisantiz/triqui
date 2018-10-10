const santz = require('santz');
const config = {
    host: '127.0.0.1',
    user:'root',
    password:'',
    database: 'triki'
}
const connection = santz.getConnection(config);
santz.connect(connection, true);

const Model = santz.Model({
    connection: connection,
    strict: true,
    columnNameState: 'state',
    showQuery: true
})
module.exports = Model;
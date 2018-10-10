const Santz = require('./database');
const table = 'users';
module.exports = {
    select(id) {
        if (typeof id === 'number') {
            return Santz.select('*').from(table).where('id', id).exec();
        }
        return Santz.select('*').from(table).exec();
    },
    insert(data) {
        return Santz.insert(table).values(data).exec();
    },
    login({nick, pass}) {
        return Santz.select('*').from(table).where('nick', nick).and('pass', pass).exec();
    }
}

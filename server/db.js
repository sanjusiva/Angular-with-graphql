const { DataStore } = require('notarealdb');

const store = new DataStore('./data');

module.exports = {
   todos:store.collection('todo')
};
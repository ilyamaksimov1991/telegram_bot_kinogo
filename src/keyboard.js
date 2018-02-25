const button = require('./name-button');
module.exports = {
    home: [
        [button.home.film,button.home.cinemas],
        [button.home.favorites]
    ],
    film: [
        [button.film.random],
        [button.film.action,button.film.comedy],
        [button.back]
    ],

};
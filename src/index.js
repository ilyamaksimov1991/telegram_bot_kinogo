const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const mongoose = require('mongoose');
const helper = require('./helper');
const config = require('./config');
const button = require('./name-button'); // названия кнопок
const keyboard = require('./keyboard'); //
const database = require('../database.json'); //


mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL/*,{
 useMongoClient: true
 }*/)
    .then(() => console.log(' mongoosse connect'))
    .catch(err => console.log(err, ' Ошибка '));

require('./model/film.model');
require('./model/cinemas.model');
require('./model/user.model');
mongoose.model('films');
const Film = mongoose.model('films');
const Cinemas = mongoose.model('cinemas');
const User = mongoose.model('users');
//database.films.forEach(f=> new Film(f).save());
//database.cinemas.forEach(f=> new Cinemas(f).save());
/*new User({
    telegramId: '1232132'
}).save().then(console.log('Ноовая запись в юзеры')).catch(console.log(' Ошибка  записи юзера'));*/

/*Film.find({}).remove().then(()=> console.log(' УДАЛЕНО !!!!'))
 .catch(err=> console.log(err, ' Ошибка не удалено'));*/
///--------
//const TOKEN = '525905986:AAG6TYe0XbBk133ZlNNbItrN5MlSi0zOG7Q'; mainer
const TOKEN = '525273275:AAFO9qYvfJ7PtQRhwZCuixGw6Wnm8z8Udgs'; //kinogo

const bot = new TelegramBot(config.TOKEN, {polling: true});

const ACTION_TYPE = {
    TOGGLE_FAVORITE_FILM: 'tff',
    SHOW_CINEMAS: 'sc',
    SHOW_CINEMAS_MAP: 'scm',
    SHOW_FILMS: 'sf'
};
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log('работает');

    switch (msg.text) {
        case button.home.film:
            bot.sendMessage(chatId, 'Фильмы');
            bot.sendMessage(chatId, ' Выбирите фильм', {
                reply_markup: {
                    keyboard: keyboard.film
                }
            });
            break;
        case button.film.comedy:
            // bot.sendMessage(chatId, 'Фавориты');
            getFilmToQuery(chatId, {type: 'comedy'});

            break;
        case button.film.action:
            // bot.sendMessage(chatId, 'Фавориты');
            getFilmToQuery(chatId, {type: 'action'});

            break;
        case button.film.random:
            // bot.sendMessage(chatId, 'Фавориты');
            getFilmToQuery(chatId, {});
            break;
        case button.home.favorites:
            bot.sendMessage(chatId, 'Фавориты');
            getFavorite(chatId, msg);
            break;
        case button.home.cinemas:
            //bot.sendMessage(chatId, 'Кинотеатры');
            getCinemasToQuery(chatId, {});
            break;
        case button.back:
            // bot.sendMessage(chatId, 'Назад');
            bot.sendMessage(chatId, 'Назад', {
                reply_markup: {
                    keyboard: keyboard.home
                }
            });
            break;

    }

});

bot.onText(/\/start/, msg => {
    //const chatId = msg.chat.id;
    const chatId = helper.getId(msg);
    const text = `Здравствуйте ${msg.from.first_name} \n Выбирете команду для дальнейшей работы`;
    bot.sendMessage(chatId, text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })
});

bot.on('callback_query', query => {
    //const chatId = helper.getId(query);
    const chatId = query.from.id;
    console.log('избранное', query.data);

    try {
        data = JSON.parse(query.data)
    } catch (e) {
        throw new Error('Data is not object');
    }

    let {type} = data;

    switch (type) {
        case ACTION_TYPE.TOGGLE_FAVORITE_FILM:
            console.log('TOGGLE_FAVORITE_FILM');
            console.log(' Это КВЕРИ ', query);
            console.log('точка 0');
            // toggleFavoriteFilm(chatId, query.id, data);
            toggleFavouriteFilm(chatId, query.id, data);
            console.log('точка 0+1');
            break;
        case ACTION_TYPE.SHOW_FILMS:
            console.log('SHOW_FILMS');
            sendFilms(chatId, data);
            break;
        case ACTION_TYPE.SHOW_CINEMAS_MAP:
            console.log('SHOW_CINEMAS_MAP');
            const {lat , lon} = data;
            bot.sendLocation(query.message.chat.id, lat, lon);
            break;
        case ACTION_TYPE.SHOW_CINEMAS:
            console.log('SHOW_CINEMAS');
            sendCinemas(chatId, data);
            break;
    }
});


bot.onText(/\/f(.+)/, (msg, [sourse, match]) => {
    //const chatId = msg.chat.id;
    const chatId = helper.getId(msg);

    console.log(match);
    Promise.all([
        Film.findOne({uuid: match}),
        User.findOne({telegramId: msg.from.id})
    ])
        .then(([films, user]) => {
            console.log(films);
            let isFav = false;

            if (user) {
                isFav = user.films.indexOf(films.uuid) !== -1
            }

            let favText = isFav ? 'Удалить из избранного' : 'Добавить в избранное';
            //console.log(films.picture);
            const caption = `Название '${films.name}'\nГод ${films.year}\nРейтинг ${films.rate}\nДлительность ${films.length}\nСтрана ${films.country}\n`;
            bot.sendPhoto(chatId, films.picture, {
                caption: caption,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `Кинопоиск '${films.name}'`,
                                url: films.link
                            }
                        ],
                        [
                            {
                                text: favText,
                                callback_data: JSON.stringify({
                                    type: ACTION_TYPE.TOGGLE_FAVORITE_FILM,
                                    filmUuid: films.uuid,
                                    isFav: isFav
                                })
                            },
                            {
                                text: 'Кинотеатры',
                                callback_data: JSON.stringify({
                                    type: ACTION_TYPE.SHOW_CINEMAS,
                                    cinemaUuids: films.cinemas
                                })
                            }
                        ]
                    ]
                }
            });

        })
        .catch(err => console.log(err, ' Ошибка запроса'));


});

bot.onText(/\/c(.+)/, (msg, [sourse, match]) => {
    const chatId = helper.getId(msg);
    Cinemas.findOne({uuid: match}).then((cinemas) => {
        console.log('cinemas', cinemas);
        // console.log(cinemas);
        const caption = `Кинотеатр '${cinemas.name}'\n`;
        bot.sendMessage(chatId, caption, {
            caption: caption,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: cinemas.name,
                            url: cinemas.url
                        }
                    ],
                    [
                        {
                            text: 'Показать на карте',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_CINEMAS_MAP,
                                lat: cinemas.location.latitude,
                                lon: cinemas.location.longitude
                            })
                        },
                        {
                            text: 'Показать фильмы',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_FILMS,
                                cinemasUuid: cinemas.films
                            })
                        }
                    ]
                ]
            }
        });

    })
        .catch(err => console.log(err, ' Ошибка запроса'));
});

function getFilmToQuery(chatId, qyery) {
    Film.find(qyery).then((films) => {
        const html = films.map((f, i) => {

            return `<b>${i + 1}</b> - ${f.name} - /f${f.uuid}`;
        }).join('\n');
        console.log(html);
        sendHtml(chatId, html, 'film');
    })
        .catch(err => console.log(err, ' Ошибка запроса'));

}

function getCinemasToQuery(chatId, qyery) {
    Cinemas.find(qyery).then((cinemas) => {
        const html = cinemas.map((f, i) => {

            return `<b>${i + 1}</b> - ${f.name} - /c${f.uuid}`;
        }).join('\n');
        console.log(html);
        sendHtml(chatId, html);
    })
        .catch(err => console.log(err, ' Ошибка запроса'));

}

/* Добавление/удаление Избранное */
function toggleFavouriteFilm(userId, queryId, {filmUuid, isFav}) {

    let userPromise;

    User.findOne({telegramId: userId})
        .then(user => {
            if (user) {
                if (isFav) {
                    user.films = user.films.filter(fUuid => fUuid !== filmUuid)
                } else {
                    user.films.push(filmUuid)
                }
                userPromise = user
            } else {
                userPromise = new User({
                    telegramId: userId,
                    films: [filmUuid]
                })
            }

            const answerText = isFav ? 'Удалено' : 'Добавлено';

            userPromise.save().then(_ => {
                bot.answerCallbackQuery({
                    callback_query_id: queryId,
                    text: answerText
                })
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
}

/* показ фаворитов фильмов*/
function getFavorite(chatId, msg) {

    User.findOne({telegramId: chatId}).then(user => {

        if (user) {
            console.log('user ', user);
            Film.find({uuid: {'$in': user.films}}).then(film => {
                console.log(' Фильмы ', film);
                let html;
                if (film.length) {
                    html = film.map((f, i) => {
                        return `<b>${i + 1}</b> - Фильм '${f.name}'/ Рейтинг -${f.rate} - /f${f.uuid}`;
                    }).join('\n');
                    // return html;
                } else {
                    html = 'Вы еще не добавляли фильмы в избранное';
                }
                sendHtml(chatId, html, 'film')
            })
        } else {
            console.log('Вы пока ничего не добавили ', user);
            sendHtml(chatId, 'Вы еще не добавляли фильмы в избранное ', 'film')
        }
    })
}

function sendHtml(chatId, html, keyboardName = null) {
    const option = {
        parse_mode: 'HTML',
    };
    if (keyboardName) {
        option['reply_markup'] = {
            keyboard: keyboard[keyboardName]
        }
    }
    bot.sendMessage(chatId, html, option);


}

function sendCinemas(chatId, data){
    console.log('data', data);
    console.log('data', data.cinemaUuids);
    Cinemas.find({uuid: {'$in': data.cinemaUuids}}).then(cinemas=>{
        let html ='<i>Идет в кинотеатрах:</i> \n';
        html +=cinemas.map((c,i)=>{
            return `<b>${i+1}</b> - Кинотеатр:'${c.name}' - /c${c.uuid}`
        }).join('\n');
        sendHtml(chatId, html, 'home')
    })
}
function sendFilms(chatId, data){
    console.log('EE SHOW_CINEMAS_MAP', data);
    Film.find({uuid: {'$in': data.cinemasUuid}}).then(film=>{
        let html ='<i>В этом кинотеатре идут фильмы:</i> \n';
        html +=film.map((c,i)=>{
            return `<b>${i+1}</b> - Кинотеатр:'${c.name}' - /f${c.uuid}`
        }).join('\n');
        sendHtml(chatId, html, 'home')
    }).catch(e=>{
        console.log('EE SHOW_CINEMAS_MAP', e);
    })
}

helper.log();
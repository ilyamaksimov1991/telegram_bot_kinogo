const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const TOKEN = '525905986:AAG6TYe0XbBk133ZlNNbItrN5MlSi0zOG7Q';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, {polling: true});

// дополнительные параметры после команд /test параметр"
/*bot.onText(/\/test (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    bot.sendMessage(chatId, resp);
});*/

/*inline keyboards */
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Клавиатура', {
        reply_markup: {
            keyboard: [
                ['1', '2'],
                ['3']
            ]
        }
    });
});
console.log('yes 1');



bot.on('message', msg => {

    const chatId = msg.chat.id

    bot.sendMessage(chatId, 'Inline keyboard', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Google',
                        url: 'https://google.com'
                    }
                ],
                [
                    {
                        text: 'Reply',
                        callback_data: 'reply'
                    },
                    {
                        text: 'Forward',
                        callback_data: 'forward'
                    }
                ]
            ]
        }
    })

})

bot.on('callback_query', query => {
    //bot.sendMessage(query.message.chat.id, debug(query))

    bot.answerCallbackQuery(query.id, `${query.data}`)
})




bot.onText(/\/pic/, msg => {

    bot.sendPhoto(msg.chat.id, fs.readFileSync(__dirname + '/cat.jpg'))

})

bot.onText(/\/pic2/, msg => {

    bot.sendPhoto(msg.chat.id, './cat.jpg', {
        caption: 'This is cat photo'
    })

})
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    telegramId: {
        type: String,
        required: true
    },
    films: {
        type: [String],
        default: []
    },
});

mongoose.model('users',UserSchema);
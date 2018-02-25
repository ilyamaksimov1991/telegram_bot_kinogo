const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CinemasSchema = new Schema({
    uuid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: Schema.Types.Mixed,

    },
    url: {
        type: String,
        required: true
    },
    films: {
        type: [String],
        default: []
    }

});

mongoose.model('cinemas',CinemasSchema);
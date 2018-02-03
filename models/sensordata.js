const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


var SensorDataSchema = new mongoose.Schema({
    dateTime: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    date: {
        type: String,
        required: true,
        trim: true
    },
    time:{
        type: String,
        required:true,
        trim: true
    },
    month:{
        type: String,
        required: true,
        trim: true
    },
    year:{
        type: String,
        required: true,
        trim: true
    },
    temperature:{
        type: String,
        required: true,
        trim: true
    },
    humidity: {
        type: String,
        required: true,
        trim: true
    },
    sound: {
        type: String,
        required: true,
        trim: true
    }
});

var SensorData = mongoose.model('SensorData', SensorDataSchema);
module.exports = SensorData;

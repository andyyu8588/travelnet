const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    birthdate: Date,
    gender: String,
    profilepicture: String,
    encounters: Array,
    rooms: Array,
    socketIds: Array,
    isActive: Boolean, // active vs online
    log: {
        in: Array,
        out: Array
    },
})

module.exports = mongoose.model('User', UserSchema)
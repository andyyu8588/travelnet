const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    birthdate: Date,
    gender: String,
    profilepicture: {type: String, default: ''},
    encounters: {type: Array, default: []},
    rooms: {type: Array, default: []},
    socketIds: {type: Array, default: []},
    isActive: {type: Boolean, default: true}, // active vs online
    log: { 
        type:{
            in: Array,
            out: Array
        },
        default: {
            in: [new Date().toISOString()],
            out: []
        }
    },
    trips: {
        type: [{
            date: String,
            name: String,
            venues: [{
                time: Date,
                name: String,
                price: Number
            }]
        }],
        default: []
    }
})

module.exports = mongoose.model('User', UserSchema)
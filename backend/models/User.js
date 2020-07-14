const mongoose = require('mongoose')
const { any } = require('underscore')

const UserSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
    // firstname: String,
    // lastname: String,
    birthdate: Date,
    gender: String,
    profilepicture: {type: String, default: ''},
    followers: {type: Array, default: []},
    following: {type: Array, default: []},
    rooms: {type: Array, default: []},
    socketIds: {type: Array, default: []},
    isActive: {type: Boolean, default: true}, // active vs online
    log: { 
        type: {
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
            dateRange: {
                start: Date,
                end: Date,
                length: Number
            },
            name: String,
            schedule: [{
                day: Date,
                venues: [{
                    hour: Date,
                    venueName: String,
                    venueCity: String,
                    venueAddress: String,
                    price: Number
                }],
            }],
            private: Boolean
        }],
        default: []
    },
    history: {
        type: [
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array}
        ],
        default: [
            {code:'NA', continent: 'North-America', places: []},
            {code:'SA', continent: 'South-America', places: []},
            {code:'EU', continent: 'Europe', places: []},
            {code:'AS', continent: 'Asia', places: []},
            {code:'AF', continent: 'Africa', places: []},
            {code:'OC', continent: 'Oceania', places: []},
            {code:'AN', continent: 'Antarctica', places: []}
        ]
    },
    wishlist: {
        type: [
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array},
            {code: String, continent: String, places: Array}
          ],
        default: [
            {code:'NA', continent: 'North-America', places: []},
            {code:'SA', continent: 'South-America', places: []},
            {code:'EU', continent: 'Europe', places: []},
            {code:'AS', continent: 'Asia', places: []},
            {code:'AF', continent: 'Africa', places: []},
            {code:'OC', continent: 'Oceania', places: []},
            {code:'AN', continent: 'Antarctica', places: []}
        ]
    },
    Albums:[{
        title: { type: String, required: true },
        date: { type: String, required: true },
        description: String,
        posts:[
            {
            date: String,
            location: String,
            title: { type: String, required: true },
            content:[{
                images: String,
                text: { type: String, required: true }
            }]

            }
        ]
    }]
})

module.exports = mongoose.model('User', UserSchema)
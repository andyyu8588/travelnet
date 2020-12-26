const mongoose = require('mongoose')

const VenueSchema = mongoose.Schema({
  name: String,
  adress: String,
  price: Number,
  categories: {type: [String], default: ['all']},
})

module.exports = mongoose.model('Venue', VenueSchema)

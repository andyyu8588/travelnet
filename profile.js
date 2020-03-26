const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Voyage', {useNewUrlParser: true, useUnifiedTopology: true});

var profileSchema = new mongoose.Schema({
    name: String,
    Desired_Country: String,
    Living_Country: String,
    Birth_date: Date,
    Password
})

var Profile = mongoose.model('Profile',profileSchema);

//create Profile:

var New = new Profile({name:'Bob', Desired_Country:'India',Local_Country:'Mongolia',Age:'32'});

//adds new profile to profile:

New.save((err,profile)=>{
    if(err){
        console.log('error')
    }
    else{
        console.log('saved')
        console.log(profile)
    }
})

//use .create to create and save to database


//display Profiles:
Profile.find({},(err,profiles)=>{
if(err){
    console.log('error');
    console.log(err);
}
else{
    console.log('all profiles')
    console.log(profiles)
}
}
)
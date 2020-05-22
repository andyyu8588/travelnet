const express = require('express')
const router = express.Router()
// import model
const User = require("../models/User")

router.get('', (req, res, next) => {
    let query = req.get('user')
    User.find({$or:
        [{$and: [{firstName: {$in: query}}, 
                {firstName : {$regex: `.*${query}.*`, $options: 'i'}}]}, 
        {$and: [{lastName: {$in: query}},
                {lastName: {$regex: `.*${query}.*`, $options: 'i'}}]},
        {$and: [{username: {$in: query}},
                {username: {$regex: `.*${query}.*`, $options: 'i'}}]},]
            },
        (err, result) => {
        if (err) {
            res.status(500).json({
                message: err
              })
        }
        else{
            let resArr = []
            result.forEach((e)=>{
            resArr.push(e)
        })
        res.status(200).json({
            users: resArr
            })
            }
        })
    })

module.exports = router
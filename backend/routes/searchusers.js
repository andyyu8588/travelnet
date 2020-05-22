const express = require('express')
const router = express.Router()
// import model
const User = require("../models/User")

router.get('', (req, res, next) => {
    let query = req.get('user')
    User.find({$or:
        [{$and: [{firstName: {$in: query}}, 
                {firstName : {$regex: `.*${data.req}.*`, $options: 'i'}}]}, 
        {$and: [{lastName: {$in: quey}},
                {lastName: {$regex: `.*${data.req}.*`, $options: 'i'}}]},
        {$and: [{username: {$in: quey}},
                {username: {$regex: `.*${data.req}.*`, $options: 'i'}}]},]
            },
        (err, res) => {
        if (err) {
            res.status(500).json({
                message: err
              })
        }
        else{
            let resArr = []
            res.forEach((e)=>{
            resArr.push(e)
        })
        res.status(200).json({
            users: resArr
            })
            }
        })
    })

module.exports = router
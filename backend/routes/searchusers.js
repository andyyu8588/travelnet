const express = require('express')
const router = express.Router()
// import model
const User = require("../models/User")

router.get('', (req, res, next) => {

    let query = req.query.user
    console.log(query)
    User.find({$or:
        [
                { firstname : { $in:[/.*${query}.*/i]}}, 
                { lastname : { $in:[/.*${query}.*/i]}},
                { username : { $in:[/.*${query}.*/i]}}
            ],
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
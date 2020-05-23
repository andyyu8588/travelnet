const express = require('express')
const router = express.Router()
// import model
const User = require("../models/User")

router.get('', (req, res, next) => {

    let query = req.query.user
    console.log(query)
    User.aggregate([
        {$project: { "name" : { $concat : [ "$firstname", " ", "$lastname" ] } }},
        {$match: {"name": {$regex: /.*query.*/i}}}
      ]).exec(function(err, result){
        console.log(result);
      });

    // User.find({$or:
    //     [
    //             { firstname : { $regex: `.*${query}.*`, $options: 'i'}},
    //             { lastname : { $regex: `.*${query}.*`, $options: 'i'}},
    //             { username : { $regex: `.*${query}.*`, $options: 'i'}},
    //         ],
    //         },
    //     (err, result) => {
    //     if (err) {
    //         res.status(500).json({
    //             message: err
    //           })
    //     }
    //     else{
    //         let resArr = []
    //         result.forEach((e)=>{
    //         resArr.push(e)
    //     })
    //     res.status(200).json({
    //         users: resArr
    //         })
    //         }
    //     })
    // })
        })
module.exports = router
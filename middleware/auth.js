const jwt = require('jsonwebtoken')
const Users = require('../models/userModel')

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        
        if(!token) return res.status(400).json({msg: "Invalid Authentication."})

        jwt.verify(token,'asadsafdgyhucgfghidghhdfyujsdf46514219567', (err, user) => {
            if(err) return res.status(400).json({msg: "Invalid Authentication."})

            req.user = user
           
          
            next()
        })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = auth
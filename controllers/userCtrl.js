require('dotenv').config()
const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendEmail = require('./sendMail')
const { OAuth2Client } = require('google-auth-library');
const salt =  bcrypt.genSalt(10);
const userCtrl = {
    register: async (req, res) => {
        try {
            const {firstname, email, password,mobilenu,gender,business,city,pincode} = req.body
            console.log(req.body)
            if(!firstname || !email || !password || !mobilenu|| !gender|| !business|| !city || !pincode  )
                return res.status(400).json({msg: "Please fill in all fields."})

            if(!validateEmail(email))
                return res.status(400).json({msg: "Invalid emails."})

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: "This email already exists."})

            if(password.length < 6)
                return res.status(400).json({msg: "Password must be at least 6 characters."})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                firstname, email, password: passwordHash,mobilenu,gender,business,city,pincode
            }

            const activation_token = createActivationToken(newUser)

            sendEmail({
                to: email,
                subject: "Password Reset Request",
                html: `
                    <h2>please click on givan link to activate you account</h2>
                    <a http://localhost:5000/user/activation?token=${activation_token}>click</a>
                    `
            });
            res.json({activation_token})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
        },
    activateEmail: async (req, res) => {
            try {
                const activation_token = req.query.token
                console.log(activation_token)
                const user = jwt.verify(activation_token, 'asadsafdgyhucgfghidghhdfyujsdf46514219567')
    
                const {firstname, email, password,mobilenu,gender,business,city,pincode} = user
    
                const check = await Users.findOne({email})
                if(check) return res.status(400).json({msg:"This email already exists."})
    
                const newUser = new Users({
                    firstname, email, password,mobilenu,gender,business,city,pincode
                })
    
                await newUser.save()
    
                res.json({msg: "Account has been activated!"})
    
            } catch (err) {
                return res.status(500).json({msg: err.message})
            }
        },
    login: async (req, res) => {
            try {
                const {email, password} = req.body
                const user = await Users.findOne({email})
                if(!user) return res.status(400).json({msg: "This email does not exist."})
    
                const isMatch = await bcrypt.compare(password, user.password)
                if(!isMatch) return res.status(400).json({msg: "Password is incorrect."})
                
                const refresh_token = createRefreshToken({id: user._id,role:user.role})
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 1*24*60*60*1000 // 7 days
                })
    
                res.json({msg: "Login success!"})
            } catch (err) {
                return res.status(500).json({msg: err.message})
            }
        },
    private:async (req, res) => {
            res.json('admin')
        }, 
    getAccessToken: (req, res) => {
            try {
                const rf_token = req.cookies.refreshtoken
                if(!rf_token) return res.status(400).json({msg: "Please login now!"})
    
                jwt.verify(rf_token, 'asadsafdgyhucgfghidghhdfyujsdf46514219567', (err, user) => {
                    if(err) return res.status(400).json({msg: "Please login now!"})
    
                    const access_token = createAccessToken({id: user.id})
                    res.json({access_token})
                })
            } catch (err) {
                return res.status(500).json({msg: err.message})
            }
        },
    logout: async (req, res) => {
            try {
                res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
                return res.json({msg: "Logged out."})
            } catch (err) {
                return res.status(500).json({msg: err.message})
            }
        },
    googleLogin: async (req, res) => {
        try {
            const client = new OAuth2Client("643571853609-i6j4po5avpdv9ilf2hbj6t1ek8q4kkdc.apps.googleusercontent.com");
            const {tokenId} = req.body

            const verify = await client.verifyIdToken({idToken: tokenId, audience: "643571853609-i6j4po5avpdv9ilf2hbj6t1ek8q4kkdc.apps.googleusercontent.com"})
            
            const {email_verified, email, } = verify.payload

            if(!email_verified) return res.status(400).json({msg: "Email verification failed."})

            const user = await Users.findOne({email})

            if(user){

                const refresh_token = createRefreshToken({id: user._id,role:user.role})
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 1*24*60*60*1000 // 7 days
                })

                res.json({msg: "Login success!"})
            }else{
                res.json({msg: "pls register"})
            }
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "This email does not exist."})

            const access_token = createAccessToken({id: user._id})
            sendEmail({
                to: email,
                subject: "Password Reset Request",
                html: `
                    <h2>please click on givan link to activate you account</h2>
                    <a href=http://localhost:5000/user/reset?token=${access_token}>click</a>
                    `
            });
            res.json({"msg":"send"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }, 
    resetPassword: async (req, res) => {
        try {
            const {password} = req.body
            console.log(password)
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: req.user.id}, {
                password: passwordHash
            })

            res.json({msg: "Password successfully changed!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }

    
}

// $2b$12$CKy6R6HCgMtNt.zEr/UD0eKXzrfJzQ/9/aRepxu.WmQoLt54VXAwG


function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const createActivationToken = (payload) => {
    return jwt.sign(payload,'asadsafdgyhucgfghidghhdfyujsdf46514219567', {expiresIn: '5m'})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload,'asadsafdgyhucgfghidghhdfyujsdf46514219567', {expiresIn: '15m'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, 'asadsafdgyhucgfghidghhdfyujsdf46514219567', {expiresIn: '7d'})
}

module.exports = userCtrl



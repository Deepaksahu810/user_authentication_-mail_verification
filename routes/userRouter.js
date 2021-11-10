const router = require('express').Router()
const userCtrl = require('../controllers/userCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')


router.post('/register', userCtrl.register)
router.get('/activation', userCtrl.activateEmail)
router.post('/login', userCtrl.login)
router.post('/refresh_token', userCtrl.getAccessToken)
router.post('/google_login', userCtrl.googleLogin)
router.post('/forgot', userCtrl.forgotPassword)
router.post('/reset',auth, userCtrl.resetPassword)
router.post('/private',auth, userCtrl.private)
router.post('/admin',authAdmin, userCtrl.private)

module.exports = router
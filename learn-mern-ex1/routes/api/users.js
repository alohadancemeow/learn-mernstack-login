const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')

// User Model
const User = require('../../models/User')

// @route   POST api/users
// @desc    Register users
// @access  Public
router.post('/', (req, res) => {
    const { name, email, password } = req.body

    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' })
    }

    // Check for existing user
    User.findOne({ email })
        .then((user) => {
            if (user) return res.status(400).json({ message: 'User already exists' })

            // Not exists || user = null
            const newUser = new User({
                name,
                email,
                password
            })

            // Create salt and hash
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err
                    newUser.password = hash
                    newUser.save()
                        .then((user) => {

                            // Create token
                            jwt.sign(
                                { id: user.id },
                                config.get('jwtSecret'),
                                { expiresIn: 3600 }, // 3600sec = 60 min.
                                (err, token) => {
                                    if (err) throw err

                                    res.json({
                                        token,
                                        user: {
                                            id: user.id,
                                            name: user.name,
                                            email: user.email
                                        }
                                    })
                                }
                            )

                        })
                })
            })
        })
})


module.exports = router
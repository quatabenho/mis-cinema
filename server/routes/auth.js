const express = require('express')
const { register, login, getMe, getAll, logout, deleteUser, getTickets, updateUser } = require('../controllers/authController')

const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', 'https://mis-cinema.vercel.app');
    next();
  });
  
router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/me', protect, getMe)
router.get('/tickets', protect, getTickets)
router.put('/user/:id', protect, updateUser)
router.get('/user', protect, authorize('admin'), getAll)
router.delete('/user/:id', protect, authorize('admin'), deleteUser)

module.exports = router

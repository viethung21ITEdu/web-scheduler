const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middlewares/authMiddleware');

// All calendar routes require authentication
router.use(authMiddleware.verifyToken);

// Calendar sync routes
router.post('/sync', calendarController.syncCalendar);
router.get('/status', calendarController.getSyncStatus);
router.get('/suggested-times', calendarController.getSuggestedFreeTimes);

module.exports = router; 
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes công khai
router.get('/', eventController.getAllEvents);
router.get('/group/:groupId', eventController.getEventsByGroupId);
router.get('/:id', eventController.getEventById);

// Routes yêu cầu xác thực
router.post('/', authMiddleware.verifyToken, authMiddleware.isGroupLeader, eventController.createEvent);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isEventGroupLeader, eventController.updateEvent);
router.put('/:id/match-rate', authMiddleware.verifyToken, authMiddleware.isEventGroupLeader, eventController.updateEventMatchRate);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isEventGroupLeader, eventController.deleteEvent);

// Routes cho đặt chỗ
router.get('/:id/bookings', authMiddleware.verifyToken, eventController.getEventBookings);
router.post('/:id/bookings', authMiddleware.verifyToken, eventController.createBooking);
router.put('/:id/bookings/:bookingId', authMiddleware.verifyToken, eventController.updateBookingStatus);

// Route cho tham gia sự kiện
router.post('/:id/participate', authMiddleware.verifyToken, eventController.participateInEvent);

module.exports = router; 
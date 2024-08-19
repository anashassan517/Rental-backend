const express = require('express');
const { getTotalIncomeByCategoryAndPaymentType, getTotalIncomeByCategory, classifyCustomers, getTotalIncome, totalOrders, activeRentals, updateQuantity,
  getAdmin, rentalsget, countUsers, getUsers, updateUser, deleteUser, verifyEmployee, getEmployees, getUserbyid } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();
const { checkDueAndOverdueItems } = require('../controllers/NotificationService')


// router.post('/register-admin', upload.single('image'), register);
// router.post('/verify-otp-admin', OtpVerification)
// router.post('/login-admin', login);
router.get('/categorize-payment', getTotalIncomeByCategoryAndPaymentType)
router.get('/get-income', getTotalIncomeByCategory)
router.get('/classify', classifyCustomers)
router.get('/get-total-income', getTotalIncome)
router.get('/get-all-rentals', rentalsget);
router.get('/total-orders', totalOrders);
router.get('/active-rentals', activeRentals);
router.post('/return-rental', updateQuantity);
// router.post('/verify-admin', verifyAdmin);
router.post('/verify-employee', verifyEmployee);
router.get('/get-admin', getAdmin);
router.get('/get-employee', getEmployees);
router.get('/users', getUsers);
router.get('/totaluser', countUsers);
router.put('/users/:id', updateUser);
router.get('/:id', getUserbyid);
router.delete('/users/:id', deleteUser);
router.get('/manual-check-due-overdue', adminAuth, (req, res) => {
  checkDueAndOverdueItems()
    .then(() => res.status(200).send('Manual check completed'))
    .catch(err => res.status(500).send('Manual check failed'));
});
module.exports = router;

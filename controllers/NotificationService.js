const Rental = require('../models/Rentals');
const nodemailer = require('nodemailer');
const moment = require('moment');
const {sendNotification} = require('../controllers/OtpEmail')
// Set up nodemailer transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'zulfiqarrakshan@gmail.com',
//         pass: 'gvun ngbh uapr evjn'
//     },
// });

// const sendNotification = (email, subject, message) => {
//     console.log("inside send function")
//     const mailOptions = {
//         from:  'zulfiqarrakshan@gmail.com',
//         to: email,
//         subject: subject,
//         text: message,
//     };
//     console.log("one step ahead")
//     transporter.sendMail(mailOptions, (error, info) => {
//         console.log('hello')
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response , subject , message);
//         }
//     });
//     console.log('hessss')
// };

const checkDueAndOverdueItems = async () => {
    try {
        console.log('Checking for due and overdue items');

        const now = moment();
        const threeDaysFromNow = moment().add(3, 'days');
        console.log(now);
        console.log(threeDaysFromNow);

        // Find rentals due within the next 3 days or overdue
        const rentals = await Rental.find({
            // $or: [
            //     { returnDate: { $lte: threeDaysFromNow, $gte: now }, status: 'rented' },
            //     { returnDate: { $lt: now}, status: 'rented' },
            // ],
        }).populate('userId');
        console.log(rentals);
        console.log(`Found ${rentals.length} rental(s) to notify`);
        rentals.forEach(rental => {
            console.log(rental)
            const daysUntilDue = moment(rental.returnDate).diff(now, 'days');
            let subject, message;

            if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                // Due within the next 3 days
                subject = `Reminder: Rental Item Due in ${daysUntilDue} Day(s)`;
                message = `Your rental item with ID ${rental.itemId} is due in ${daysUntilDue} day(s). Please return it by ${moment(rental.returnDate).format('YYYY-MM-DD')}.`;
            } else if (daysUntilDue < 0) {
                // Overdue
                const daysOverdue = -daysUntilDue;
                subject = 'Overdue Rental Item';
                message = `Your rental item with ID ${rental.itemId} is ${daysOverdue} day(s) overdue. Please return it as soon as possible.`;
            }
            console.log(`Sending notification to ${rental.userId.email} about rental ID ${rental.itemId}`);
            sendNotification(rental.userId.email, subject, message);
        });

    } catch (error) {
        console.error('Error checking due and overdue items:', error);
    }
};

module.exports = { checkDueAndOverdueItems };

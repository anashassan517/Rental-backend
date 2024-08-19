const cron = require('node-cron');
const { checkDueAndOverdueItems } = require('../controllers/NotificationService');

// Schedule the job to run daily at 9 PM
cron.schedule('0 21 * * *', () => {
  console.log('Running scheduled job to check due and overdue items');
  checkDueAndOverdueItems();
});

const InventoryItem = require('../models/InventoryItem');

// Schedule job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const items = await InventoryItem.find();
        for (const item of items) {
            await item.updateNewArrivalStatus();
        }
        console.log('Updated newArrival status for items older than 30 days');
    } catch (error) {
        console.error('Error updating newArrival status:', error);
    }
});

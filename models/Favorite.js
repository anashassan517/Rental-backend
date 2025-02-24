const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true }]
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
    
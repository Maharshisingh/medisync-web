// src/models/Inventory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const InventorySchema = new Schema({
    pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    inStock: { type: Boolean, default: true }
});

InventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', InventorySchema);
// src/models/Inventory.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IPharmacy } from './Pharmacy';
import { IMedicine } from './Medicine';

export interface IInventory extends Document {
    pharmacy: IPharmacy['_id'];
    medicine: IMedicine['_id'];
    price: number;
    quantity: number;
    inStock: boolean;
}

const InventorySchema: Schema = new Schema({
    pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    inStock: { type: Boolean, default: true }
});

// This index ensures a pharmacy cannot have two separate entries for the same medicine.
InventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });

export default mongoose.model<IInventory>('Inventory', InventorySchema);
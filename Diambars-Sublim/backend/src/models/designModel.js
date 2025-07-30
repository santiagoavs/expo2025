import mongoose from 'mongoose';

const designElementSchema = new mongoose.Schema({
  type:
   { type: String, enum: ['text', 'image'], required: true },
  content:
   { type: String, required: true },
  area: 
  { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  styles:
   mongoose.Schema.Types.Mixed
}, { _id: false });

const designSchema = new mongoose.Schema({
  product: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:
   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  elements:
   [designElementSchema],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'quoted', 'approved', 'rejected'],
    default: 'draft'
  },
  price: Number,
  adminNotes: String,
  clientNotes: String
}, { timestamps: true });

export default mongoose.model('Design', designSchema);
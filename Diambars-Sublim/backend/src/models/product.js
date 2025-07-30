import mongoose from 'mongoose';

const customizationAreaSchema = new mongoose.Schema({
  name: 
  { type: String, required: true },
  position: { 
    x:
     { type: Number, 
      required: true },
    y: 
    { type: Number, 
      required: true },
    width: 
    { type: Number, 
      required: true },
    height:
     { type: Number, 
      required: true }
  },
  accepts: {
    text: 
    { type: Boolean, 
      default: false },
    image:
     { type: Boolean, 
      default: false }
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:
   { type: String, 
    required: true },
  description:
   {String},
  baseImage: 
  { type: String, 
    required: true },
  customizationAreas: 
  [customizationAreaSchema],
  isActive: 
  { type: Boolean, 
    default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
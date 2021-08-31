import { IBike } from '../types/bike';
import { model, Schema } from 'mongoose';

const bikeSchema: Schema = new Schema({
    brand: {
      type: String,
      required: true
    },

    color: {
      type: [String],
      required: true
    },

    weight: {
      type: Number,
      required: true
    },

    location: {
      longitude: {
        type: String
      },
      latitude: {
        type: String,
      }
    },

    photo: {
      type: String,
      required: true
    },

    availableForRenting: {
      type: Boolean,
      required: true
    },
    


}, { timestamps: true });

const Bike = model<IBike>('Bike', bikeSchema,);

export default Bike;
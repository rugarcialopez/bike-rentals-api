import { IReserve } from '../types/reserve';
import { model, Schema } from 'mongoose';

const reserveSchema: Schema = new Schema({
    bikeId: {
      type: String,
      required: true
    },

    brand: {
      type: String,
      required: true
    },

    userId: {
      type: String,
      required: true
    },

    fullName: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },
    photo: {
      type: String,
      required: true
    }


}, { timestamps: true });

const Reserve = model<IReserve>('reserves', reserveSchema,);

export default Reserve;
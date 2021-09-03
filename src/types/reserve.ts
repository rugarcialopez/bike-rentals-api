import { Document } from 'mongoose';

export interface IReserve extends Document {
  bikeId: string;
  brand: string;
  photo: string;
  userId: string;
  fullName: string
  date: Date
}
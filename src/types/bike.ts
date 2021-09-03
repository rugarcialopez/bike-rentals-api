import { Document } from 'mongoose';

export interface IBike extends Document {
  brand: string;
  color: string[];
  weight: number;
  location: {
    longitude: string,
    latitude: string
  };
  photo: string;
  availableForRenting: boolean;
  rates: number[]
}
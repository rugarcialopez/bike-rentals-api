import { Response, Request } from 'express';
import Bike from '../../models/bike';
import { IBike } from '../../types/bike';

const API_URL = process.env.BIKES_API_URL || 'http://localhost:4000';

const averageRage = (rates: number[]) => {
  if (!rates || rates.length === 0) return 0;
  const reducer = (accumulator: number, currentValue: number) => accumulator + currentValue;
  const numOfRates = rates.length;
  const sum = rates.reduce(reducer);
  return Math.round(sum / numOfRates);
}

const getBikes = async (req: Request, res: Response): Promise<void> => {
  try {
    let filter = {};
    const brand = req.query.brand as string;
    const color = req.query.color as string;
    const weight = req.query.weight as string;
    const rate = req.query.rate as string;
    filter = brand  ? { ...filter, brand: brand } : filter;
    filter = color  ? {...filter, color: { $in: [color] }} : filter ;
    filter = weight  ? { ...filter, weight: weight } : filter;
    const bikes: IBike[] = await Bike.find(filter);
    const transformedBikes =  (bikes || []).map((bike: IBike) => (
      {
        id: bike._id.toString(),
        brand: bike.brand,
        colors: bike.color,
        weight: bike.weight,
        location: bike.location,
        photo: `${API_URL}/${bike.photo}`,
        availableForRenting: bike.availableForRenting,
        averageRate: averageRage(bike.rates),
        numberOfRates: bike.rates.length
      }
    ));
    if (rate) {
      const filteredBikes = transformedBikes.filter(bike => bike.averageRate === parseInt(rate));
      res.status(200).json({ bikes: filteredBikes });
      return;
    }
    res.status(200).json({ bikes: transformedBikes });
  } catch (error) {
    res.status(500).send(error);
  }
}

const addBike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brand, color, weight, longitude, latitude, availableForRenting } = req.body;
    const bike: IBike = new Bike({
      brand,
      color: color.split(','),
      weight: parseInt(weight),
      location: {
        longitude: longitude,
        latitude: latitude
      },
      photo: req?.file?.filename,
      availableForRenting: availableForRenting === 'true'
    });
    const newBike = await bike.save();
    res.status(200).json({ bike: {
      id: newBike._id.toString(),
      brand: newBike.brand,
      colors: newBike.color,
      weight: newBike.weight,
      location: newBike.location,
      photo: newBike.photo,
      availableForRenting: newBike.availableForRenting,
      averageRate: 0,
      numberOfRates: 0
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

const updateBike = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
        params: { id },
        body,
    } = req;
    const updatedBike = await Bike.findByIdAndUpdate(
      { _id: id },
      {
        brand: body.brand,
        color: body.color.split(','),
        weight: body.weight,
        location: {
          longitude: body.longitude,
          latitude: body.latitude
        },
        availableForRenting: body.availableForRenting
      },
      {new: true}
    );
    res.status(200).json({ bike: {
      id: updatedBike?._id.toString(),
      brand: updatedBike?.brand,
      colors: updatedBike?.color,
      weight: updatedBike?.weight,
      location: updatedBike?.location,
      photo: updatedBike?.photo,
      availableForRenting: updatedBike?.availableForRenting,
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

const deleteBike = async (req: Request, res: Response): Promise<void> => {
  try {
    const removedBike = await Bike.findByIdAndRemove(req.params.id);
    res.status(200).json({ bike: {
      id: removedBike?._id.toString(),
      brand: removedBike?.brand,
      colors: removedBike?.color,
      weight: removedBike?.weight,
      location: removedBike?.location,
      photo: removedBike?.photo,
      availableForRenting: removedBike?.availableForRenting
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

const addRate = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
        params: { id },
        body,
    } = req;
    const updatedBike = await Bike.findByIdAndUpdate(
      { _id: id },
      { $push: { rates: parseInt(body.rate) } },
      {new: true}
    );
    res.status(200).json({ rate: {
      bikeId: updatedBike?._id.toString(),
      averageRate: averageRage(updatedBike?.rates || []),
      numberOfRates: updatedBike?.rates.length
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}


export { getBikes, addBike, updateBike, deleteBike, addRate };
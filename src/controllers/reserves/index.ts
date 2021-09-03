import { Response, Request } from 'express';
import moment from 'moment';
import Bike from '../../models/bike';
import Reserve from '../../models/reserve';
import User, { IUser } from '../../models/user';
import { IBike } from '../../types/bike';
import { IReserve } from '../../types/reserve';

const API_URL = process.env.BIKES_API_URL || 'http://localhost:4000';

const getReserves = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = res.locals.jwtPayload.userId;
    const filter = { userId: { $eq: userId }};
    const reserves: IReserve[] = await Reserve.find(filter);
    const transformedReserves =  (reserves || []).map((reserve: IReserve) => (
      {
        id: reserve._id.toString(),
        brand: reserve.brand,
        fullName: reserve.fullName,
        userId: reserve.userId,
        bikeId: reserve.bikeId,
        date: moment(reserve.date).format('LL'),
        photo: `${API_URL}/${reserve.photo}`
      }
    ));
    res.status(200).json({ reserves: transformedReserves });
  } catch (error) {
    res.status(500).send(error);
  }
}

const createReserve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bikeId, userId, date } = req.body;

    const bike: IBike | null = await Bike.findById(bikeId);
    if (!bike) {
      res.status(400).send({ message: 'Bike does not exist'});
      return;
    }
    const user: IUser | null = await User.findById(userId);
    if (!user) {
      res.status(400).send({ message: 'User does not exist'});
      return;
    }

    const reserveDB = await Reserve.findOne({
      bikeId,
      date: new Date(date)
    });

    if (reserveDB) {
      res.status(400).send({ message: 'The bike is not available that date'});
      return;
    }

    const reserve: IReserve = new Reserve({
      bikeId,
      userId,
      brand: bike.brand,
      fullName: user.firstName + ' ' + user.lastName,
      date: new Date(date),
      photo: bike.photo
    });

    const newReserve = await reserve.save();
    res.status(200).json({ reserve: {
      id: newReserve._id.toString(),
      brand: newReserve.brand,
      bikeId: newReserve.bikeId,
      userId: newReserve.userId,
      fullName: newReserve.fullName,
      photo: `${API_URL}/${newReserve.photo}`,
      date: moment(newReserve.date).format('LL')
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

const deleteReserve = async (req: Request, res: Response): Promise<void> => {
  try {
    const removedReserve = await Reserve.findByIdAndRemove(req.params.id);
    res.status(200).json({ reserve: {
      id: removedReserve?._id.toString(),
      brand: removedReserve?.brand,
      userId: removedReserve?.userId,
      fullName: removedReserve?.fullName,
      date: moment(removedReserve?.date).format('LL'),
      photo: `${API_URL}/${removedReserve?.photo}`
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

export { createReserve, getReserves, deleteReserve };
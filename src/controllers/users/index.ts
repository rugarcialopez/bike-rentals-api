import { Response, Request } from 'express';
import User, { IUser } from '../../models/user';
import { IUserDocument } from '../../types/user';

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    //Get the user ID from previous midleware
    const userId = res.locals.jwtPayload.userId;
    const role = req.query.role as string;
    const filter = role ? { _id: { $ne: userId }, role: role} : { _id: { $ne: userId }};
    const users: IUser[] = await User.find(filter);
    const transformedUsers =  (users || []).map((user: IUser) => (
      {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    ));
    res.status(200).json({ users: transformedUsers });
  } catch (error) {
    res.status(500).send(error);
  }
}

const addUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IUserDocument, 'firstName' | 'lastName' | 'email' | 'password' | 'role'>;
    //Check if firstName, lastName, email, password and role are set
    const { firstName, lastName, email, password, role } = req.body;
    if (!(firstName && lastName && email && password && role)) {
      res.status(400).send({ message: 'fullName, email, password and role are required' });
      return;
    }

    const userDB: IUser | null = await User.findOne({email: email.toLowerCase()});
    if (userDB) {
      res.status(401).send({ message: 'User already exists'});
      return;
    }

    const user: IUser = new User({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.toLowerCase(),
      password: User.hashPassword(body.password),
      role: body.role
    });
  
    const newUser = await user.save();

    res.status(200).json({ user: {
      id: newUser._id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
        params: { id },
        body,
    } = req;
    const updatedUser = await User.findByIdAndUpdate(
      { _id: id },
      body,
      {new: true}
    );
    res.status(200).json({ user: {
      id: updatedUser?._id.toString(),
      firstName: updatedUser?.firstName,
      lastName: updatedUser?.lastName,
      email: updatedUser?.email,
      role: updatedUser?.role,
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const removedUser = await User.findByIdAndRemove(req.params.id);
    res.status(200).json({ user: {
      id: removedUser?._id.toString(),
      firstName: removedUser?.firstName,
      lastName: removedUser?.lastName,
      email: removedUser?.email,
      role: removedUser?.role,
    } });
  } catch (error) {
    res.status(500).send(error);
  }
}

export { getUsers, addUser, updateUser, deleteUser };
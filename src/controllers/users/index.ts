import { Response, Request } from 'express';
import User, { IUser } from '../../models/user';
import { IUserDocument } from '../../types/user';

const getAllUsers = async (userId: string) => {
  const users: IUser[] = await User.find({ _id: { $ne: userId }});
  const transformedUsers =  (users || []).map((user: IUser) => (
    {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    }
  ));
  return transformedUsers;
}

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
    const userId = res.locals.jwtPayload.userId;
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
  
    await user.save();

    const users = await getAllUsers(userId);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).send(error);
  }
}

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = res.locals.jwtPayload.userId;
    const {
        params: { id },
        body,
    } = req;
    await User.findByIdAndUpdate(
      { _id: id },
      body
    );
    const users = await getAllUsers(userId);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).send(error);
  }
}

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.jwtPayload.userId;
  try {
    await User.findByIdAndRemove(req.params.id);
    const users = await getAllUsers(userId);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).send(error);
  }
}

export { getUsers, addUser, updateUser, deleteUser };
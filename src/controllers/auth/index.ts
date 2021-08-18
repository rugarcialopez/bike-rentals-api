import { Response, Request } from 'express';
import * as jwt from "jsonwebtoken";
import { IUserDocument } from '../../types/user';
import User, { IUser, Role } from '../../models/user';

const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IUserDocument, 'firstName' | 'lastName' | 'email' | 'password'>;
    //Check if firstName, lastName, email and password are set
    const { firstName, lastName, email, password } = req.body;
    if (!(firstName && lastName && email && password)) {
      res.status(400).send({ message: 'firstName, lastName, email and password are required' });
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
      role: Role.User
    });
  
    const newUser: IUser = await user.save();

    const secretKey: string = process.env.JWT_SECRET || 'YOUR_SECRET_STRING';
    //Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: newUser._id.toString(), role: newUser.role },
      secretKey,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, role: newUser.role, expirationTime: 3600, userId: newUser._id.toString()  });
  } catch (error) {
    res.status(500).send(error);
  }
}

const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send({ message: 'email and password are required' });
      return;
    }
    //Get user from database
    const user: IUser | null = await User.findOne({email: email.toLowerCase()});
    if (!user) {
      res.status(401).send({ message: 'User does not exist'});
      return;
    }
    //Check if encrypted password match
    if (!user.checkIfPasswordIsValid(password)) {
      res.status(401).send({message: 'Password does not match'});
      return;
    }
    const secretKey: string = process.env.JWT_SECRET || 'YOUR_SECRET_STRING';
    //Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      secretKey,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token, role: user.role, expirationTime: 3600, userId: user._id.toString() });
  } catch (error) {
    res.status(500).send(error);
  }
}

export { signUp, signIn };
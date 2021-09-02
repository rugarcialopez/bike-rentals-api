import { Router, Response, Request } from 'express';
import { verifyAuthToken } from '../middlewares/verifyAuthToken';
import { verifyRole } from '../middlewares/verifyRole';
import { Role } from '../models/user';
import { signIn, signUp } from '../controllers/auth/index';
import { addUser, getUsers, updateUser, deleteUser } from '../controllers/users/index';
import { addBike, getBikes, updateBike, deleteBike } from '../controllers/bikes';
import uploadFile from '../middlewares/uploadFile';
import { createReserve, getReserves } from '../controllers/reserves';

const router: Router = Router();

router.get('/', (req: Request, res: Response): void => {
  res.status(200).json({ success: true});
});
router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.get('/users',[verifyAuthToken, verifyRole([Role.Manager])], getUsers);
router.post('/add-user', [verifyAuthToken, verifyRole([Role.Manager])], addUser);
router.put('/update-user/:id', [verifyAuthToken, verifyRole([Role.Manager])], updateUser);
router.delete('/delete-user/:id', [verifyAuthToken, verifyRole([Role.Manager])], deleteUser);
router.get('/bikes', [verifyAuthToken], getBikes);
router.post('/add-bike', [verifyAuthToken, verifyRole([Role.Manager]), uploadFile], addBike);
router.put('/update-bike/:id', [verifyAuthToken, verifyRole([Role.Manager])], updateBike);
router.delete('/delete-bike/:id', [verifyAuthToken, verifyRole([Role.Manager])], deleteBike);
router.get('/reserves', [verifyAuthToken], getReserves);
router.post('/reserves', [verifyAuthToken], createReserve);


export default router;
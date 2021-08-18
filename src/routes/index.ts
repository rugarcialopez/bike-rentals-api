import { Router, Response, Request } from 'express';
import { signIn, signUp } from '../controllers/auth/index';

const router: Router = Router();

router.get('/', (req: Request, res: Response): void => {
  res.status(200).json({ success: true});
});
router.post('/signUp', signUp);
router.post('/signIn', signIn);


export default router;
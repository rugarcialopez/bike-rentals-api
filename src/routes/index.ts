import { Router, Response, Request } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response): void => {
  res.status(200).json({ success: true});
});

export default router;
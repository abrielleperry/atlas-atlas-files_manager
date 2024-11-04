import express from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = express.Router();

router.use(AppController);

router.get('/status', (req, res) => {
  AppController.getStatus(req, res);
});

router.get('/stats', (req, res) => {
  AppController.getStats(res, req);
});

router.post('/users', UserController.postNew);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);

export default router;

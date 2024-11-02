import express from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';

const router = express.Router();

router.use(AppController);

router.post('/users', UserController.postNew);

export default router;

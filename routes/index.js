import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

router.use(AppController);

export default router;

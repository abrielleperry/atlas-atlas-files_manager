import express from 'express';
import AppController from '../controllers/AppController'; // Adjust the path as needed

const router = express.Router();

// Define the /status endpoint
router.get('/status', AppController.getStatus);

// Define the /stats endpoint
router.get('/stats', AppController.getStats);

export default router;
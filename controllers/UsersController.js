import express from 'express';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const router = express.Router();
const uri = ''
const client = new MongoClient(uri);

client.connect();

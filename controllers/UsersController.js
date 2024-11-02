import crypto from 'crypto';
import dbClient from '../utils/db';

class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = dbClient.db.collection('users');
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const newUser = {
      email,
      password: hashedPassword,
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({ id: result.insertedId, email });
  }

  static async getMe(req, res) {
    try {
      // get token from req headersss
      const token = req.headers['authorization'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // decode token
      const decodedToken = jwt.decode(token);
      if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      // find usr in db using decoded id
      const usersCollection = dbClient.db.collection('users');
      const user = await usersCollection.findOne({ _id: decodedToken.id });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // return only email & id
      const userData = {
        email: user.email,
        id: user._id.toString()
      };
      res.status(200).json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UserController;

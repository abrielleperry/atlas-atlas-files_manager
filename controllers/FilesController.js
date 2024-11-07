import Queue from 'bull';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    // Handle folder creation
    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      const newFile = result.ops[0];
      const response = {
        id: newFile._id,
        ...newFile,
      };
      delete response._id;
      return res.status(201).json(response);
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const localPath = path.join(folderPath, uuidv4());
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    fileDocument.localPath = localPath;

    const result = await dbClient.db.collection('files').insertOne(fileDocument);
    const newFile = result.ops[0];

    if (type === 'image') {
      fileQueue.add({ userId, fileId: newFile._id.toString() });
    }

    const response = {
      id: newFile._id,
      ...newFile,
    };
    delete response._id;
    delete response.localPath;
    return res.status(201).json(response);
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    let fileDocument;
    try {
      fileDocument = await dbClient.db.collection('files').findOne({
        _id: ObjectId(id),
        userId,
      });
    } catch (error) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!fileDocument) {
      return res.status(404).json({ error: 'Not found' });
    }

    const response = {
      id: fileDocument._id,
      userId: fileDocument.userId,
      name: fileDocument.name,
      type: fileDocument.type,
      isPublic: fileDocument.isPublic,
      parentId: fileDocument.parentId,
    };
    return res.status(200).json(response);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;

    const allFiles = await FilesController.fetchFilesRecursive(userId, parentId);

    const paginatedFiles = allFiles.slice(page * pageSize, (page + 1) * pageSize);

    const response = paginatedFiles.map((file) => ({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    }));

    return res.status(200).json(response);
  }

  static async fetchFilesRecursive(userId, parentId, result = []) {
    console.log(`Fetching files for parentId: ${parentId}`);
    const query = { userId, parentId: parentId === '0' ? 0 : ObjectId(parentId) };
    const files = await dbClient.db.collection('files').find(query).toArray();

    console.log(`Found ${files.length} files for parentId: ${parentId}`);

    for (const file of files) {
      console.log(`Processing file: ${file.name} (type: ${file.type})`);
      result.push(file);

      if (file.type === 'folder') {
        await FilesController.fetchFilesRecursive(userId, file._id, result);
      }
    }

    return result;
  }

  static async putPublish(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;

      if (!ObjectId.isValid(fileId)) return res.status(404).json({ error: 'Not found' });

      const fileDocument = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId,
      });

      if (!fileDocument) return res.status(404).json({ error: 'Not found' });

      await dbClient.db.collection('files').updateOne(
        { _id: ObjectId(fileId) },
        { $set: { isPublic: true } },
      );

      const updatedFile = { ...fileDocument, isPublic: true };
      delete updatedFile.localPath;
      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async putUnpublish(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;

      if (!ObjectId.isValid(fileId)) return res.status(404).json({ error: 'Not found' });

      const fileDocument = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId,
      });

      if (!fileDocument) return res.status(404).json({ error: 'Not found' });

      await dbClient.db.collection('files').updateOne(
        { _id: ObjectId(fileId) },
        { $set: { isPublic: false } },
      );

      const updatedFile = { ...fileDocument, isPublic: false };
      delete updatedFile.localPath;
      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getFile(req, res) {
    try {
      const fileId = req.params.id;
      const token = req.headers['x-token'];

      if (!ObjectId.isValid(fileId)) return res.status(404).json({ error: 'Not found' });

      const fileDocument = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
      if (!fileDocument) return res.status(404).json({ error: 'Not found' });

      const isAuthenticated = token ? (await redisClient.get(`auth_${token}`)) === fileDocument.userId.toString() : false;
      if (!fileDocument.isPublic && !isAuthenticated) return res.status(404).json({ error: 'Not found' });

      if (fileDocument.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      if (!fileDocument.localPath) return res.status(404).json({ error: 'Not found' });

      try {
        const fileContent = await fs.promises.readFile(fileDocument.localPath);
        const mimeType = mime.lookup(fileDocument.name) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        return res.status(200).send(fileContent);
      } catch (error) {
        console.error(error);
        return res.status(404).json({ error: 'Not found' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;

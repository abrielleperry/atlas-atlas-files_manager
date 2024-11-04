import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import db from '../utils/db';

// sets the folder path where files will be stored
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      type,
      parentId = 0,
      isPublic = false,
      data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId) {
      const parentFile = await db.getFileById(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      userId, name, type, isPublic, parentId,
    };

    if (type === 'folder') {
      const createdFile = await db.createdFile(newFile);
      return res.status(201).json(createdFile);
    }
    const filePath = path.join(FOLDER_PATH, uuidv4());
    const fileBuffer = Buffer.from(data, 'base64');

    fs.mkdirSync(FOLDER_PATH, { recursive: true });
    fs.writeFileSync(filePath, fileBuffer);

    newFile.localPath = filePath;
    const createdFile = await db.createdFile(newFile);
    return res.status(201).json(createdFile);
  }
}

module.exports = FilesController;

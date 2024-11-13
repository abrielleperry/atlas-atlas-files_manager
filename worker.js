import Queue from 'bull';
import fs from 'fs';
import path from 'path';
import imageThumbnail from 'image-thumbnail';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) return done(new Error('Missing fileId'));
  if (!userId) return done(new Error('Missing userId'));

  const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId });
  if (!file) return done(new Error('File not found'));

  const thumbnailSizes = [500, 250, 100];
  const thumbnails = {};

  try {
    console.log(`Processing fileId: ${fileId}`);
    for (const width of thumbnailSizes) {
      const thumbnail = await imageThumbnail(file.localPath, { width });
      const thumbnailPath = path.join(file.localPath, `${fileId}_${width}.png`);

      const outputDir = path.dirname(thumbnailPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(thumbnailPath, thumbnail);
      thumbnails[width] = thumbnailPath;

      console.log(`Generated thumbnail for width: ${width}`);
    }

    await dbClient.db.collection('files').updateOne(
      { _id: ObjectId(fileId) },
      { $set: { thumbnails } },
    );
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    done(error);
  }
});

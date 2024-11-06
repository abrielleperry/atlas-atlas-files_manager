import Queue from 'bull';
import dbClient from './utils/db';
import fs from 'fs';
import path from 'path';
import imageThumbnail from 'image-thumbnail';

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
      
      // Ensure the directory exists
      const outputDir = path.dirname(thumbnailPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write the thumbnail
      fs.writeFileSync(thumbnailPath, thumbnail);
      thumbnails[width] = thumbnailPath;

      console.log(`Generated thumbnail for width: ${width}`);
    }

    // Update database with thumbnails paths
    await dbClient.db.collection('files').updateOne(
      { _id: ObjectId(fileId) },
      { $set: { thumbnails } }
    );

    done();
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    done(error);
  }
});
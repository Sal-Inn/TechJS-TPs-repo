import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bookRoutes from './routes/bookRoutes';

dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/books', bookRoutes);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ MongoDB error:', msg);
  });

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

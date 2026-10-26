import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/auth.js';
import auth from './routes/auth.js';
import habits from './routes/habits.js';
import checkins from './routes/checkins.js';
import score from './routes/score.js';
import season from './routes/season.js';
import captains from './routes/captains.js';
import study from './routes/study.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));   // photos arrive as base64

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/habits', requireAuth, habits);
app.use('/api/checkins', requireAuth, checkins);
app.use('/api/score', requireAuth, score);
app.use('/api/season', requireAuth, season);
app.use('/api/captains', requireAuth, captains);
app.use('/api/study', requireAuth, study);
// ADD NEW FEATURES HERE: create src/routes/yourThing.js and mount it like the lines above.

// In production the server also serves the built React app, so one service hosts everything.
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res, next) => (req.path.startsWith('/api') ? next() : res.sendFile(path.join(dist, 'index.html'))));
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong on the server' }); });

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Peak U server on http://localhost:${port}`));

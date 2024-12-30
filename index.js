const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { Message, Config } = require('./database/db');
const authMiddleware = require('./utils/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.post('/api/messages', async (req, res) => {
  const ip = req.ip;
  const { content } = req.body;
  
  const message = new Message({ content, ip });
  await message.save();
  
  res.json({ success: true });
});

app.post('/api/admin/block/:ip', authMiddleware, async (req, res) => {
  const { ip } = req.params;
  await Message.updateMany({ ip }, { isBlocked: true });
  res.json({ success: true });
});

app.post('/api/admin/maintenance', authMiddleware, async (req, res) => {
  const { enabled } = req.body;
  await Config.findOneAndUpdate({}, { maintenance: enabled }, { upsert: true });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

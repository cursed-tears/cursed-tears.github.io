const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: { type: Date, default: Date.now },
  ip: String,
  isBlocked: { type: Boolean, default: false }
});

const configSchema = new mongoose.Schema({
  maintenance: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);
const Config = mongoose.model('Config', configSchema);

module.exports = { Message, Config };

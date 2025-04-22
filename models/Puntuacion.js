const mongoose = require('mongoose');

const puntuacionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  puntos: {
    type: Number,
    default: 0
  },
  username: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Puntuacion', puntuacionSchema);
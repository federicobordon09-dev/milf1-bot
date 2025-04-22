const Puntuacion = require('../models/Puntuacion');

class PuntuacionManager {
  constructor() {
    this.cargado = true;
  }

  static async getInstance() {
    if (!PuntuacionManager.instance) {
      PuntuacionManager.instance = new PuntuacionManager();
    }
    return PuntuacionManager.instance;
  }

  async actualizarPuntaje(userId, puntosGanados) {
    try {
      const puntuacion = await Puntuacion.findOneAndUpdate(
        { userId },
        { $inc: { puntos: puntosGanados } },
        { new: true, upsert: true }
      );
      return puntuacion.puntos;
    } catch (error) {
      console.error('Error al actualizar puntaje:', error);
      return 0;
    }
  }

  async obtenerPuntaje(userId) {
    try {
      const puntuacion = await Puntuacion.findOne({ userId });
      return puntuacion ? puntuacion.puntos : 0;
    } catch (error) {
      console.error('Error al obtener puntaje:', error);
      return 0;
    }
  }

  async obtenerRanking(limite = 10) {
    try {
      const ranking = await Puntuacion.find()
        .sort({ puntos: -1 })
        .limit(limite)
        .select('userId puntos');
      
      return ranking.map(p => [p.userId, p.puntos]);
    } catch (error) {
      console.error('Error al obtener ranking:', error);
      return [];
    }
  }
}

module.exports = PuntuacionManager.getInstance();

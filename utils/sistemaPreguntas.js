const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const preguntas = require('../data/preguntas');
const { channelId } = require('../config');

function shuffleArray(array) {
  // Creamos una copia del array para no modificar el original
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

class SistemaPreguntas {
  constructor() {
    this.preguntasUsadas = new Set();
    this.mensajeActual = null;
    this.preguntaActual = null;
  }

  obtenerPreguntaAleatoria() {
    if (this.preguntasUsadas.size === preguntas.length) {
      this.preguntasUsadas.clear();
    }

    let pregunta;
    do {
      pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
    } while (this.preguntasUsadas.has(pregunta.pregunta));

    this.preguntasUsadas.add(pregunta.pregunta);
    return pregunta;
  }

  async enviarNuevaPregunta(client, resultadoAnterior = '') {
    if (!client || !client.channels) {
      console.error('Cliente no válido');
      return;
    }

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.error('Canal no encontrado:', channelId);
        return;
      }

      const pregunta = this.obtenerPreguntaAleatoria();
      this.preguntaActual = pregunta;

      const opcionesConValores = pregunta.opciones.map(opcion => ({
        texto: opcion,
        esCorrecta: opcion === pregunta.correcta
      }));

      const opcionesMezcladas = shuffleArray(opcionesConValores);

      const embed = new EmbedBuilder()
        .setTitle(`🎯 ${pregunta.categoria}`)
        .setDescription(`${resultadoAnterior}\n\n${pregunta.pregunta}`)
        .setColor(0x00AEFF)
        .setFooter({ text: '💭 Pensá bien antes de responder...' });

      const botones = opcionesMezcladas.map(opcion =>
        new ButtonBuilder()
          .setCustomId(opcion.texto)
          .setLabel(opcion.texto)
          .setStyle(ButtonStyle.Primary)
      );

      const row = new ActionRowBuilder().addComponents(botones);

      if (this.mensajeActual && !this.mensajeActual.deleted) {
        await this.mensajeActual.edit({
          embeds: [embed],
          components: [row]
        });
      } else {
        this.mensajeActual = await channel.send({
          embeds: [embed],
          components: [row]
        });
      }
    } catch (error) {
      console.error('Error al enviar pregunta:', error);
      this.mensajeActual = null;
    }
  }

  getPreguntaActual() {
    return this.preguntaActual;
  }

  getMensajeActual() {
    return this.mensajeActual;
  }

  iniciarSistema(client) {
    this.enviarNuevaPregunta(client);
  }
}

// Crear una única instancia
const sistemaPreguntas = new SistemaPreguntas();
module.exports = sistemaPreguntas;

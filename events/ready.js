const { Events, EmbedBuilder } = require('discord.js');
const sistemaPreguntas = require('../utils/sistemaPreguntas');
const { channelId } = require('../config');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log('M.I.L.F1 está listo y funcionando!');

    try {
      const channel = await client.channels.fetch(channelId);

      // Limpiar mensajes antiguos
      const messages = await channel.messages.fetch({ limit: 10 });
      const tutorialViejo = messages.find(m => 
        m.author.id === client.user.id && 
        m.embeds[0]?.title === '📖 Tutorial - M.I.L.F1'
      );
      
      if (tutorialViejo) await tutorialViejo.delete();

      // Crear embed del tutorial
      const tutorialEmbed = new EmbedBuilder()
        .setTitle('📖 Tutorial - M.I.L.F1')
        .setColor(0x2B65EC)
        .setDescription(
          '**¡Bienvenido al juego de preguntas y respuestas!**\n\n' +
          '**🎮 ¿Cómo jugar?**\n' +
          '• Las preguntas aparecerán debajo de este mensaje\n' +
          '• Selecciona la respuesta que crees correcta\n' +
          '• Solo tienes una oportunidad por pregunta\n\n' +
          '**💫 Sistema de puntos**\n' +
          '• Respuesta correcta: +10 puntos\n' +
          '• No hay penalización por fallar\n\n' +
          '**📊 Comandos disponibles**\n' +
          '• `/tabla` - Ver el ranking de jugadores\n\n' +
          '**💡 Tips**\n' +
          '• Lee bien la pregunta antes de responder\n' +
          '• Aprende de las explicaciones después de cada respuesta\n' +
          '• ¡Compite con tus amigos por el primer puesto!'
        )
        .setFooter({ 
          text: '¡Las preguntas comenzarán a aparecer debajo de este mensaje!' 
        });

      // Enviar y anclar el tutorial
      const tutorialMsg = await channel.send({ embeds: [tutorialEmbed] });
      await tutorialMsg.pin();

      // Esperar un momento antes de iniciar el sistema de preguntas
      setTimeout(() => {
        sistemaPreguntas.iniciarSistema(client);
      }, 2000);

    } catch (error) {
      console.error('Error al configurar el tutorial:', error);
    }
  },
};

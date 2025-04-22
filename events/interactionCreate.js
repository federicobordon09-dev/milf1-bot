const { Events } = require('discord.js');
const puntuacionManagerPromise = require('../utils/puntuacionManager');
const sistemaPreguntas = require('../utils/sistemaPreguntas');

const usuariosQueRespondieronMal = new Set();
const TIEMPO_ELIMINAR = 3000; // 3 segundos
const TIEMPO_MOSTRAR_EXPLICACION = 5000; // 5 segundos para mostrar la explicación

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error al ejecutar el comando ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Hubo un error al ejecutar este comando.',
            flags: 64
          });
        }
      }
    }

    if (!interaction.isButton()) return;
    
    const preguntaActual = sistemaPreguntas.getPreguntaActual();
    if (!preguntaActual) return;

    if (usuariosQueRespondieronMal.has(interaction.user.id)) {
      const reply = await interaction.reply({
        content: '⛔ Ya intentaste responder esta pregunta.',
        flags: 64
      });
      // Eliminar mensaje después de 3 segundos
      setTimeout(() => {
        if (reply && !reply.deleted) {
          reply.delete().catch(() => {});
        }
      }, TIEMPO_ELIMINAR);
      return;
    }

    const seleccion = interaction.customId;
    const esCorrecta = seleccion === preguntaActual.correcta;

    try {
      if (esCorrecta) {
        const puntuacionManager = await puntuacionManagerPromise;
        const nuevoPuntaje = await puntuacionManager.actualizarPuntaje(interaction.user.id, 10);

        // Crear el mensaje con el resultado y la explicación
        const resultadoAnterior = `✅ ¡**${interaction.user.username}** respondió correctamente!\n💫 **+10 puntos** (Total: ${nuevoPuntaje} pts)\n\n📝 **Explicación:**\n${preguntaActual.explicacion}`;
        
        // Actualizar el mensaje actual con la explicación
        const mensajeActual = sistemaPreguntas.getMensajeActual();
        if (mensajeActual && !mensajeActual.deleted) {
          const embedActual = mensajeActual.embeds[0];
          embedActual.data.description = resultadoAnterior;
          await mensajeActual.edit({
            embeds: [embedActual],
            components: [] // Removemos los botones
          });

          // Esperar 5 segundos antes de mostrar la siguiente pregunta
          setTimeout(async () => {
            await sistemaPreguntas.enviarNuevaPregunta(interaction.client, '');
          }, TIEMPO_MOSTRAR_EXPLICACION);
        }

        // Respondemos con una interacción vacía
        await interaction.deferUpdate();

        usuariosQueRespondieronMal.clear();
      } else {
        usuariosQueRespondieronMal.add(interaction.user.id);
        const reply = await interaction.reply({
          content: '❌ Respuesta incorrecta.',
          flags: 64
        });
        setTimeout(() => {
          if (reply && !reply.deleted) {
            reply.delete().catch(() => {});
          }
        }, TIEMPO_ELIMINAR);
      }
    } catch (error) {
      console.error('Error al procesar respuesta:', error);
      await interaction.reply({
        content: '⚠️ Ocurrió un error al procesar tu respuesta.',
        flags: 64
      });
    }
  }
};

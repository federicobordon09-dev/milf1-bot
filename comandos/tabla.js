const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puntuacionManagerPromise = require('../utils/puntuacionManager');

const TIEMPO_MOSTRAR_TABLA = 5000; // 5 segundos

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tabla')
    .setDescription('📊 Muestra el ranking con los 10 usuarios con más puntos'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const puntuacionManager = await puntuacionManagerPromise;
      const ranking = await puntuacionManager.obtenerRanking(10);

      if (ranking.length === 0) {
        const reply = await interaction.editReply({
          content: '❌ Todavía no hay jugadores en el ranking.'
        });

        setTimeout(() => {
          if (reply && !reply.deleted) {
            reply.delete().catch(() => {});
          }
        }, TIEMPO_MOSTRAR_TABLA);

        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🏁 Tabla de Posiciones')
        .setColor(0x00AEFF)
        .setDescription(
          ranking.map(([userId, puntos], index) => 
            `**${index + 1}.** <@${userId}> — **${puntos} pts**`
          ).join('\n')
        )
        .setFooter({ text: 'Actualizado en tiempo real 🚀' });

      const reply = await interaction.editReply({ embeds: [embed] });

      // Auto-eliminar después de 5 segundos
      setTimeout(() => {
        if (reply && !reply.deleted) {
          reply.delete().catch(() => {});
        }
      }, TIEMPO_MOSTRAR_TABLA);

    } catch (error) {
      console.error('Error al ejecutar el comando /tabla:', error);
      
      const errorReply = await interaction.reply({
        content: '❌ Hubo un error al mostrar la tabla.',
        flags: 64
      });

      setTimeout(() => {
        if (errorReply && !errorReply.deleted) {
          errorReply.delete().catch(() => {});
        }
      }, TIEMPO_MOSTRAR_TABLA);
    }
  }
};

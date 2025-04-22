const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const path = require('path');
const { token, clientId } = require('./config');

const commandsPath = path.join(__dirname, 'comandos');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
  const command = require(`./comandos/${file}`);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[ADVERTENCIA] El comando en ${file} está incompleto o mal definido.`);
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log('🚀 Registrando comandos (globales)...');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log('✅ Comandos registrados correctamente.');
  } catch (error) {
    console.error('❌ Error al registrar los comandos:', error);
  }
})();

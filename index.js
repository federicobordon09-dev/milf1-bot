require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const conectarDB = require('./utils/database');

// Manejo de errores no controlados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no controlado:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no controlada:', error);
});

async function iniciarBot() {
    try {
        // Primero conectar a la base de datos
        await conectarDB();

        // Luego iniciar el bot
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences
            ]
        });

        // Agregar colecciones para mejor organización
        client.commands = new Collection();
        client.cooldowns = new Collection();

        // Función para cargar manejadores
        const loadHandlers = (dir) => {
            const handlersPath = path.join(__dirname, dir);
            const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

            for (const file of handlerFiles) {
                const filePath = path.join(handlersPath, file);
                const handler = require(filePath);
                
                if ('name' in handler && 'execute' in handler) {
                    if (handler.once) {
                        client.once(handler.name, (...args) => handler.execute(...args, client));
                    } else {
                        client.on(handler.name, (...args) => handler.execute(...args, client));
                    }
                }
            }
        };

        // Función para cargar comandos
        const loadCommands = () => {
            const commandsPath = path.join(__dirname, 'comandos');
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    console.log(`✅ Comando cargado: ${command.data.name}`);
                } else {
                    console.warn(`⚠️ El comando ${file} no tiene la estructura correcta`);
                }
            }
        };

        // Cargar manejadores y comandos
        loadHandlers('events');
        loadCommands();

        // Iniciar sesión
        await client.login(process.env.DISCORD_TOKEN);

        // Configurar la presencia después de iniciar sesión
        client.user.setPresence({
            activities: [{
                name: 'Preguntas y Respuestas',
                type: ActivityType.Playing
            }],
            status: 'online'
        });

        console.log('✅ Bot iniciado correctamente');
    } catch (error) {
        console.error('❌ Error al iniciar el bot:', error);
        process.exit(1);
    }
}

iniciarBot();

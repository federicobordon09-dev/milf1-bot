const mongoose = require('mongoose');
require('dotenv').config();

async function conectarDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true
            }
        });
        
        console.log('✅ Conectado a MongoDB Atlas correctamente');
        
        // Verificar la conexión con un ping
        const db = mongoose.connection;
        await db.db.command({ ping: 1 });
        console.log('🟢 MongoDB ping exitoso - Base de datos respondiendo');
        
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
}

// Eventos de conexión
mongoose.connection.on('disconnected', () => {
    console.log('🔴 Desconectado de MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🚨 Error de MongoDB:', err);
});

module.exports = conectarDB;
// migration-fix-payment-methods.js - Migración para arreglar índices de métodos de pago
import mongoose from 'mongoose';
import { config } from './src/config.js';

const runMigration = async () => {
  try {
    console.log('🚀 Iniciando migración de métodos de pago...');
    
    // Conectar a la base de datos
    await mongoose.connect(config.db.URI);
    console.log('✅ Conectado a la base de datos');
    
    const db = mongoose.connection.db;
    
    // 1. Eliminar el índice único problemático
    try {
      await db.collection('paymentmethods').dropIndex('numberHash_1');
      console.log('✅ Índice único numberHash_1 eliminado');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Índice numberHash_1 no existía');
      } else {
        console.log('⚠️ Error eliminando índice:', error.message);
      }
    }
    
    // 2. Crear nuevo índice sparse
    try {
      await db.collection('paymentmethods').createIndex(
        { numberHash: 1 }, 
        { 
          unique: true, 
          sparse: true,
          name: 'numberHash_sparse_unique'
        }
      );
      console.log('✅ Nuevo índice sparse creado');
    } catch (error) {
      console.log('⚠️ Error creando índice sparse:', error.message);
    }
    
    // 3. Crear índice para el campo type
    try {
      await db.collection('paymentmethods').createIndex(
        { type: 1 },
        { name: 'type_1' }
      );
      console.log('✅ Índice para type creado');
    } catch (error) {
      console.log('⚠️ Error creando índice type:', error.message);
    }
    
    // 4. Limpiar documentos con datos inconsistentes
    const result = await db.collection('paymentmethods').updateMany(
      { 
        type: { $in: ['cash', 'bank'] },
        numberHash: { $exists: true }
      },
      { 
        $unset: { 
          numberHash: "",
          lastFourDigits: "",
          expiry: ""
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Limpiados ${result.modifiedCount} documentos con datos inconsistentes`);
    } else {
      console.log('ℹ️ No se encontraron documentos para limpiar');
    }
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
    process.exit(0);
  }
};

// Ejecutar migración
runMigration();

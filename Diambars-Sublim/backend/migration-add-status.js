// migration-add-status.js
// Ejecuta este script UNA VEZ para actualizar las reseñas existentes

import mongoose from 'mongoose';
import Review from './src/models/reviews.js'; // Ajusta la ruta según tu estructura

const migrateReviews = async () => {
  try {
    // Conectar a MongoDB (usa tu string de conexión)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_base_de_datos');
    
    console.log('🔗 Conectado a MongoDB');

    // Buscar todas las reseñas que NO tienen el campo status
    const reviewsWithoutStatus = await Review.find({ 
      status: { $exists: false } 
    });

    console.log(`📊 Encontradas ${reviewsWithoutStatus.length} reseñas sin campo status`);

    if (reviewsWithoutStatus.length > 0) {
      // Actualizar todas las reseñas existentes para que tengan status: 'pending'
      const result = await Review.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'pending' } }
      );

      console.log(`✅ Actualizadas ${result.modifiedCount} reseñas con status: 'pending'`);
    } else {
      console.log('✅ Todas las reseñas ya tienen el campo status');
    }

    // Verificar el resultado
    const allReviews = await Review.find({}).select('comment rating status');
    console.log('📋 Estado actual de reseñas:');
    allReviews.forEach((review, index) => {
      console.log(`${index + 1}. Status: ${review.status}, Rating: ${review.rating}, Comment: ${review.comment.substring(0, 30)}...`);
    });

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar la migración
migrateReviews();
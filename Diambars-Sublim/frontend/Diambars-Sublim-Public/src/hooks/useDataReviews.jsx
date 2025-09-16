import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";

export const useDataReviews = () => {
    const { user, isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0); 
    const [comment, setComment] = useState(""); 
    const [isActive, setIsActive] = useState(true);
    const [success, setSuccess] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Base URL del backend
    const API_BASE_URL = 'https://expo2025-8bjn.onrender.com/api';

    // IMPORTANTE: Cambiar a la ruta pública para obtener solo reseñas aprobadas
    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/public`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // El backend devuelve { success: true, data: [...] }
            const reviewsData = result.success ? result.data : result;
            
            // VALIDACIÓN CRÍTICA: Asegurar que reviewsData es un array
            const validReviews = Array.isArray(reviewsData) ? reviewsData : [];
            setReviews(validReviews);
            
            console.log("Reseñas aprobadas obtenidas:", validReviews);
            return validReviews;
            
        } catch (error) {
            console.error('Error al obtener las reseñas:', error);
            setError('Error al cargar las reseñas');
            setReviews([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones del frontend
        if (!isAuthenticated || !user?.id) {
            setError('Debes iniciar sesión para dejar una reseña');
            return;
        }

        if (!rating || rating < 1 || rating > 5) {
            setError('Por favor selecciona una calificación válida (1-5 estrellas)');
            return;
        }

        if (!comment?.trim()) {
            setError('Por favor escribe un comentario');
            return;
        }

        setLoading(true);
        setError(null);

        const newReview = {
            userId: user.id,
            rating: Number(rating),
            comment: comment.trim(),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newReview),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al crear la reseña');
            }

            if (result.success) {
                // Limpiar formulario
                setComment("");
                setRating(0);
                setSuccess(true);
                
                // Mensaje personalizado sobre la aprobación
                setTimeout(() => {
                    setSuccess(false);
                    setError(null);
                }, 4000);
                
                console.log("Reseña creada exitosamente y está pendiente de aprobación");
                
                // NOTA: No refrescamos las reseñas aquí porque la nueva reseña
                // está pendiente de aprobación y no aparecerá en /public hasta ser aprobada
            }

        } catch (error) {
            console.error('Error al enviar la reseña:', error);
            setError(error.message || 'Error al enviar la reseña');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchReviews();   
    }, []);

    return {
        rating,
        setRating,
        comment,
        setComment,
        isActive,
        setIsActive,
        reviews, // Solo reseñas aprobadas
        setReviews,
        handleSubmit,
        success, 
        setSuccess,
        loading,
        error,
        setError,
        fetchReviews,
        isAuthenticated
    };
};

export default useDataReviews;
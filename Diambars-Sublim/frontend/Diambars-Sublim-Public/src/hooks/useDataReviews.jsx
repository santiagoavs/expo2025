import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../context/authContext";

export const useDataReviews  =() =>{
    const { user } = useAuth();
    const [rating, setRating] = useState(0); 
    const [comment, setComment] = useState(""); 
    const [isActive, setIsActive] = useState(true);
    const [success, setSuccess] = useState(false);
    const [reviews, setReviews] = useState([]);

    

    const fetchReviews = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/reviews', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const data = await response.json();
            setReviews(data);
            console.log("Reseñas obtenidas:", data);
            return data; // Retorna los datos obtenidos
        } catch (error) {
            console.error('Error al obtener las reseñas: ', error);
        }
        console.log("usuario actual: " + user);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newReview = {
            userId: user.id,
            rating,
            comment,
            isActive,
        };

        try {
            const response = await fetch('http://localhost:4000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newReview),
            });


            if (response.ok) {
                const updatedReviews = await fetchReviews(); // Espera a que fetchReviews termine
                console.log("Reseñas actualizadas:", updatedReviews); 
                setComment("");
                setRating(0);
            }


        } catch (error) {
            console.error('Error al enviar la reseña: ', error);
        }

    }

    useEffect(() => { 
        fetchReviews();   
    }, []);

    return{
        rating,
        setRating,
        comment,
        setComment,
        isActive,
        setIsActive,
        reviews,
        setReviews,
        handleSubmit,
        success, 
        setSuccess,
    }
}

export default useDataReviews;
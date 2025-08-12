import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../context/authContext";

export const useDataReviews  =() =>{
    const { user } = useAuth();
    const [rating, setRating] = useState(0); 
    const [comment, setComment] = useState(""); 
    const [isActive, setIsActive] = useState(true);
    const [reviews, setReviews] = useState([]);

useEffect(() => {
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
        } catch (error) {
            console.error('Error al obtener las reseñas: ', error);
        }
    };

    fetchReviews();
    }, []);

    
    const handleSubmit = async (e) => {

        const newReview = {
            userId: user.id,
            rating,
            comment,
            isActive,
        };

        try {
            const response = fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newReview),
            });
            const data = await response.json();
            console.log('Review enviada: ', data);
        } catch (error) {
            console.error('Error al enviar la reseña: ', error);
        }

    }


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
        reviews
    }
}

export default useDataReviews;
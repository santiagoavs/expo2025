import React, { createContext, useState } from 'react';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([
    {
      name: 'Ropa',
      children: [
        { name: 'Camisetas', count: 12 },
        { name: 'Sudaderas', count: 6 },
        { name: 'Camisas', count: 6 }
      ]
    },
    { name: 'Recipientes', count: 16 },
    { name: 'Accesorios', count: 5 },
    { name: 'Regalos', count: 8 }
  ]);

  const addCategory = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
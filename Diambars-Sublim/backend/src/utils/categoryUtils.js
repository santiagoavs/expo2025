import Category from "../models/category.js";

/**
 * Obtiene la ruta completa (breadcrumb) para una categoría
 * 
 * @param {String} categoryId - ID de la categoría
 * @returns {Array} - Array de objetos con _id y name de cada categoría en la ruta
 */
export const getCategoryPath = async (categoryId) => {
  const path = [];
  let currentCategory = await Category.findById(categoryId);
  
  if (!currentCategory) return path;
  
  // Agregar la categoría actual a la ruta
  path.push({ _id: currentCategory._id, name: currentCategory.name });
  
  // Recorrer hacia arriba en la jerarquía hasta llegar a una categoría raíz
  while (currentCategory.parent) {
    currentCategory = await Category.findById(currentCategory.parent);
    if (!currentCategory) break;
    
    // Agregar categoría padre al inicio (para construir el path desde la raíz)
    path.unshift({ _id: currentCategory._id, name: currentCategory.name });
  }
  
  return path;
};

/**
 * Obtiene todas las subcategorías (directas e indirectas) de una categoría
 * 
 * @param {String} categoryId - ID de la categoría
 * @returns {Array} - Array de objetos de categorías
 */
export const getAllSubcategories = async (categoryId) => {
  const allSubcategories = [];
  
  // Encontrar subcategorías directas
  const directSubcategories = await Category.find({ parent: categoryId });
  allSubcategories.push(...directSubcategories);
  
  // Buscar recursivamente subcategorías de cada subcategoría
  for (const subcat of directSubcategories) {
    const subcatChildren = await getAllSubcategories(subcat._id);
    allSubcategories.push(...subcatChildren);
  }
  
  return allSubcategories;
};

/**
 * Verifica si establecer un parent causaría un ciclo en la jerarquía
 * Por ejemplo, si intentas establecer una categoría como padre de su propio ancestro
 * 
 * @param {String} categoryId - ID de la categoría a actualizar
 * @param {String} newParentId - ID del nuevo padre
 * @returns {Boolean} - True si causaría un ciclo, false si no
 */
export const wouldCreateCycle = async (categoryId, newParentId) => {
  // Si no hay nuevo padre, no hay ciclo
  if (!newParentId || newParentId === 'null' || newParentId === 'undefined') {
    return false;
  }

  // No permitir asignarse a sí mismo como padre
  if (categoryId && categoryId.toString() === newParentId.toString()) {
    return true;
  }

  let currentParentId = newParentId;
  const visited = new Set();

  // Recorrer hacia arriba en la jerarquía
  while (currentParentId) {
    // Evitar bucles infinitos
    if (visited.has(currentParentId.toString())) {
      return true;
    }
    visited.add(currentParentId.toString());

    // Si encontramos el ID original, hay un ciclo
    if (categoryId && currentParentId.toString() === categoryId.toString()) {
      return true;
    }

    const parentCategory = await Category.findById(currentParentId);
    if (!parentCategory || !parentCategory.parent) {
      break;
    }

    currentParentId = parentCategory.parent;
  }

  return false;
};

/**
 * Construye un árbol jerárquico de categorías
 * 
 * @param {Array} categories - Lista plana de categorías
 * @param {String|null} parentId - ID de la categoría padre o null para raíz
 * @returns {Array} - Árbol jerárquico de categorías
 */
export const buildCategoryTree = (categories, parentId = null) => {
  return categories
    .filter(cat => {
      if (parentId === null) return cat.parent === null;
      return cat.parent && cat.parent.toString() === parentId.toString();
    })
    .map(cat => {
      const children = buildCategoryTree(categories, cat._id);
      return {
        ...cat.toObject ? cat.toObject() : cat,
        children: children.length > 0 ? children : undefined
      };
    });
};
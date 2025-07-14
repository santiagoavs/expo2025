# 🎨 Diambars Sublim – Expo2025

**Diambars Sublim**, implementada con Vite + React y estilo visual personalizado.

---

## 🛠 Tecnologías y librerías usadas

- **Framework & Build**
  - Vite
  - React 18
  - React Router DOM

- **Animaciones**
  - Framer Motion
  - AOS (animaciones al hacer scroll)

- **UI**
  - react-icons / FontAwesome
  - CSS tradicional (sin Tailwind, fiel al diseño)
  - Botones e íconos personalizados en PNG

- **Gestión local**
  - useState, localStorage (reseñas, métodos de pago, direcciones)

- **Assets**
  - Imágenes PNG/SVG
  - Tipografías personalizadas (Inter, AestheticMoment, HappyTime, etc.)

---

## 📁 Estructura del proyecto

frontend/
├── Diambars-Sublim-public/
│ ├── fonts/ # .ttf/.otf personalizados
│ ├── icons/ # íconos navbar y botones
│ └── images/ # assets de las distintas páginas
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── UI/ # navbar, footer, botones flotantes, etc.
│ │ ├── profile/ # UserInfo, PaymentMethods, Addresses
│ │ └── reviews/ # ReviewForm, StarRating
│ ├── pages/
│ │ ├── home/
│ │ ├── catalogue/
│ │ ├── about/
│ │ ├── contact/
│ │ ├── reviews/
│ │ └── profile/
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css


---

## 🚀 Instalación y ejecución

```bash
git clone https://github.com/santiagoavs/expo2025.git
cd frontend
npm install
npm run dev      # Inicia servidor local: http://localhost:5173
npm run build    # Genera archivos optimizados de producción
npm run preview  # Previsualiza localmente el build

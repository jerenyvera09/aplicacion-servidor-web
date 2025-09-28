# Práctica 1 - Prototipo: Plataforma Turística Manta

## 📋 Descripción

Esta práctica consiste en el desarrollo de un **prototipo web interactivo** para una plataforma turística de la ciudad de Manta. El objetivo es crear una aplicación que permita a los usuarios explorar zonas turísticas, visualizar su ubicación en un mapa interactivo y conocer restaurantes y hoteles cercanos.

## 🎯 Objetivos

- Crear un prototipo funcional de una plataforma turística
- Implementar una interfaz de usuario atractiva y responsiva
- Integrar mapas interactivos usando la librería Leaflet
- Aplicar TypeScript para manejar la lógica de la aplicación
- Demostrar el uso de HTML5, CSS3 y JavaScript moderno

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica de la página web
- **CSS3**: Estilos modernos con gradientes, sombras y diseño responsivo
- **TypeScript**: Lógica de la aplicación con tipado estático
- **Leaflet**: Librería JavaScript para mapas interactivos
- **OpenStreetMap**: Servicio de mapas de código abierto

## 📁 Estructura de Archivos

```
practica-1-prototipo/
├── dashboard.html    # Página principal con la estructura HTML
├── script.ts        # Lógica de la aplicación en TypeScript
├── styles.css       # Estilos CSS de la aplicación
└── README.md        # Este archivo
```

## ✨ Funcionalidades

### 1. Navegación Principal

- **Inicio**: Página de bienvenida a la plataforma
- **Zonas Turísticas**: Catálogo de lugares turísticos de Manta
- **Contacto**: Información de contacto de la plataforma

### 2. Zonas Turísticas Disponibles

La aplicación presenta cuatro destinos turísticos principales:

1. **Playa El Murciélago**

   - Playa céntrica con actividades náuticas
   - Coordenadas: -0.9590, -80.7210

2. **Playa Santa Marianita**

   - Ideal para kitesurf
   - Coordenadas: -0.9295, -80.5476

3. **Playa San Lorenzo**

   - Zona tranquila y natural
   - Coordenadas: -0.8770, -80.7050

4. **Ligüiqui**
   - Playa histórica con charcos naturales
   - Coordenadas: -0.8760, -80.5480

### 3. Detalles de Cada Lugar

Al seleccionar una zona turística, se muestra:

- **Nombre y descripción** del lugar
- **Mapa interactivo** con la ubicación exacta
- **Lista de restaurantes cercanos**
- **Lista de hoteles cercanos**

## 🎨 Características de Diseño

### Estilos Visuales

- **Paleta de colores**: Azules oceánicos (#0077b6, #00b4d8) con acentos amarillos (#ffd166)
- **Tarjetas interactivas**: Con efecto hover, sombras y transformaciones
- **Diseño responsivo**: Adaptable a dispositivos móviles (breakpoint: 700px)
- **Navegación sticky**: Header fijo al hacer scroll

### Interactividad

- Navegación fluida entre secciones sin recargar la página
- Tarjetas clickeables que revelan información detallada
- Mapas interactivos con marcadores y popups
- Efectos de hover para mejorar la experiencia de usuario

## 🚀 Cómo Ejecutar

1. **Compilar TypeScript** (opcional, si deseas regenerar el JavaScript):

   ```bash
   tsc script.ts
   ```

2. **Abrir en el navegador**:
   - Simplemente abre el archivo `dashboard.html` en tu navegador web preferido
   - O usa un servidor local como Live Server en VS Code

## 💡 Interfaz de Usuario

### Interfaces TypeScript

```typescript
interface Lugar {
  nombre: string;
  descripcion: string;
  lat: number;
  lon: number;
  restaurantes: string[];
  hoteles: string[];
}
```

Esta interfaz define la estructura de datos para cada lugar turístico, asegurando consistencia y tipado fuerte.

## 📱 Diseño Responsivo

La aplicación incluye media queries para dispositivos móviles:

- **Desktop**: Diseño de tarjetas horizontales con imágenes a la izquierda
- **Mobile (< 700px)**: Tarjetas verticales con imágenes centradas arriba

## 🗺️ Integración de Mapas

La aplicación utiliza **Leaflet** con tiles de **OpenStreetMap** para:

- Mostrar la ubicación exacta de cada zona turística
- Permitir zoom e interacción con el mapa
- Marcar puntos de interés con popups informativos

## 📞 Información de Contacto

- **Email**: info@turismomanta.com
- **Teléfono**: +593 5 123 4567
- **Dirección**: Av. Malecón, Manta, Ecuador

## 🔮 Mejoras Futuras

- Agregar más destinos turísticos
- Implementar sistema de reservas
- Añadir galería de fotos para cada lugar
- Integrar reseñas y calificaciones de usuarios
- Agregar filtros de búsqueda y categorías
- Incluir información sobre el clima

## 👨‍💻 Autor

Desarrollado como parte del curso de Servidores Web - Primer Parcial
Vera Mero Jereny Jhonnayker
Zambrano Gavilanes Cinthia Dayanna
Delgado Campuzano Carlos Alberto.

---

© 2025 Plataforma Turística Manta | Práctica 1 - Prototipo

interface Lugar {
  nombre: string;
  descripcion: string;
  lat: number;
  lon: number;
  restaurantes: string[];
  hoteles: string[];
}

const lugares: Lugar[] = [
  {
    nombre: "Playa El Murciélago",
    descripcion: "La playa más importante de la ciudad, céntrica y con muchas actividades náuticas, tiendas y restaurantes cerca.",
    lat: -0.9590, // aproximado
    lon: -80.7210,
    restaurantes: ["Restaurante Pata Salada", "Restaurante Martinica", "El Faro"],
    hoteles: ["Hotel Oro Verde Manta", "Hotel Wyndham Manta Sail Plaza"]
  },
  {
    nombre: "Playa Santa Marianita",
    descripcion: "Ideal para el kitesurf, hermosos atardeceres y ambiente costero relajado.",
    lat: -0.9295,
    lon: -80.5476,
    restaurantes: ["La Casa del Marisco", "Kite Surf Lounge"],
    hoteles: ["Hostería Santa Marianita"]
  },
  {
    nombre: "Playa San Lorenzo",
    descripcion: "Zona más apartada y tranquila, naturaleza, senderos y aire fresco.",
    lat: -0.8770,
    lon: -80.7050,
    restaurantes: ["Rustico San Lorenzo", "La Cevichería de San Lorenzo"],
    hoteles: ["Eco Lodge San Lorenzo"]
  },
  {
    nombre: "Ligüiqui",
    descripcion: "Playa con historia, charcos naturales, entorno rural con encanto costero.",
    lat: -0.8760,
    lon: -80.5480,
    restaurantes: ["Restaurante Ligüiqui", "Marisquería Ligüiqui"],
    hoteles: ["Lodge Ligüiqui"]
  }
];

function mostrarLugar(index: number) {
  const lugar = lugares[index];

  const detalle = document.getElementById("detalleLugar")!;
  detalle.classList.remove("oculto");

  (document.getElementById("nombreLugar") as HTMLElement).innerText = lugar.nombre;
  (document.getElementById("descripcionLugar") as HTMLElement).innerText = lugar.descripcion;

  // Inicializar mapa
  const mapaDiv = document.getElementById("mapa")!;
  mapaDiv.innerHTML = ""; // limpiar si había algo

  const map = L.map('mapa').setView([lugar.lat, lugar.lon], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  // marcador del lugar
  L.marker([lugar.lat, lugar.lon]).addTo(map)
    .bindPopup(lugar.nombre)
    .openPopup();

  // Restaurantes
  const listaRest = document.getElementById("listaRestaurantes")!;
  listaRest.innerHTML = "";
  lugar.restaurantes.forEach(r => {
    listaRest.innerHTML += `<li>${r}</li>`;
  });

  // Hoteles
  const listaHot = document.getElementById("listaHoteles")!;
  listaHot.innerHTML = "";
  lugar.hoteles.forEach(h => {
    listaHot.innerHTML += `<li>${h}</li>`;
  });
}

(window as any).mostrarLugar = mostrarLugar;

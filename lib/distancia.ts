// Calcula distancia en kilometros entre dos puntos geograficos
// usando la formula Haversine.
// https://en.wikipedia.org/wiki/Haversine_formula

const R_TIERRA_KM = 6371;

export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R_TIERRA_KM * c;
}

// Formatea la distancia para mostrar al usuario.
// Si es menor a 1 km, muestra metros. Sino muestra km con 1 decimal.
export function formatearDistancia(km: number): string {
  if (km < 1) {
    return Math.round(km * 1000) + " m";
  }
  return km.toFixed(1) + " km";
}
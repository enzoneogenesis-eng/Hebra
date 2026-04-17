// Lista de ciudades de Argentina con aliases para normalizar búsquedas
export const CIUDADES = [
  { value: "CABA",          label: "Buenos Aires (CABA)",      aliases: ["buenos aires", "caba", "bsas", "bs as", "capital", "capital federal", "ciudad de buenos aires"] },
  { value: "GBA Norte",     label: "GBA Norte",                aliases: ["gba norte", "zona norte", "tigre", "san isidro", "vicente lopez", "olivos", "pilar", "escobar"] },
  { value: "GBA Sur",       label: "GBA Sur",                  aliases: ["gba sur", "zona sur", "lanus", "avellaneda", "quilmes", "lomas de zamora", "berazategui"] },
  { value: "GBA Oeste",     label: "GBA Oeste",                aliases: ["gba oeste", "zona oeste", "moreno", "moron", "merlo", "ituzaingo", "la matanza", "ramos mejia"] },
  { value: "La Plata",      label: "La Plata",                 aliases: ["la plata", "laplata", "berisso", "ensenada"] },
  { value: "Mar del Plata", label: "Mar del Plata",            aliases: ["mar del plata", "mdp", "mardel", "mardelplata"] },
  { value: "Rosario",       label: "Rosario",                  aliases: ["rosario", "ros"] },
  { value: "Córdoba",       label: "Córdoba Capital",          aliases: ["cordoba", "córdoba", "cba", "nueva cordoba", "nueva córdoba", "cordoba capital"] },
  { value: "Mendoza",       label: "Mendoza",                  aliases: ["mendoza", "mdz", "godoy cruz", "guaymallen", "maipú"] },
  { value: "Tucumán",       label: "Tucumán",                  aliases: ["tucuman", "tucumán", "san miguel de tucuman", "smt"] },
  { value: "Salta",         label: "Salta",                    aliases: ["salta"] },
  { value: "Santa Fe",      label: "Santa Fe",                 aliases: ["santa fe", "santafe"] },
  { value: "Entre Ríos",    label: "Entre Ríos / Paraná",      aliases: ["entre rios", "entre ríos", "parana", "paraná", "concordia"] },
  { value: "Misiones",      label: "Misiones / Posadas",       aliases: ["misiones", "posadas"] },
  { value: "Corrientes",    label: "Corrientes",               aliases: ["corrientes"] },
  { value: "Chaco",         label: "Chaco / Resistencia",      aliases: ["chaco", "resistencia"] },
  { value: "San Juan",      label: "San Juan",                 aliases: ["san juan"] },
  { value: "San Luis",      label: "San Luis",                 aliases: ["san luis"] },
  { value: "Neuquén",       label: "Neuquén",                  aliases: ["neuquen", "neuquén"] },
  { value: "Bariloche",     label: "Bariloche",                aliases: ["bariloche", "san carlos de bariloche"] },
  { value: "Río Negro",     label: "Río Negro / Viedma",       aliases: ["rio negro", "río negro", "viedma"] },
  { value: "Chubut",        label: "Chubut / Comodoro",        aliases: ["chubut", "comodoro", "comodoro rivadavia", "rawson", "trelew"] },
  { value: "Tierra del Fuego", label: "Tierra del Fuego",     aliases: ["tierra del fuego", "ushuaia"] },
];

// Normaliza texto: minúsculas, sin tildes, sin espacios extra
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Dado un texto libre, devuelve el value canónico de la ciudad
export function normalizarCiudad(texto: string): string | null {
  if (!texto) return null;
  const norm = normalizar(texto);
  for (const ciudad of CIUDADES) {
    if (normalizar(ciudad.value) === norm) return ciudad.value;
    if (ciudad.aliases.some(a => norm.includes(a) || a.includes(norm))) {
      return ciudad.value;
    }
  }
  return texto; // devuelve el texto original si no matchea
}

// Para el buscador: genera todos los aliases de una ciudad
export function aliasesDeCiudad(value: string): string[] {
  const ciudad = CIUDADES.find(c => c.value === value);
  if (!ciudad) return [value.toLowerCase()];
  return [normalizar(ciudad.value), ...ciudad.aliases];
}

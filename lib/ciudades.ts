// Lista de ciudades de Argentina con aliases para normalizar busquedas
export const CIUDADES = [
  // ===== CABA por barrio =====
  { value: "Palermo",          label: "Palermo, CABA",            aliases: ["palermo", "palermo hollywood", "palermo soho", "palermo chico"] },
  { value: "Belgrano",         label: "Belgrano, CABA",           aliases: ["belgrano", "belgrano c", "belgrano r", "bajo belgrano"] },
  { value: "Recoleta",         label: "Recoleta, CABA",           aliases: ["recoleta"] },
  { value: "Caballito",        label: "Caballito, CABA",          aliases: ["caballito"] },
  { value: "Almagro",          label: "Almagro, CABA",            aliases: ["almagro"] },
  { value: "Villa Crespo",     label: "Villa Crespo, CABA",       aliases: ["villa crespo", "vcrespo"] },
  { value: "Flores",           label: "Flores, CABA",             aliases: ["flores", "parque chacabuco"] },
  { value: "Villa Urquiza",    label: "Villa Urquiza, CABA",      aliases: ["villa urquiza", "urquiza"] },
  { value: "Colegiales",       label: "Colegiales, CABA",         aliases: ["colegiales"] },
  { value: "Chacarita",        label: "Chacarita, CABA",          aliases: ["chacarita"] },
  { value: "Nunez",            label: "Nunez, CABA",              aliases: ["nunez", "nunnez"] },
  { value: "Saavedra",         label: "Saavedra, CABA",           aliases: ["saavedra"] },
  { value: "Villa Devoto",     label: "Villa Devoto, CABA",       aliases: ["villa devoto", "devoto"] },
  { value: "San Telmo",        label: "San Telmo, CABA",          aliases: ["san telmo"] },
  { value: "Barracas",         label: "Barracas, CABA",           aliases: ["barracas"] },
  { value: "Puerto Madero",    label: "Puerto Madero, CABA",      aliases: ["puerto madero", "madero"] },
  { value: "Microcentro",      label: "Microcentro, CABA",        aliases: ["microcentro", "centro", "obelisco", "san nicolas"] },
  { value: "CABA",             label: "CABA (otro barrio)",       aliases: ["caba", "buenos aires", "bsas", "bs as", "capital federal", "ciudad de buenos aires"] },

  // ===== GBA Norte por municipio =====
  { value: "Tigre",            label: "Tigre",                    aliases: ["tigre", "nordelta", "rincon de milberg"] },
  { value: "San Isidro",       label: "San Isidro",               aliases: ["san isidro", "beccar", "acassuso"] },
  { value: "Vicente Lopez",    label: "Vicente Lopez",            aliases: ["vicente lopez", "vlopez"] },
  { value: "Olivos",           label: "Olivos",                   aliases: ["olivos"] },
  { value: "Martinez",         label: "Martinez",                 aliases: ["martinez"] },
  { value: "San Fernando",     label: "San Fernando",             aliases: ["san fernando"] },
  { value: "Pilar",            label: "Pilar",                    aliases: ["pilar", "del viso", "manzanares"] },
  { value: "Escobar",          label: "Escobar",                  aliases: ["escobar", "belen de escobar", "garin", "maschwitz"] },
  { value: "Boulogne",         label: "Boulogne",                 aliases: ["boulogne"] },
  { value: "GBA Norte",        label: "GBA Norte (otro)",         aliases: ["gba norte", "zona norte"] },

  // ===== GBA Sur por municipio + barrios clave =====
  { value: "Avellaneda",       label: "Avellaneda",               aliases: ["avellaneda", "sarandi", "wilde", "dock sud"] },
  { value: "Lanus",            label: "Lanus",                    aliases: ["lanus", "lanus este", "lanus oeste"] },
  { value: "Quilmes Centro",   label: "Quilmes Centro",           aliases: ["quilmes", "quilmes centro"] },
  { value: "Quilmes Oeste",    label: "Quilmes Oeste",            aliases: ["quilmes oeste", "ezpeleta"] },
  { value: "Bernal",           label: "Bernal, Quilmes",          aliases: ["bernal", "bernal oeste", "bernal este", "bernal centro", "don bosco"] },
  { value: "Berazategui",      label: "Berazategui",              aliases: ["berazategui", "hudson", "ranelagh", "plátanos"] },
  { value: "Florencio Varela", label: "Florencio Varela",         aliases: ["florencio varela", "varela"] },
  { value: "Lomas de Zamora",  label: "Lomas de Zamora",          aliases: ["lomas de zamora", "lomas", "llavallol"] },
  { value: "Banfield",         label: "Banfield",                 aliases: ["banfield"] },
  { value: "Adrogue",          label: "Adrogue",                  aliases: ["adrogue", "adrogué"] },
  { value: "Temperley",        label: "Temperley",                aliases: ["temperley"] },
  { value: "Almirante Brown",  label: "Almirante Brown",          aliases: ["almirante brown", "burzaco", "longchamps", "glew"] },
  { value: "GBA Sur",          label: "GBA Sur (otro)",           aliases: ["gba sur", "zona sur"] },

  // ===== GBA Oeste por municipio =====
  { value: "Moron",            label: "Moron",                    aliases: ["moron", "morón", "castelar", "el palomar"] },
  { value: "Ramos Mejia",      label: "Ramos Mejia",              aliases: ["ramos mejia", "ramos"] },
  { value: "Castelar",         label: "Castelar",                 aliases: ["castelar"] },
  { value: "Haedo",            label: "Haedo",                    aliases: ["haedo"] },
  { value: "Ituzaingo",        label: "Ituzaingo",                aliases: ["ituzaingo", "ituzaingó"] },
  { value: "San Justo",        label: "San Justo",                aliases: ["san justo"] },
  { value: "La Matanza",       label: "La Matanza",               aliases: ["la matanza", "gonzalez catan", "rafael castillo", "isidro casanova"] },
  { value: "Moreno",           label: "Moreno",                   aliases: ["moreno", "paso del rey", "francisco alvarez"] },
  { value: "Merlo",            label: "Merlo",                    aliases: ["merlo", "libertad", "pontevedra"] },
  { value: "Villa Tesei",      label: "Villa Tesei, Hurlingham",  aliases: ["villa tesei", "hurlingham"] },
  { value: "GBA Oeste",        label: "GBA Oeste (otro)",         aliases: ["gba oeste", "zona oeste"] },

  // ===== La Plata y alrededor =====
  { value: "La Plata",         label: "La Plata Centro",          aliases: ["la plata", "laplata", "tolosa", "gonnet", "city bell", "los hornos"] },
  { value: "Berisso",          label: "Berisso",                  aliases: ["berisso"] },
  { value: "Ensenada",         label: "Ensenada",                 aliases: ["ensenada"] },

  // ===== Interior =====
  { value: "Mar del Plata",    label: "Mar del Plata",            aliases: ["mar del plata", "mdp", "mardel", "mardelplata"] },
  { value: "Rosario",          label: "Rosario",                  aliases: ["rosario", "ros"] },
  { value: "Cordoba",          label: "Cordoba Capital",          aliases: ["cordoba", "córdoba", "cba", "nueva cordoba", "cordoba capital"] },
  { value: "Mendoza",          label: "Mendoza",                  aliases: ["mendoza", "mdz", "godoy cruz", "guaymallen", "maipu"] },
  { value: "Tucuman",          label: "Tucuman",                  aliases: ["tucuman", "tucumán", "san miguel de tucuman", "smt"] },
  { value: "Salta",            label: "Salta",                    aliases: ["salta"] },
  { value: "Santa Fe",         label: "Santa Fe",                 aliases: ["santa fe", "santafe"] },
  { value: "Entre Rios",       label: "Entre Rios / Parana",      aliases: ["entre rios", "entre ríos", "parana", "paraná", "concordia"] },
  { value: "Misiones",         label: "Misiones / Posadas",       aliases: ["misiones", "posadas"] },
  { value: "Corrientes",       label: "Corrientes",               aliases: ["corrientes"] },
  { value: "Chaco",            label: "Chaco / Resistencia",      aliases: ["chaco", "resistencia"] },
  { value: "San Juan",         label: "San Juan",                 aliases: ["san juan"] },
  { value: "San Luis",         label: "San Luis",                 aliases: ["san luis"] },
  { value: "Neuquen",          label: "Neuquen",                  aliases: ["neuquen", "neuquén"] },
  { value: "Bariloche",        label: "Bariloche",                aliases: ["bariloche", "san carlos de bariloche"] },
  { value: "Rio Negro",        label: "Rio Negro / Viedma",       aliases: ["rio negro", "río negro", "viedma"] },
  { value: "Chubut",           label: "Chubut / Comodoro",        aliases: ["chubut", "comodoro", "comodoro rivadavia", "rawson", "trelew"] },
  { value: "Tierra del Fuego", label: "Tierra del Fuego",         aliases: ["tierra del fuego", "ushuaia"] },
];

// Normaliza texto: minusculas, sin tildes, sin espacios extra
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Dado un texto libre, devuelve el value canonico de la ciudad
export function normalizarCiudad(texto: string): string | null {
  if (!texto) return null;
  const norm = normalizar(texto);
  for (const ciudad of CIUDADES) {
    if (normalizar(ciudad.value) === norm) return ciudad.value;
    if (ciudad.aliases.some(a => norm.includes(a) || a.includes(norm))) {
      return ciudad.value;
    }
  }
  return texto;
}

// Para el buscador: genera todos los aliases de una ciudad
export function aliasesDeCiudad(value: string): string[] {
  const ciudad = CIUDADES.find(c => c.value === value);
  if (!ciudad) return [value.toLowerCase()];
  return [normalizar(ciudad.value), ...ciudad.aliases];
}
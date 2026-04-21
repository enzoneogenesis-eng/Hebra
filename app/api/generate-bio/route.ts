import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface BioRequest {
  nombre: string;
  tipo: "barbero" | "salon" | "cliente" | "dueno";
  ubicacion: string | null;
  skills: string[] | null;
  cantidadTrabajos: number;
  notas: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
    }

    const body: BioRequest = await req.json();
    const { nombre, tipo, ubicacion, skills, cantidadTrabajos, notas } = body;

    if (!nombre) {
      return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
    }

    const skillsText = skills && skills.length > 0 ? skills.join(", ") : "servicios generales";
    const ubicText   = ubicacion ? `en ${ubicacion}` : "en Argentina";
    const trabajosText = cantidadTrabajos > 0
      ? `Tiene ${cantidadTrabajos} trabajos publicados en su portfolio.`
      : "Recien esta armando su portfolio.";

    const tieneNotas = notas && notas.trim().length > 5;
    const notasBlock = tieneNotas
      ? `

DATOS QUE ESCRIBIO EL USUARIO SOBRE SI MISMO (USAR COMO FUENTE PRINCIPAL - No inventes nada que no este aca):
"""
${notas!.trim()}
"""

Tu tarea: tomar esos datos, corregir ortografia, mejorar la redaccion y transformarlos en una bio profesional. NO agregues datos que el usuario no menciono. Respeta el espiritu de lo que escribio.`
      : "";

    const prompt = (tipo === "salon" || tipo === "dueno")
      ? `Escribi una bio profesional para un salon/barberia llamado "${nombre}" ubicado ${ubicText}. Servicios que ofrece: ${skillsText}. ${trabajosText}${notasBlock}

Requisitos:
- Entre 3 y 4 parrafos. Total entre 500 y 900 caracteres (texto sustancial y profesional).
- Tono profesional pero cercano, en espanol rioplatense (voseo si es natural).
- Enfocado en atraer clientes: servicio, ambiente, experiencia.
- Sin emojis, sin hashtags, sin comillas dobles.
- No empezar con "Bienvenidos" ni clises.
- No inventes datos que no te di.

Devolve SOLO el texto de la bio, sin titulos, sin saludos, sin marcadores.`
      : `Escribi una bio profesional para un barbero llamado "${nombre}" que trabaja ${ubicText}. Sus especialidades: ${skillsText}. ${trabajosText}${notasBlock}

Requisitos:
- Entre 3 y 4 parrafos. Total entre 500 y 900 caracteres (texto sustancial y profesional).
- Tono profesional pero cercano, en espanol rioplatense (voseo si es natural).
- Primera persona (como si el barbero escribiera sobre si mismo).
- Enfocado en el oficio: tecnica, atencion al cliente, estilo.
- Sin emojis, sin hashtags, sin comillas dobles.
- No empezar con "Hola soy" ni clises.
- No inventes datos que no te di.

Devolve SOLO el texto de la bio, sin titulos, sin saludos, sin marcadores.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", errText);
      return NextResponse.json(
        { error: "Error al generar la bio. Intenta de nuevo." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const bio = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!bio) {
      return NextResponse.json({ error: "Gemini no devolvio texto" }, { status: 500 });
    }

    return NextResponse.json({ bio });
  } catch (err: any) {
    console.error("generate-bio error:", err);
    return NextResponse.json(
      { error: err.message ?? "Error interno" },
      { status: 500 }
    );
  }
}
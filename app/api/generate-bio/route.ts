import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface BioRequest {
  nombre: string;
  tipo: "barbero" | "salon" | "cliente";
  ubicacion: string | null;
  skills: string[] | null;
  cantidadTrabajos: number;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
    }

    const body: BioRequest = await req.json();
    const { nombre, tipo, ubicacion, skills, cantidadTrabajos } = body;

    if (!nombre) {
      return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
    }

    const skillsText = skills && skills.length > 0 ? skills.join(", ") : "servicios generales";
    const ubicText   = ubicacion ? `en ${ubicacion}` : "en Argentina";
    const trabajosText = cantidadTrabajos > 0
      ? `Tiene ${cantidadTrabajos} trabajos publicados en su portfolio.`
      : "Recien esta armando su portfolio.";

    const prompt = tipo === "salon"
      ? `Escribi una bio profesional para un salon/barberia llamado "${nombre}" ubicado ${ubicText}. Servicios que ofrece: ${skillsText}. ${trabajosText}

Requisitos:
- Maximo 3 parrafos cortos, total menos de 400 caracteres.
- Tono profesional pero cercano, en espanol rioplatense (uso de voseo si es natural).
- Enfocado en atraer clientes: hablar del servicio, ambiente, experiencia del local.
- Sin emojis, sin hashtags, sin comillas dobles.
- No empezar con "Bienvenidos" ni frases cliche.
- No inventes datos: si no te doy una info, no la menciones.

Devolve SOLO el texto de la bio, sin titulos, sin saludos, sin marcadores.`
      : `Escribi una bio profesional para un barbero llamado "${nombre}" que trabaja ${ubicText}. Sus especialidades son: ${skillsText}. ${trabajosText}

Requisitos:
- Maximo 3 parrafos cortos, total menos de 400 caracteres.
- Tono profesional pero cercano, en espanol rioplatense (uso de voseo si es natural).
- Primera persona ("yo", "mi trabajo"). Como si el barbero escribiera sobre si mismo.
- Enfocado en el oficio: tecnica, atencion al cliente, estilo.
- Sin emojis, sin hashtags, sin comillas dobles.
- No empezar con "Hola soy" ni frases cliche.
- No inventes datos: si no te doy una info, no la menciones.

Devolve SOLO el texto de la bio, sin titulos, sin saludos, sin marcadores.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 400,
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
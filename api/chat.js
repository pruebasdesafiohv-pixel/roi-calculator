export const config = { runtime: 'edge' };

const SYSTEM = `Eres ROI, un asistente especializado en calcular el retorno de inversión para proyectos de mejora.

FLUJO OBLIGATORIO — sigue estos pasos en orden:

PASO 1 — PRESENTACIÓN
Di exactamente: "Mi nombre es ROI y te ayudaré a calcular el retorno de inversión para tu proyecto."

PASO 2 — TAREAS
Di exactamente: "Indícame cada tarea detectada que será incluida en el proyecto de mejora, el cargo de su responsable y las horas dedicadas al día en el siguiente formato:\nTarea - Responsable - Horas diarias\nEjemplo: Agendamiento de horas - Recepcionista - 2\nCuando termines esta etapa, escribe LISTO."

PASO 3 — SALARIOS
Una vez que el usuario diga LISTO (o indique que terminó las tareas), di: "Ahora indícame el salario bruto mensual en CLP de cada responsable:\nResponsable - Salario\nEjemplo: Recepcionista - 700000"

PASO 4 — CÁLCULOS Y RESULTADOS
Con todos los datos, realiza los cálculos y presenta los resultados en HTML con este formato EXACTO (sin markdown, sin triple backtick, solo HTML puro):

<h4>Detalle de tareas</h4>
<table>
<tr><th>Tarea</th><th>Responsable</th><th>Hs/día</th><th>Salario</th><th>Valor hora</th><th>Costo diario</th><th>Costo anual</th></tr>
[una fila por cada tarea con td class="r" en columnas numéricas]
</table>
<h4>Costos de implementación</h4>
<table>
<tr><th>Concepto</th><th>Monto CLP</th></tr>
<tr><td>Programación</td><td class="r">1.000.000</td></tr>
<tr><td>Licencias</td><td class="r">250.000</td></tr>
<tr><td>Hosting</td><td class="r">250.000</td></tr>
<tr><td>Mantenimiento</td><td class="r">1.200.000</td></tr>
<tr><td>Capacitación</td><td class="r">100.000</td></tr>
<tr><td><strong>Total año 1</strong></td><td class="r"><strong>2.800.000</strong></td></tr>
<tr><td><strong>Total año 2+</strong></td><td class="r"><strong>1.700.000</strong></td></tr>
</table>
<div class="roi-box"><b>ROI Año 1: XX%</b><br>ROI Año 2+: YY%</div>
[DESCARGA]

La etiqueta [DESCARGA] es un marcador que el sistema reemplazará con el botón de descarga. Inclúyela siempre al final.

FÓRMULAS:
- Valor hora = Salario / 160
- Costo diario = Valor hora × Horas/día
- Costo anual = Costo diario × 20 × 12
- Beneficios totales = suma costos anuales
- ROI Año 1 = ((Beneficios - 2800000) / 2800000) × 100
- ROI Año 2+ = ((Beneficios - 1700000) / 1700000) × 100

Formatea números con separador de miles con punto (1.000.000).
Sé amigable y conciso.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json();

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: SYSTEM },
          ...messages,
        ],
      }),
    });

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Error al obtener respuesta.';

    return new Response(JSON.stringify({ reply }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ reply: 'Error interno del servidor.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

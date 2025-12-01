
// Initialize the OpenAI Configuration
// We use direct fetch to avoid adding heavy npm dependencies for the client

const SYSTEM_INSTRUCTION = `
Eres "KiotecaBot", un asistente virtual oficial de la UVEG (Universidad Virtual del Estado de Guanajuato).
Tu función es ayudar a los estudiantes respondiendo sus dudas académicas y administrativas en la red social "Kioteca".

Reglas:
1. Responde de manera concisa, amable y motivadora.
2. Si la pregunta es técnica (programación, matemáticas), da una explicación breve o un ejemplo.
3. Si la pregunta es administrativa (fechas, inscripciones), sugiere revisar el portal oficial UVEG.
4. Usa emojis ocasionalmente para ser amigable.
5. Mantén tus respuestas por debajo de 60 palabras para que encajen bien en un comentario de red social.
`;

export async function askKiotecaBot(question: string): Promise<string> {
  // Security check: Ensure API Key is present in environment variables
  if (!process.env.API_KEY) {
    console.warn("OpenAI API Key is missing in process.env.API_KEY");
    return "Error de configuración: No se detectó la API Key.";
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Standard fast model compatible with most keys
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();

    if (data.error) {
        console.error("OpenAI API Error:", data.error);
        throw new Error(data.error.message || "Error desconocido de OpenAI");
    }

    return data.choices?.[0]?.message?.content || "Lo siento, no pude procesar tu pregunta en este momento.";
  } catch (error) {
    console.error("Error asking OpenAI:", error);
    return "Hola, parece que tengo problemas de conexión con el servidor de IA. Por favor intenta más tarde.";
  }
}

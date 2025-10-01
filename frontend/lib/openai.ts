const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_KEY;
// ⚠️ Mets ta clé dans app.config.js ou .env pour éviter de l’exposer en dur

export async function getRevisionPlan(prompt: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano", // ou "gpt-4o", "gpt-3.5-turbo", etc.
        messages: [
          {
            role: "system",
            content: "Tu es un assistant qui aide à planifier les révisions.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.choices[0].message.content;
  } catch (err) {
    console.error("Erreur OpenAI:", err);
    throw err;
  }
}

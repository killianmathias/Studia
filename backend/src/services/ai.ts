import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export type CourseAnalysis = {
  difficulty: "facile" | "moyen" | "difficile";
  estimated_duration: number;
  chapters?: string[];
};

export async function analyzeCourseText(text: string): Promise<CourseAnalysis> {
  const maxChars = 180_000;
  const snippet = text.length > maxChars ? text.slice(0, maxChars) : text;

  const userPrompt = `
Analyse ce cours et renvoie STRICTEMENT ce JSON:
{
  "difficulty": "facile|moyen|difficile",
  "estimated_duration": <entier_minutes>,
  "chapters": ["titre chap 1", "titre chap 2", ...]
}
Texte du cours:
"""${snippet}"""
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Tu es un assistant pédagogique." },
      { role: "user", content: userPrompt },
    ],
  });

  const json = completion.choices[0]?.message?.content ?? "{}";
  const parsed: CourseAnalysis = JSON.parse(json);

  if (!["facile", "moyen", "difficile"].includes(parsed.difficulty))
    parsed.difficulty = "moyen";
  if (!parsed.estimated_duration || parsed.estimated_duration < 30)
    parsed.estimated_duration = 60;

  return parsed;
}

import { supabase } from "../lib/supabase";
import { openai } from "../lib/openai";

export type CourseAnalysis = {
  difficulty: "facile" | "moyen" | "difficile";
  estimated_duration: number; // en minutes
};

export async function analyzeAndSaveCourse(
  examId: string,
  title: string,
  syllabus: string
) {
  // 🔹 1. Appel à l'IA
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Tu es un assistant qui analyse des cours." },
      {
        role: "user",
        content: `
Analyse le cours suivant et renvoie du JSON.
Cours: ${syllabus}

Format JSON:
{
  "difficulty": "facile|moyen|difficile",
  "estimated_duration": nombre_en_minutes
}
`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const analysis: CourseAnalysis = JSON.parse(
    completion.choices[0].message.content ?? "{}"
  );

  // 🔹 2. Sauvegarde dans Supabase
  const { data: course, error } = await supabase
    .from("Course")
    .insert([
      {
        exam_id: examId,
        title,
        syllabus,
        difficulty: analysis.difficulty,
        estimated_duration: analysis.estimated_duration,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // 🔹 3. Génération des sessions
  const sessions = planSessions(course.id, analysis.estimated_duration);

  // 🔹 4. Insertion dans Supabase
  await supabase.from("Session").insert(sessions);

  return { course, sessions };
}

function planSessions(courseId: string, totalMinutes: number) {
  const today = new Date();
  const sessionDuration = 90; // minutes max par session
  const numSessions = Math.ceil(totalMinutes / sessionDuration);

  const intervals = [1, 3, 7, 14, 21]; // espacement en jours
  let sessions = [];

  for (let i = 0; i < numSessions; i++) {
    let date = new Date(today);
    date.setDate(today.getDate() + (intervals[i] ?? (i + 1) * 7));

    sessions.push({
      course_id: courseId,
      date: date.toISOString(),
      duration: Math.min(sessionDuration, totalMinutes - i * sessionDuration),
      objectif: `Révision ${i + 1}`,
    });
  }

  return sessions;
}

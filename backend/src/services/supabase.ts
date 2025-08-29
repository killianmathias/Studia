import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function insertCourse(course: {
  exam_id: string | null;
  title: string;
  syllabus: string | null;
  difficulty: string;
  estimated_duration: number;
}) {
  const { data, error } = await supabase
    .from("Course")
    .insert([course])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertEventsForSessions(
  courseId: string,
  sessions: any[]
) {
  const payload = sessions.map((s) => ({
    type: "review",
    title: s.objectif,
    date: new Date(s.date).toISOString(),
    duration: s.duration,
    related_course_id: courseId,
  }));
  const { error } = await supabase.from("Event").insert(payload);
  if (error) throw error;
}

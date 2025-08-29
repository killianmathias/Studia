import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { extractPdfText } from "../utils/pdf.js";
import { analyzeCourseText } from "../services/ai.js";
import { planSessionsDates, SessionPlan } from "../services/plan.js";
import { insertCourse, insertEventsForSessions } from "../services/supabase.js";

const upload = multer({ dest: "uploads/" });
export const courseRouter = Router();

const BodySchema = z.object({
  title: z.string().min(1),
  examId: z.string().uuid().nullable().optional(),
  examDate: z.string().datetime().optional(),
  text: z.string().optional(),
  storeAsEvents: z.boolean().optional().default(true),
});

courseRouter.post("/analyze", upload.single("pdf"), async (req, res) => {
  try {
    const raw: any = req.is("multipart/form-data") ? req.body : req.body ?? {};
    const parsed = BodySchema.parse({
      ...raw,
      storeAsEvents: raw.storeAsEvents === "true" || raw.storeAsEvents === true,
    });

    let text = parsed.text;
    if (!text && req.file) text = await extractPdfText(req.file.path);
    if (!text)
      return res.status(400).json({ error: "Aucun texte ou PDF fourni" });

    const analysis = await analyzeCourseText(text);
    const course = await insertCourse({
      exam_id: parsed.examId ?? null,
      title: parsed.title,
      syllabus: null,
      difficulty: analysis.difficulty,
      estimated_duration: analysis.estimated_duration,
    });

    let sessions: SessionPlan[] = [];
    if (parsed.examDate) {
      sessions = planSessionsDates({
        examDate: parsed.examDate,
        totalMinutes: analysis.estimated_duration,
        difficulty: analysis.difficulty,
      });
      if (parsed.storeAsEvents)
        await insertEventsForSessions(course.id, sessions);
    }

    res.json({ course, analysis, sessions });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message ?? "Server error" });
  }
});

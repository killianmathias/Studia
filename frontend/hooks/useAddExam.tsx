import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getRevisionPlan } from "../lib/openai";
import { useAlert } from "../components/CustomAlertService";
import { getUserLevel } from "../functions/functions";

export function useAddExam({ events }) {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("Collège");

  async function fetchLevel() {
    const lvl = await getUserLevel();
    setLevel(lvl);
  }

  async function addExam({
    title,
    subject,
    location,
    date,
    duration,
    contents,
    resetForm,
  }) {
    setLoading(true);

    if (!title || !subject || !location || !date || !duration) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Veuillez compléter tous les champs !",
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return;
    }

    // Insertion de l'événement
    const { data: eventData, error: eventError } = await supabase
      .from("Event")
      .insert([
        {
          type: "exam",
          title,
          subject,
          date: new Date(date).toISOString(),
          duration,
        },
      ])
      .select();

    if (eventError) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: eventError.message,
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return null;
    }

    const eventId = eventData[0].id;

    // Insertion de l’examen lié
    const { data: examData, error: examError } = await supabase
      .from("Exam")
      .insert([{ event_id: eventId, location, subject }])
      .select();

    if (examError) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: examError.message,
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return null;
    }

    const examId = examData[0].id;

    // Chapitres liés
    if (contents?.length) {
      const rows = contents.map((c) => ({
        exam_id: examId,
        name: c.title,
        contents: c.parts,
      }));
      await supabase.from("Chapters").insert(rows);
    }

    // Génération du plan
    await generatePlan(examId, date, contents, events);
    if (resetForm) {
      resetForm();
    }
    setLoading(false);
    return examId;
  }

  async function generatePlan(examId, examDate, contents, events) {
    const prompt = `
    Nous sommes aujourd'hui le ${new Date().toISOString()}.
    Voici mes événements existants: ${JSON.stringify(events, null, 2)}.
    Voici mes chapitres: ${JSON.stringify(contents, null, 2)}.
    Planifie des sessions avant mon examen le ${examDate}.
    Retourne uniquement un tableau JSON avec : {title, date, duration, content}.
    `;

    try {
      const rawPlan = await getRevisionPlan(prompt);
      const plan = JSON.parse(rawPlan);

      for (const session of plan) {
        const { data: eventData, error: e1 } = await supabase
          .from("Event")
          .insert([
            {
              type: "session",
              title: session.title,
              date: session.date,
              duration: session.duration,
            },
          ])
          .select();

        if (e1) throw e1;

        const eventId = eventData[0].id;

        await supabase.from("Session").insert([
          {
            event_id: eventId,
            exam_id: examId,
            content: session.content,
            finished: false,
            duration_done: 0,
          },
        ]);
      }

      await showAlert({
        type: "success",
        title: "Succès",
        message: "Planning généré avec succès.",
        buttons: [{ text: "OK", value: true }],
      });
    } catch (err) {
      console.error("Erreur génération plan :", err);
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Impossible de générer le plan.",
        buttons: [{ text: "OK", value: true }],
      });
    }
  }

  return { addExam, loading, level, fetchLevel };
}

async function getNumberOfSessions(userId) {
  if (!userId) return 0;

  const { data: events, error: eventsError } = await supabase
    .from("Event")
    .select("id")
    .eq("user_id", userId);

  if (eventsError) {
    console.error(eventsError);
    return;
  }

  const eventIds = events.map((e) => e.id);

  if (eventIds.length === 0) {
    return 0;
  }
  const { count, error: sessionsError } = await supabase
    .from("Session")
    .select("*", { count: "exact", head: true })
    .in("event_id", eventIds)
    .eq("finished", true);

  if (sessionsError) {
    console.error(sessionsError);
    return;
  }

  return count;
}

async function getTotalHours(userId) {
  if (!userId) return 0;

  const totalHours = { hours: 0, minutes: 0 };

  const { data: events, error: eventsError } = await supabase
    .from("Event")
    .select("id")
    .eq("user_id", userId);

  if (eventsError) {
    console.error(eventsError);
    return;
  }

  const eventIds = events.map((e) => e.id);

  if (eventIds.length === 0) {
    return totalHours;
  }
  const { data, error: sessionsError } = await supabase
    .from("Session")
    .select("duration_done", { head: true })
    .in("event_id", eventIds)
    .eq("finished", true);

  if (sessionsError) {
    console.error(sessionsError);
    return totalHours;
  }
  let sum = 0;
  for (const duration in data) {
    sum + duration.duration_done;
  }
  totalHours.minutes = sum % 60;
  totalHours.hours = (sum - (sum % 60)) / 60;
  return totalHours;
}

async function getFinishPercentage(userId) {
  if (!userId) return 0;

  const { data: events, error: eventsError } = await supabase
    .from("Event")
    .select("id")
    .eq("user_id", userId);

  if (eventsError) {
    console.error(eventsError);
    return;
  }

  const eventIds = events.map((e) => e.id);

  if (eventIds.length === 0) {
    return 100;
  }
  const { data, error: sessionsError } = await supabase
    .from("Session")
    .select("*", { head: true })
    .in("event_id", eventIds);

  if (sessionsError) {
    console.error(sessionsError);
    return 0;
  }
  let sum = 0;
  for (const session in data) {
    if (session.finished) {
      sum++;
    }
  }
  return (sum / data.length) * 100;
}

export async function getTopSubject(userId: string) {
  if (!userId) return null;

  // Récupérer les events de l'utilisateur
  const { data: events, error: eventsError } = await supabase
    .from("Event")
    .select("id, subject") // j'imagine que le champ matière s'appelle "subject"
    .eq("user_id", userId);

  if (eventsError) {
    console.error("Erreur récupération events :", eventsError.message);
    return null;
  }

  if (!events || events.length === 0) {
    return null;
  }

  // Associer chaque session terminée à sa matière
  const eventIds = events.map((e) => e.id);

  const { data: sessions, error: sessionsError } = await supabase
    .from("Session")
    .select("event_id")
    .in("event_id", eventIds)
    .eq("finished", true);

  if (sessionsError) {
    console.error("Erreur récupération sessions :", sessionsError.message);
    return null;
  }

  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Compter par matière
  const counts: Record<string, number> = {};

  for (const session of sessions) {
    const event = events.find((e) => e.id === session.event_id);
    if (event && event.subject) {
      counts[event.subject] = (counts[event.subject] || 0) + 1;
    }
  }

  // Trouver la matière avec le max
  let topSubject: string | null = null;
  let maxCount = 0;
  for (const [subject, count] of Object.entries(counts)) {
    if (count > maxCount) {
      topSubject = subject;
      maxCount = count;
    }
  }

  return topSubject;
}
export async function getUserStats(userId) {
  const nbSession = await getNumberOfSessions(userId);
  const totalHours = await getTotalHours(userId);
  const percentageFinished = await getFinishPercentage(userId);
  const favoriteSubject = await getTopSubject(userId);
  return { nbSession, totalHours, percentageFinished, favoriteSubject };
}

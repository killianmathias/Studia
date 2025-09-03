export type SupabaseEvent = {
  id: string;
  title: string;
  date: string;
  duration: number;
  user_id: string;
};

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
};

export type Section = {
  title: string;
  data: Event[];
};

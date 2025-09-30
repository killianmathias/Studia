import { Session } from "@supabase/supabase-js";

export type SupabaseEvent = {
  id: string;
  title: string;
  date: string;
  duration: number;
  user_id: string;
  type: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
};

export type Section = {
  title: string;
  data: Event[];
};

export type AppState = {
  //Authentification
  session: Session;
  user: User;
  isProfileComplete: boolean;

  //Évènements
  events: CalendarEvent[];
  loadingEvents: boolean;

  setUser: (user: AppState["user"]) => void;
};

export type User = {
  userId: Number;
  username: string;
  name: string;
  surname: string;
  date_of_birth: Date;
  profile_picture: string;
  level: string;
  xp: Number;
};

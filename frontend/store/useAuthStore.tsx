import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  profile_picture: string;
  email: string;
  surname: string;
  name: string;
  date_of_birth: Date;
  level: string;
  xp: number;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    additionalData?: Partial<Profile>
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      loading: false,
      initialized: false,

      initialize: async () => {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        const user = session?.user ?? null;

        if (user) {
          await get().fetchProfile(user.id);
        }

        // écoute les changements de session
        supabase.auth.onAuthStateChange((_event, session) => {
          const user = session?.user ?? null;
          set({ session, user });
          if (user) get().fetchProfile(user.id);
          else set({ profile: null });
        });

        set({ session, user, initialized: true });
      },

      login: async (email, password) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error("Erreur login:", error.message);
        } else if (data.user) {
          await get().fetchProfile(data.user.id);
        }
        set({
          session: data.session ?? null,
          user: data.user ?? null,
          loading: false,
        });
        console.log("Login complété");
      },

      signup: async (email, password, additionalData = {}) => {
        set({ loading: true });

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: additionalData.username,
              name: additionalData.name,
              surname: additionalData.surname,
              avatar_url: additionalData.profile_picture,
            },
          },
        });

        if (error) {
          console.error("Erreur signup:", error.message);
          set({ loading: false });
          return;
        }

        const user = data.user;
        if (!user) {
          set({ loading: false });
          return;
        }

        // Le trigger a déjà créé le profil, on le récupère simplement
        await get().fetchProfile(user.id);

        set({
          session: data.session ?? null,
          user,
          loading: false,
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
      },

      fetchProfile: async (userId: string) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Erreur récupération profil:", error.message);
        } else {
          set({ profile: data });
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { user, profile } = get();
        if (!user || !profile) {
          console.error(
            "Aucun utilisateur connecté pour la mise à jour du profil."
          );
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Erreur update profil:", error.message);
        } else {
          set({ profile: data });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

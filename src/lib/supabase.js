import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const authHelpers = {
  // Sign in teacher
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      return { session: null, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },
};

// Database helpers
export const dbHelpers = {
  // Classes
  getClasses: async (teacherId) => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Exercises
  getExercises: async (teacherId) => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*, classes(name)")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get public exercise (for preview/student access)
  getPublicExercise: async (exerciseId) => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select(
          `
          id,
          title,
          description,
          type,
          content,
          is_active,
          classes (name)
        `
        )
        .eq("id", exerciseId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
};

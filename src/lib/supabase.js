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
        .select(`
          *,
          exercise_classes (
            classes (
              id,
              name
            )
          )
        `)
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to include classes array
      const transformedData = data?.map(exercise => ({
        ...exercise,
        classes: exercise.exercise_classes?.map(ec => ec.classes).filter(Boolean) || []
      })) || [];

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get public exercise (for preview/student access)
  getPublicExercise: async (exerciseId) => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select(`
          id,
          title,
          description,
          type,
          content,
          is_active,
          exercise_classes (
            classes (
              id,
              name
            )
          )
        `)
        .eq("id", exerciseId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      // Transform data to include classes array
      const transformedData = {
        ...data,
        classes: data.exercise_classes?.map(ec => ec.classes).filter(Boolean) || []
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Exercise-Class relationship management
  updateExerciseClasses: async (exerciseId, classIds) => {
    try {
      // First, remove existing associations
      const { error: deleteError } = await supabase
        .from("exercise_classes")
        .delete()
        .eq("exercise_id", exerciseId);

      if (deleteError) throw deleteError;

      // Then, add new associations
      if (classIds && classIds.length > 0) {
        const associations = classIds.map(classId => ({
          exercise_id: exerciseId,
          class_id: classId
        }));

        const { error: insertError } = await supabase
          .from("exercise_classes")
          .insert(associations);

        if (insertError) throw insertError;
      }

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get exercise with classes for editing
  getExerciseWithClasses: async (exerciseId, teacherId) => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select(`
          *,
          exercise_classes (
            classes (
              id,
              name
            )
          )
        `)
        .eq("id", exerciseId)
        .eq("teacher_id", teacherId)
        .single();

      if (error) throw error;
      
      // Transform data to include classes array
      const transformedData = {
        ...data,
        classes: data.exercise_classes?.map(ec => ec.classes).filter(Boolean) || []
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
};

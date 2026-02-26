import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export const emailLog = async ({ type, message, title, error }) => {
  const supabase = createBrowserSupabaseClient();
  await supabase
    .from("mail_logs")
    .insert({
      type,
      message,
      title,
      error_log: error.message ?? JSON.stringify(error),
    });
};

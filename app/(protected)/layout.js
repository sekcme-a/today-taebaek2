import Header from "@/components/Header/Header";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const supabase = await createServerSupabaseClient();

  // getSession 대신 getUser 사용 (서버측 보안 및 정확성 강화)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}

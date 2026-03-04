import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginLayout({ children }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 로그인된 상태라면 메인으로 보냄
  if (user) {
    redirect("/");
  }

  return (
    <>
      {/* <Header hasH1 /> */}
      {children}
    </>
  );
}

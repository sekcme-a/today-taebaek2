import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function ResetPasswordSection({ email }) {
  const supabase = createBrowserSupabaseClient();
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    setLoading(true);

    try {
      // Supabase의 `resetPasswordForEmail` 함수 사용
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://www.xn--2n1b19ndwjhoj6sb.com/auth/update-password",
      });

      if (error) {
        throw error;
      }

      alert(
        "비밀번호 재설정 이메일이 발송되었습니다. 받은 편지함을 확인해주세요.",
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2">
      <div className="flex justify-between items-start">
        <span className="font-medium w-1/4">비밀번호</span>

        <div className="w-3/4 flex flex-col space-y-2">
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="px-3 py-1 text-sm w-fit bg-gray-600 text-white hover:bg-gray-700 rounded cursor-pointer "
          >
            {loading ? "이메일 발송 중..." : "비밀번호 재설정"}
          </button>
        </div>
      </div>
    </div>
  );
}

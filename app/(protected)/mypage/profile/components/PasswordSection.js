// app/mypage/components/PasswordSection.js
"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function PasswordSection({
  email,
  hasPasswordSet,
  emailVerified,
}) {
  const supabase = createBrowserSupabaseClient();

  const handlePasswordReset = async () => {
    if (!email) {
      alert("사용자 이메일 정보를 찾을 수 없습니다.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      alert(`비밀번호 재설정 요청 실패: ${error.message}`);
    } else {
      alert(
        `${email}로 비밀번호 재설정 메일을 발송했습니다. 이메일을 확인해주세요.`,
      );
    }
  };

  return (
    <div className="py-2">
      <div className="flex justify-between items-start">
        <span className="font-medium w-1/4">비밀번호</span>

        <div className="w-3/4 flex flex-col space-y-2">
          {/* 1. 소셜 로그인 사용자 안내 문구 (1-2) */}
          {!emailVerified && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400 ">
                계정 안전을 위해 비밀번호를 설정해보세요. 비밀번호 설정 후에는
                이메일과 비밀번호로 로그인하실 수 있습니다.
              </p>
              <button
                onClick={handlePasswordReset}
                className="mt-2 px-3 py-1 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded cursor-pointer "
              >
                설정
              </button>
            </div>
          )}

          {/* 현재 상태 표시 */}
          {emailVerified && (
            <div className="flex justify-between items-center">
              <span className="text-gray-200">
                비밀번호가 설정되어 있습니다.
              </span>

              {/* '변경' 버튼 */}
              <button
                onClick={handlePasswordReset}
                className="mt-2 px-3 py-1 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded cursor-pointer "
              >
                변경
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

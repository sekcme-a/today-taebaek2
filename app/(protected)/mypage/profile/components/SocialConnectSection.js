// app/mypage/components/SocialConnectSection.js
"use client";

// Supabase의 소셜 프로바이더 이름을 보기 좋은 이름으로 변환
const providerMap = {
  github: "GitHub",
  google: "Google",
  kakao: "Kakao",
  // 필요한 다른 소셜 제공자 추가
};

export default function SocialConnectSection({
  socialProviders,
  totalLoginMethods,
}) {
  const handleDisconnect = (providerName) => {
    // 1가지 방식의 로그인만 있을 경우 (2-1)
    if (totalLoginMethods <= 1) {
      alert(
        "최소 1개의 계정은 연결되어야 해제가 가능합니다. 비밀번호를 설정하거나 다른 소셜 로그인 계정을 연결해주세요.",
      );
      return;
    }

    // --- 중요: Supabase의 현재 인증 시스템 제약 사항 ---
    // Supabase Auth는 클라이언트에서 특정 소셜 계정 연결을 해제하는
    // 공식적인 API를 제공하지 않습니다.

    // 실제 해제를 위해서는 Edge Function이나 관리자 권한을 가진 서버 API Route를
    // 사용해야 합니다. 아래는 알림 출력만 처리하는 코드입니다.

    // console.log(`[TODO] ${providerName} 연결 해제 로직 실행 (서버 필요)`);
    alert(
      `${providerMap[providerName]} 연결 해제 요청이 처리되었습니다. (실제 해제는 서버 로직 필요)`,
    );
  };

  return (
    <div className="space-y-4">
      {socialProviders.length > 0 ? (
        socialProviders.map((provider) => (
          <div
            key={provider}
            className="flex justify-between items-center py-3 border-b border-gray-600"
          >
            <span className="font-medium">
              {providerMap[provider] || provider} (연결됨)
            </span>
            {/* <button
              onClick={() => handleDisconnect(provider)}
              className="px-3 py-1 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded hover:bg-red-600 cursor-pointer"
            >
              해제
            </button> */}
          </div>
        ))
      ) : (
        <p className="text-gray-500">
          연결된 소셜 로그인 계정이 없습니다. 다른 계정을 연결하여 보안을 강화할
          수 있습니다.
        </p>
      )}

      {/* <p className="text-sm text-gray-500 mt-4">
        * 비밀번호가 설정되지 않은 경우, 소셜 로그인 계정이 최소 1개 있어야
        합니다.
      </p> */}
    </div>
  );
}

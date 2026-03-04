// app/mypage/MyPageClient.js
"use client";

import { useState } from "react";
import NicknameSection from "./components/NicknameSection";
import PasswordSection from "./components/PasswordSection";
import SocialConnectSection from "./components/SocialConnectSection";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function MyPageClient({ initialUserData }) {
  const [userData, setUserData] = useState(initialUserData);

  // 이메일/비밀번호로 가입했는지 확인 ('email' provider가 있는지)
  const hasEmailProvider = userData.providers.includes("email");

  // 소셜 로그인 제공자 목록 (이메일 제외)
  const socialProviders = userData.providers.filter((p) => p !== "email");
  const totalLoginMethods = userData.providers.length;

  // 닉네임이 성공적으로 변경되었을 때 상태를 업데이트하는 함수
  const handleNicknameUpdate = (newNickname) => {
    setUserData((prev) => ({
      ...prev,
      nickname: newNickname,
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. 가입 정보 (이메일, 닉네임, 비밀번호) */}
      <section className="rounded-lg shadow-sm mt-10">
        <h2 className="text-xl font-semibold mb-4">가입 정보</h2>

        {/* 이메일 (변경 불가) */}
        <div className="flex justify-between items-center py-3 border-b border-gray-600">
          <span className="font-medium w-1/4">이메일</span>
          <span className="w-3/4 ">{userData.email}</span>
        </div>
        {/* 닉네임 섹션 (1-1) */}
        <NicknameSection
          currentNickname={userData.nickname}
          onUpdate={handleNicknameUpdate}
        />

        {/* 비밀번호 섹션 (1-2) */}
        {/* <PasswordSection
          email={userData.email}
          hasPasswordSet={hasEmailProvider}
          emailVerified={userData.emailVerified}
        /> */}
      </section>

      {/* 2. 소셜 로그인 관리 (연결 계정) */}
      <section className="">
        <h2 className="text-xl font-semibold mb-4">소셜 로그인 관리</h2>
        <SocialConnectSection
          socialProviders={socialProviders}
          totalLoginMethods={totalLoginMethods}
        />
      </section>

      <p
        className="text-sm text-gray-400 text-right underline cursor-pointer"
        onClick={async () => {
          const supabase = createBrowserSupabaseClient();
          await supabase.auth.signOut();
          window.location.href = "/auth/login";
        }}
      >
        로그아웃
      </p>
    </div>
  );
}

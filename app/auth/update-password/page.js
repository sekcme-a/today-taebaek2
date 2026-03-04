// src/pages/update-password.js (onAuthStateChange 적용)
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validatePassword } from "../utils/validation";
import Container from "../login/components/Container"; // 경로는 프로젝트 구조에 맞게 조정 필요
import PasswordField from "../login/components/PasswordField"; // 경로는 프로젝트 구조에 맞게 조정 필요
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// ... [이전과 동일한 스타일 정의] ...
const buttonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#007aff",
  color: "#ffffff",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
  marginBottom: "15px",
  transition: "background-color 0.3s",
};
const errorStyle = {
  color: "#ff3b30",
  textAlign: "center",
  marginBottom: "15px",
};
const successStyle = {
  color: "#34c759",
  textAlign: "center",
  marginBottom: "15px",
};

const UpdatePasswordPage = () => {
  const supabase = createBrowserSupabaseClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // 'PASSWORD_RECOVERY' 이벤트를 통해 상태가 설정되었는지 확인하는 플래그
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChange 리스너 설정
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth Event:", event, session); // 디버깅용

        if (event === "PASSWORD_RECOVERY") {
          // 비밀번호 재설정 이메일 링크를 통해 접근했음을 확인
          setIsRecoverySession(true);
          setMessage("새로운 비밀번호를 입력해 주세요.");
        } else if (event === "SIGNED_IN" && session) {
          // 이메일 링크를 통해 접속하면 PASSWORD_RECOVERY 이벤트 후 SIGNED_IN 이벤트가 따라올 수 있습니다.
          // 이 경우에도 재설정 양식을 표시합니다.
          setIsRecoverySession(true);
          setMessage("새로운 비밀번호를 입력해 주세요.");
        } else if (event === "SIGNED_OUT") {
          // 세션이 만료되거나 로그아웃된 경우
          setIsRecoverySession(false);
          setMessage(
            "세션이 만료되었거나 유효하지 않습니다. 다시 시도해 주세요.",
          );
        }
      },
    );

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("오류: 비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setMessage(
        "오류: 비밀번호는 6자리 이상, 숫자와 기호가 포함되어야 합니다.",
      );
      setLoading(false);
      return;
    }

    try {
      // **핵심**: 유효한 세션(PASSWORD_RECOVERY 또는 SIGNED_IN)이 확보된 상태에서 updateUser() 호출
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setMessage(
        "비밀번호가 성공적으로 재설정되었습니다! 2초 후 홈 화면으로 이동합니다.",
      );
      // 비밀번호 업데이트 후 세션이 변경되므로 onAuthStateChange가 SIGNED_IN 이벤트를 발생시킬 수 있습니다.
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      setMessage(`비밀번호 업데이트 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // // onAuthStateChange가 상태를 감지할 때까지 로딩 상태 표시
  // if (!isRecoverySession && message === "") {
  //   return (
  //     <Container title="인증 확인 중">
  //       <p style={{ textAlign: "center", color: "#ccc" }}>
  //         재설정 세션 유효성을 확인하는 중입니다...
  //       </p>
  //     </Container>
  //   );
  // }

  // 메시지 상태에 따라 양식 또는 오류 메시지 표시
  return (
    <Container title="비밀번호 재설정">
      {false ? (
        // 세션이 유효하지 않은 경우
        <>
          <p style={errorStyle}>{message}</p>
          <button
            onClick={() => router.push("/forgot-password")}
            style={{ ...buttonStyle, backgroundColor: "#ff9500" }}
          >
            비밀번호 재설정 다시 요청
          </button>
        </>
      ) : (
        // 세션이 유효한 경우 (isRecoverySession === true)
        <form onSubmit={handlePasswordUpdate}>
          <p
            style={{ color: "#ccc", marginBottom: "20px", textAlign: "center" }}
          >
            {message}
          </p>

          <PasswordField
            label="새 비밀번호 (6자 이상, 숫자, 기호 포함)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordField
            label="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {message && (
            <p style={message.includes("성공") ? successStyle : errorStyle}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      )}
    </Container>
  );
};

export default UpdatePasswordPage;

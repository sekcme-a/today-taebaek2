"use client";

// src/pages/forgot-password.js
import React, { useState } from "react";
import Container from "../login/components/Container";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

// 공통 스타일
const buttonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#ff9500", // Apple Orange (Warning/Action color)
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
  marginBottom: "15px",
  transition: "background-color 0.3s",
};
const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "1px solid #444",
  backgroundColor: "#333",
  color: "#fff",
  fontSize: "16px",
  boxSizing: "border-box",
  marginBottom: "20px",
};
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  color: "#ccc",
};

const ForgotPasswordPage = () => {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Supabase의 `resetPasswordForEmail` 함수 사용
      const { error } = await supabase.auth.resetPasswordForEmail({
        email,
        options: {
          redirectTo:
            "https://www.xn--2n1b19ndwjhoj6sb.com/auth/update-password",
        },
      });

      if (error) {
        throw error;
      }

      setMessage(
        "비밀번호 재설정 이메일이 발송되었습니다. 받은 편지함을 확인해주세요.",
      );
      setEmail("");
    } catch (error) {
      setMessage(`오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container title="비밀번호 찾기">
      <form onSubmit={handlePasswordReset}>
        <p style={{ color: "#ccc", marginBottom: "20px", textAlign: "center" }}>
          비밀번호 재설정 링크를 받을 이메일 주소를 입력해주세요.
        </p>
        <div>
          <label style={labelStyle}>이메일</label>
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {message && (
          <p
            style={{
              color: message.includes("발송") ? "#34c759" : "#ff3b30",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "이메일 발송 중..." : "비밀번호 재설정 이메일 받기"}
        </button>
      </form>
      <div style={{ textAlign: "center", fontSize: "14px" }}>
        <Link
          href="/auth/login"
          style={{ color: "#007aff", textDecoration: "none" }}
        >
          로그인 페이지로
        </Link>
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;

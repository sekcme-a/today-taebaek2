"use client";

// src/pages/signup.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import { validatePassword } from "../utils/validation";
import Container from "../login/components/Container";
import PasswordField from "../login/components/PasswordField";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

// 공통 스타일 (로그인 페이지와 동일)
const buttonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#34c759", // Apple Green
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

const SignUpPage = () => {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setMessage("오류: 비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    // 2. 비밀번호 유효성 검사 (6자리 이상, 숫자, 기호 포함)
    if (!validatePassword(password)) {
      setMessage(
        "오류: 비밀번호는 6자리 이상, 숫자와 기호가 포함되어야 합니다.",
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `https://www.xn--2n1b19ndwjhoj6sb.com/auth/email-confirmed`, // 가입 후 리디렉션될 페이지 (선택 사항)
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setMessage("회원가입 성공! 이메일을 확인하여 인증을 완료해주세요.");
      } else {
        // 이메일 인증이 필요한 경우 (Supabase 기본 설정)
        setMessage(
          "인증 이메일이 발송되었습니다. 이메일을 확인하여 인증을 완료해주세요.",
        );
      }
    } catch (error) {
      setMessage(`회원가입 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container title="회원가입">
      <form onSubmit={handleSignUp}>
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

        <PasswordField
          label="비밀번호 (6자 이상, 숫자, 기호 포함)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordField
          label="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {message && (
          <p
            style={{
              color:
                message.includes("성공") || message.includes("발송")
                  ? "#34c759"
                  : "#ff3b30",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "가입 중..." : "회원가입"}
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

export default SignUpPage;

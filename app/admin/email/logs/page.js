"use client";

import React, { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function Logs() {
  const supabase = createBrowserSupabaseClient();

  // 상태 관리
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 데이터 페칭
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("mail_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLogs(data);
        // 데스크탑 환경에서 첫 번째 로그 자동 선택
        if (data.length > 0) setSelectedLog(data[0]);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [supabase]);

  // 로그 선택 핸들러
  const handleSelect = (log) => {
    setSelectedLog(log);
    setIsDetailOpen(true); // 모바일에서 상세 화면 활성화
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-[13px]">
      {/* 1. 로그 목차 (Sidebar) */}
      <aside
        className={`
        ${isDetailOpen ? "hidden md:flex" : "flex"} 
        w-full md:w-[320px] lg:w-[380px] flex-col bg-white border-r border-gray-200
      `}
      >
        <div className="p-4 border-b bg-white flex justify-between items-center shrink-0">
          <h2 className="font-bold text-gray-800 text-base">Mail Logs</h2>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[11px] text-gray-500 font-medium">
            {logs.length} Total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              로그가 없습니다.
            </div>
          ) : (
            logs.map((log) => (
              <button
                key={log.id}
                onClick={() => handleSelect(log)}
                className={`w-full text-left p-3.5 transition-all outline-none ${
                  selectedLog?.id === log.id
                    ? "bg-blue-50 border-l-[3px] border-l-blue-600"
                    : "hover:bg-gray-50 border-l-[3px] border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      log.type === "error"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {log.type || "info"}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(log.created_at).toLocaleDateString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800 truncate mb-0.5">
                  {log.title || "No Subject"}
                </h4>
                <p className="text-gray-500 truncate text-[12px]">
                  {log.message}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* 2. 로그 본문 (Main Detail) */}
      <main
        className={`
        ${isDetailOpen ? "flex" : "hidden md:flex"} 
        flex-1 flex-col bg-white relative
      `}
      >
        {selectedLog ? (
          <>
            {/* 상단 툴바 (모바일용 뒤로가기 포함) */}
            <div className="h-[57px] border-b flex items-center px-4 bg-white shrink-0 sticky top-0 z-10">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="md:hidden mr-3 p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Back to list"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-mono uppercase tracking-tighter">
                  Log ID: #{selectedLog.id}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 본문 콘텐츠 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* 제목 */}
                <header>
                  <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                    {selectedLog.title}
                  </h1>
                </header>

                <hr className="border-gray-100" />

                {/* 메시지 내용 */}
                <section>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Log Message
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-800 text-[14px] leading-[1.6] whitespace-pre-wrap shadow-sm font-sans">
                    {selectedLog.message || "표시할 내용이 없습니다."}
                  </div>
                </section>

                {/* 에러 로그 (있을 때만 표시) */}
                {selectedLog.error_log && (
                  <section>
                    <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3 italic underline decoration-2 underline-offset-4">
                      Error Stack Trace
                    </h3>
                    <div className="relative group">
                      <pre className="p-4 bg-gray-900 text-red-400 rounded-lg text-[12px] overflow-x-auto font-mono leading-relaxed shadow-lg">
                        <code>{selectedLog.error_log}</code>
                      </pre>
                    </div>
                  </section>
                )}

                {/* 메타 정보 하단 카드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                      Status Type
                    </p>
                    <p className="font-semibold text-gray-700">
                      {selectedLog.type?.toUpperCase() || "INFO"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                      Created At
                    </p>
                    <p className="font-semibold text-gray-700 font-mono text-[12px]">
                      {new Date(selectedLog.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <svg
              className="w-12 h-12 opacity-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>목록에서 로그를 선택해주세요.</p>
          </div>
        )}
      </main>
    </div>
  );
}

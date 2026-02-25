"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function PdfViewer() {
  const supabase = createBrowserSupabaseClient();
  const [papers, setPapers] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showViewer, setShowViewer] = useState(false); // 모바일용 뷰어 활성화 상태

  useEffect(() => {
    const fetchPapers = async () => {
      const { data } = await supabase
        .from("pdf_papers")
        .select("*")
        .order("published_date", { ascending: false });
      setPapers(data || []);
      // 데스크톱 환경(md 이상)일 때만 첫 번째 PDF 자동 선택
      if (window.innerWidth >= 768 && data?.length > 0) {
        setSelectedPdf(data[0]);
      }
    };
    fetchPapers();
  }, []);

  const handleSelectPdf = (paper) => {
    setSelectedPdf(paper);
    setShowViewer(true); // 항목 선택 시 뷰어 표시
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white flex flex-col md:flex-row h-screen overflow-hidden">
      {/* 1. 사이드바 (모바일에서는 뷰어가 꺼져있을 때만 표시) */}
      <div
        className={`${
          showViewer ? "hidden" : "flex"
        } md:flex flex-col w-full md:w-80 bg-[#181818] border-r border-[#3a3a3a] h-full`}
      >
        <div className="p-4 border-b border-[#3a3a3a] flex justify-center">
          <Link href="/" className="relative w-[120px] h-[40px] block">
            <Image
              src="/images/logo_white.png"
              alt="투데이태백"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          <h2 className="text-lg font-bold mb-4 px-2">최신 지면 보기</h2>
          <div className="space-y-2">
            {papers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => handleSelectPdf(paper)}
                className={`p-4 rounded-lg cursor-pointer transition flex items-center justify-between ${
                  selectedPdf?.id === paper.id
                    ? "bg-blue-600 shadow-lg"
                    : "bg-[#2a2a2a] hover:bg-[#333]"
                }`}
              >
                <div>
                  <p className="font-medium">{paper.title}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {paper.published_date}
                  </p>
                </div>
                <span className="md:hidden text-gray-400">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PDF 뷰어 영역 (모바일에서는 선택 시 전체화면) */}
      <div
        className={`${
          showViewer ? "flex" : "hidden"
        } md:flex flex-grow flex-col h-full bg-[#1f1f1f]`}
      >
        {selectedPdf ? (
          <>
            {/* 상단 툴바 */}
            <div className="bg-[#2a2a2a] p-3 md:p-4 border-b border-[#3a3a3a] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {/* 모바일에서만 보이는 뒤로가기 버튼 */}
                <button
                  onClick={() => setShowViewer(false)}
                  className="md:hidden p-2 -ml-2 hover:bg-[#3a3a3a] rounded-full"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <h3 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-none">
                  {selectedPdf.title}
                </h3>
              </div>
              <a
                href={selectedPdf.pdf_url}
                download
                className="text-xs bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-medium transition"
              >
                다운로드
              </a>
            </div>

            {/* PDF 본문 */}
            <div className="flex-grow bg-black relative">
              <iframe
                src={`${selectedPdf.pdf_url}#view=FitH`}
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-500">
            <p>목록에서 지면을 선택해 주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

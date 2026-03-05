"use client";

import { useState, useEffect } from "react";
// MUI Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DescriptionIcon from "@mui/icons-material/Description";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function InquiryList() {
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setInquiries(data);
      setLoading(false);
    };
    fetchInquiries();
  }, []);

  const handleToggle = async (id, isRead) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isRead) {
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
      await supabase.from("inquiries").update({ is_read: true }).eq("id", id);
    }
  };

  // 파일명 추출 헬퍼 함수
  const getFileName = (url) => {
    if (!url) return "Unknown File";
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.split("/").pop().split("?")[0];
  };

  if (loading)
    return (
      <div className="flex justify-center py-20 text-[#86868b] animate-pulse font-light">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <header className="mb-10 px-2 flex justify-between items-end">
        <div>
          <h1 className="text-[34px] font-semibold tracking-tight text-[#1d1d1f]">
            문의 관리
          </h1>
          <p className="text-[17px] text-[#86868b]">
            고객 문의 및 첨부파일 관리
          </p>
        </div>
        <div className="text-[13px] text-[#86868b] font-medium bg-[#f5f5f7] px-3 py-1 rounded-full">
          Total {inquiries.length}
        </div>
      </header>

      <div className="space-y-4">
        {inquiries.map((inquiry) => {
          const isExpanded = expandedId === inquiry.id;
          const files = Array.isArray(inquiry.file_urls)
            ? inquiry.file_urls
            : [];

          return (
            <div
              key={inquiry.id}
              className={`
                group overflow-hidden transition-all duration-500 rounded-[28px] border
                ${
                  isExpanded
                    ? "bg-white shadow-[0_30px_60px_rgba(0,0,0,0.12)] border-[#d2d2d7] translate-y-[-4px]"
                    : "bg-white/60 border-[#d2d2d7]  hover:bg-white hover:shadow-lg"
                }
              `}
            >
              {/* 헤더 섹션 */}
              <div
                onClick={() => handleToggle(inquiry.id, inquiry.is_read)}
                className="p-6 cursor-pointer flex items-start gap-4"
              >
                <div className="pt-1.5 flex-shrink-0">
                  {!inquiry.is_read && (
                    <div className="w-2.5 h-2.5 bg-[#0071e3] rounded-full shadow-[0_0_8px_rgba(0,113,227,0.5)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[11px] font-bold tracking-widest uppercase ${inquiry.is_read ? "text-[#86868b]" : "text-[#0071e3]"}`}
                    >
                      {inquiry.category}
                    </span>
                    {files.length > 0 && (
                      <span className="bg-[#f5f5f7] text-[#1d1d1f] text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                        Files
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-[18px] font-semibold transition-colors ${inquiry.is_read && !isExpanded ? "text-[#86868b]" : "text-[#1d1d1f]"}`}
                  >
                    {inquiry.title}
                  </h3>
                </div>
                <div
                  className={`transition-transform duration-500 ${isExpanded ? "rotate-90 text-[#1d1d1f]" : "text-[#d2d2d7]"}`}
                >
                  <ChevronRightIcon />
                </div>
              </div>

              {/* 상세 내용 (아코디언) */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <div className="px-10 pb-10 pt-2 space-y-8">
                    {/* 1. 연락처 정보 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 p-6 rounded-[20px] bg-[#f5f5f7]/60 border border-[#f5f5f7]">
                      <InfoRow
                        icon={<PersonIcon sx={{ fontSize: 18 }} />}
                        label="성함"
                        value={inquiry.name}
                      />
                      <InfoRow
                        icon={<EmailIcon sx={{ fontSize: 18 }} />}
                        label="이메일"
                        value={inquiry.email}
                      />
                      <InfoRow
                        icon={<PhoneIphoneIcon sx={{ fontSize: 18 }} />}
                        label="연락처"
                        value={inquiry.phone}
                      />
                      <InfoRow
                        icon={<BusinessIcon sx={{ fontSize: 18 }} />}
                        label="회사/조직"
                        value={inquiry.company || "개인"}
                      />
                    </div>

                    {/* 2. 본문 내용 */}
                    <div>
                      <h4 className="text-[12px] font-bold text-[#86868b] uppercase tracking-[0.1em] mb-3 px-1">
                        Message
                      </h4>
                      <div className="text-[16px] leading-[1.7] text-[#1d1d1f] whitespace-pre-wrap font-light">
                        {inquiry.content}
                      </div>
                    </div>

                    {/* 3. 첨부파일 다운로드 섹션 */}
                    {files.length > 0 && (
                      <div className="pt-6 border-t border-[#f5f5f7]">
                        <h4 className="text-[12px] font-bold text-[#86868b] uppercase tracking-[0.1em] mb-4 px-1 text-center sm:text-left">
                          Attachments
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {files.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="flex items-center gap-3 p-3 pr-5 bg-white border border-[#d2d2d7] rounded-xl hover:border-[#0071e3] transition-colors group/file shadow-sm"
                            >
                              <div className="bg-[#f5f5f7] p-2 rounded-lg group-hover/file:bg-blue-50 transition-colors">
                                <DescriptionIcon
                                  sx={{ fontSize: 20, color: "#86868b" }}
                                  className="group-hover/file:text-[#0071e3]"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-[#1d1d1f] max-w-[150px] truncate">
                                  {getFileName(url)}
                                </span>
                                <span className="text-[11px] text-[#0071e3] flex items-center gap-0.5">
                                  <FileDownloadIcon sx={{ fontSize: 12 }} />{" "}
                                  Download
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 정보 행 헬퍼 컴포넌트
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#86868b]">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] text-[#86868b] font-medium uppercase tracking-tighter">
          {label}
        </span>
        <span className="text-[14px] text-[#1d1d1f] font-medium">{value}</span>
      </div>
    </div>
  );
}

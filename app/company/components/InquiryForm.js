"use client";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState, useRef } from "react";
import { Upload, X, CheckCircle2, FileText, Info } from "lucide-react";

//category: db에 저장될 카테고리 명 , categoryId: sessionStorage 에 저장될 ID
export default function InquiryForm({
  title,
  subtitle,
  category,
  categoryId,
  buttonText,
}) {
  const supabase = createBrowserSupabaseClient();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태 관리 추가

  const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
  const SUBMIT_DELAY = 60 * 1000;

  // 파일 유효성 검사 및 추가 로직 분리
  const processFiles = (newSelectedFiles) => {
    const currentTotalSize = files.reduce((acc, f) => acc + f.size, 0);
    const newFilesSize = newSelectedFiles.reduce((acc, f) => acc + f.size, 0);

    if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE) {
      alert("전체 파일 크기는 20MB를 초과할 수 없습니다.");
      return;
    }

    setFiles((prev) => [...prev, ...newSelectedFiles]);
  };

  // [기존] 클릭 업로드 핸들러
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
    e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
  };

  // [신규] 드래그 앤 드롭 핸들러들
  const handleDragOver = (e) => {
    e.preventDefault(); // 브라우저 기본 동작 방지 (필수)
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lastSubmit = localStorage.getItem(`last_submit_${categoryId}`);
    const now = Date.now();
    if (lastSubmit && now - parseInt(lastSubmit) < SUBMIT_DELAY) {
      const remaining = Math.ceil(
        (SUBMIT_DELAY - (now - parseInt(lastSubmit))) / 1000,
      );
      alert(
        `과도한 연속 접수를 방지하기 위해 ${remaining}초 후 다시 시도해주세요.`,
      );
      return;
    }

    if (!agreed) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const name = formData.get("name");
      const email = formData.get("email");
      const phone = formData.get("phone");
      const company = formData.get("company");
      const title = formData.get("title");
      const content = formData.get("content");

      let fileUrls = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${categoryId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("inquiry_files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("inquiry_files").getPublicUrl(filePath);
        fileUrls.push(publicUrl);
      }

      const { error: dbError } = await supabase.from("inquiries").insert([
        {
          category,
          name,
          email,
          phone,
          company,
          title,
          content,
          file_urls: fileUrls,
        },
      ]);

      if (dbError) throw dbError;

      localStorage.setItem(`last_submit_${categoryId}`, Date.now().toString());
      alert(`[${category}] 접수가 성공적으로 완료되었습니다.`);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500">{subtitle}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white shadow-2xl shadow-slate-200/60 rounded-[32px] border border-slate-100 p-8 md:p-12"
      >
        {/* 개인정보 동의 영역 */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Info size={20} className="text-blue-600" />
            <h3 className="font-bold">개인정보 수집 및 이용 동의</h3>
          </div>
          <div className="h-28 overflow-y-auto bg-white/50 p-4 rounded-xl border border-slate-200 text-sm text-slate-500 leading-relaxed mb-4">
            <p>• 수집항목: 이름, 연락처, 이메일, 회사명, 첨부파일</p>
            <p>• 수집목적: {category} 내용 확인 및 처리 결과 회신</p>
            <p>
              • 보유기간: 목적 달성 후 3개월 (관련 법령에 따라 보존 필요 시 해당
              기간까지)
            </p>
            <p className="mt-2 text-xs text-slate-400">
              ※ 귀하는 동의를 거부할 권리가 있으나, 거부 시 접수가 제한될 수
              있습니다.
            </p>
          </div>
          <label className="flex items-center group cursor-pointer">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-blue-600 transition-all"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
              위 내용을 확인하였으며, 개인정보 수집에 동의합니다. (필수)
            </span>
          </label>
        </div>

        {/* 입력 필드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-black">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              이름 <span className="text-blue-600">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              placeholder="홍길동"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              회사명/소속
            </label>
            <input
              name="company"
              type="text"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              placeholder="소속 기관명"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              연락처 <span className="text-blue-600">*</span>
            </label>
            <input
              name="phone"
              type="tel"
              required
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              placeholder="010-0000-0000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              이메일 <span className="text-blue-600">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              placeholder="example@email.com"
            />
          </div>
        </div>

        <div className="space-y-6 text-black">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              제목 <span className="text-blue-600">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              placeholder="문의 제목을 입력해주세요"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              내용 <span className="text-blue-600">*</span>
            </label>
            <textarea
              name="content"
              required
              rows="6"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="상세 내용을 적어주세요."
            ></textarea>
          </div>
        </div>

        {/* 드롭존 영역 업데이트 */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center justify-between">
            <span>파일 첨부</span>
            <span className="text-xs font-normal text-slate-400">
              전체 최대 20MB 이내
            </span>
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
              isDragging
                ? "border-blue-500 bg-blue-50 scale-[1.01]"
                : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
            }`}
          >
            <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
              <div
                className={`p-3 bg-white rounded-full shadow-sm mb-3 transition-transform ${isDragging ? "scale-125 text-blue-600" : "group-hover:scale-110"}`}
              >
                <Upload
                  className={isDragging ? "text-blue-600" : "text-slate-400"}
                  size={24}
                />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {isDragging
                  ? "여기에 파일을 놓으세요!"
                  : "클릭하거나 파일을 이곳에 드롭하세요"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, JPG, PNG, DOCX, ZIP
              </p>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".jpg,.png,.pdf,.docx,.zip"
                multiple
              />
            </label>
          </div>

          {/* 파일 목록 */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {files.map((f, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm text-slate-700 font-medium truncate">
                        {f.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {(f.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-bold text-white text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              loading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            }`}
          >
            {loading ? "처리 중..." : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}

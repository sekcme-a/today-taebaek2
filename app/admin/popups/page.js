"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function AdminPopupList() {
  const supabase = createBrowserSupabaseClient();
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    const { data } = await supabase
      .from("popups")
      .select("*")
      .order("created_at", { ascending: false });
    setPopups(data || []);
  };

  const toggleActive = async (id, currentStatus) => {
    await supabase
      .from("popups")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchPopups();
  };

  const deletePopup = async (id, imageUrl) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      // 1. URL에서 파일 경로 추출 (public-bucket/ 뒤의 경로를 찾음)
      // 예: https://.../public-bucket/admin/popups/123.jpg -> admin/popups/123.jpg
      const bucketName = "public-bucket";
      const pathParts = imageUrl.split(`${bucketName}/`);

      if (pathParts.length > 1) {
        const filePath = pathParts[1]; // admin/popups/123.jpg

        // 2. Storage에서 파일 삭제
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);

        if (storageError) {
          console.error("Storage 삭제 오류:", storageError);
          alert("이미지 삭제 중 오류가 발생했습니다.");
          return;
        }
      }

      // 3. DB 삭제
      const { error: dbError } = await supabase
        .from("popups")
        .delete()
        .eq("id", id);

      if (dbError) {
        console.error("DB 삭제 오류:", dbError);
        alert("데이터 삭제 중 오류가 발생했습니다.");
      } else {
        fetchPopups(); // 목록 갱신
      }
    } catch (err) {
      console.error("삭제 과정 예외 발생:", err);
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">팝업 관리</h1>
        <Link
          href="/admin/popups/new"
          className="bg-black text-white px-5 py-2 rounded-full text-sm hover:opacity-80 transition"
        >
          새 팝업 등록
        </Link>
      </div>

      <div className="grid gap-4">
        {popups.map((popup) => (
          <div
            key={popup.id}
            className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <img
                src={popup.image_url}
                className="w-16 h-16 rounded-lg object-cover bg-gray-50"
              />
              <div>
                <p className="font-medium">{popup.title}</p>
                <p className="text-xs text-gray-400">
                  우선순위: {popup.priority}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(popup.id, popup.is_active)}
                className={`px-3 py-1 rounded-full text-xs ${popup.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
              >
                {popup.is_active ? "활성" : "비활성"}
              </button>
              <Link
                href={`/admin/popups/${popup.id}`}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
              >
                편집
              </Link>
              <button
                onClick={() => deletePopup(popup.id, popup.image_url)}
                className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function PopupOverlay() {
  const supabase = createBrowserSupabaseClient();
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    const { data, error } = await supabase
      .from("popups")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (data) {
      // '오늘 하루 보지 않기' 필터링
      const filtered = data.filter((popup) => {
        const expiry = localStorage.getItem(`hide_popup_${popup.id}`);
        if (!expiry) return true;
        return new Date().getTime() > parseInt(expiry);
      });
      setPopups(filtered);
    }
  };

  const closePopup = (id, hideToday = false) => {
    if (hideToday) {
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 24시간 후
      localStorage.setItem(`hide_popup_${id}`, expiry.toString());
    }
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  if (popups.length === 0) return null;

  // 수정된 PopupOverlay.js의 return 부분

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none p-4">
      {/* 1. popups.slice().reverse()로 배열을 뒤집어 맨 마지막 팝업이 가장 먼저(좌상단) 오게 함 */}
      {[...popups].reverse().map((popup, index) => (
        <div
          key={popup.id}
          className="pointer-events-auto absolute transition-all duration-500 ease-out animate-in fade-in zoom-in-95 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-[320px] max-h-[85vh] flex flex-col"
          style={{
            // 2. 인덱스가 커질수록(즉, 먼저 등록된 팝업일수록) 더 아래로 가게 함
            top: `${20 + index * 10}px`,
            left: `${20 + index * 10}px`,
            // 3. zIndex도 반대로 설정하여 가장 뒤에 있는 팝업이 가장 위에 보이게 함
            zIndex: 1000 + index,
          }}
        >
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            <img
              src={popup.image_url}
              alt={popup.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-white/50 border-t border-gray-100 shrink-0">
            <button
              onClick={() => closePopup(popup.id, true)}
              className="text-[12px] text-gray-500 hover:text-black"
            >
              오늘 하루 보지 않기
            </button>
            <button
              onClick={() => closePopup(popup.id)}
              className="text-[12px] font-bold text-gray-800 px-3 py-1 bg-gray-100 rounded-full"
            >
              닫기
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

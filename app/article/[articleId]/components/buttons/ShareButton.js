// components/ShareButton.jsx
"use client";

import { useState, useEffect } from "react";
import {
  RiShareForwardFill,
  RiKakaoTalkFill,
  RiTwitterXFill,
  RiFacebookFill,
  RiLinksFill,
  RiCloseLine,
} from "react-icons/ri";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

// 카카오톡 공유기능 참고: https://sooncoding.tistory.com/336
export default function ShareButton({ title, text, imgSrc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_KEY;
  // const KAKAO_KEY = "077a285804d23fba507ceef046746ce8";

  useEffect(() => {
    // 클라이언트 사이드에서만 URL 가져오기
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }

    // 카카오 SDK 초기화
    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_KEY);
      }
    }
  }, [window?.Kakao]);

  // 1. 카카오톡 공유
  const handleKakaoShare = () => {
    console.log(currentUrl);
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: title,
          description: text,
          imageUrl: imgSrc, // 썸네일 이미지 URL
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
        buttons: [
          {
            title: "웹으로 보기",
            link: {
              mobileWebUrl: currentUrl,
              webUrl: currentUrl,
            },
          },
        ],
      });
      // window.Kakao.Share.sendScrap({
      //   requestUrl: "https://xn--2n1b19ndwjhoj6sb.com",
      // });
    }
  };

  // 2. 페이스북 공유
  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl,
    )}`;
    window.open(shareUrl, "_blank");
  };

  // 3. X (트위터) 공유
  const handleXShare = () => {
    const text = "이 페이지를 확인해보세요!";
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, "_blank");
  };

  // 4. URL 복사
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert("URL이 복사되었습니다!"); // 또는 토스트 메시지로 대체 가능
      setIsOpen(false); // 복사 후 닫기
    } catch (err) {
      console.error("URL 복사 실패:", err);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* 메인 공유 버튼 */}
      <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <ShareOutlinedIcon style={{ fontSize: "25px" }} />
        {/* <span className="font-semibold text-sm">공유하기</span> */}
      </button>

      {/* 공유 메뉴 모달 (토글) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold text-gray-700">공유하기</p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <RiCloseLine size={20} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* 카카오톡 */}
            <ShareIconBtn
              icon={<RiKakaoTalkFill size={24} />}
              label="카카오톡"
              color="bg-yellow-300 hover:bg-yellow-400 text-amber-900 cursor-pointer"
              onClick={handleKakaoShare}
            />

            {/* 페이스북 */}
            <ShareIconBtn
              icon={<RiFacebookFill size={24} />}
              label="페이스북"
              color="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              onClick={handleFacebookShare}
            />

            {/* X (트위터) */}
            <ShareIconBtn
              icon={<RiTwitterXFill size={24} />}
              label="X"
              color="bg-black hover:bg-gray-800 text-white cursor-pointer"
              onClick={handleXShare}
            />

            {/* URL 복사 */}
            <ShareIconBtn
              icon={<RiLinksFill size={24} />}
              label="링크복사"
              color="bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
              onClick={handleCopyUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 내부에서 사용할 작은 아이콘 버튼 컴포넌트
function ShareIconBtn({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${color}`}
      >
        {icon}
      </div>
      <span className="text-xs text-gray-500 group-hover:text-gray-800 transition-colors">
        {label}
      </span>
    </button>
  );
}

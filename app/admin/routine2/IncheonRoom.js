import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

const IncheonRoom = ({ setRoomPage, posts, authors }) => {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [page, setPage] = useState(0);

  function cleanText(raw) {
    if (!raw) return "";
    let text = raw;

    // 1. "사진 확대보기"가 여러 번 있을 수 있으므로 반복 처리
    while (text.includes("사진 확대보기")) {
      const photoIndex = text.indexOf("사진 확대보기");
      if (photoIndex === -1) break;

      const before = text.slice(0, photoIndex);
      let after = text.slice(photoIndex + "사진 확대보기".length);

      const firstContentMatch = after.match(/[^\n\s]/); // 공백/줄바꿈이 아닌 첫 문자 찾기
      if (firstContentMatch) {
        const firstContentIndex = after.indexOf(firstContentMatch[0]);
        after = after.slice(firstContentIndex);
      }

      text = before + after;
    }

    // 2. &nbsp; → 일반 공백
    text = text.replace(/&nbsp;/g, " ");

    // 3. 줄바꿈 3번 이상 → 2번으로
    text = text.replace(/\n{3,}/g, "\n\n");

    // 4. "줄바꿈 + 담당부서 + 줄바꿈" 이후는 삭제
    text = text.replace(/\n담당부서\n[\s\S]*/g, "");
    text = text.replace(/\n담당 부서 :[\s\S]*/g, "");

    return text.trim(); // 앞뒤 공백 제거
  }

  // 담당부서 문구 빼고 기자명 삽입
  const refineContent = () => {
    if (!posts || posts.length === 0) return "";
    const AUTHORS = authors;
    const randomNum = Math.floor(Math.random() * AUTHORS.length);

    console.log(posts[page]?.content);
    console.log(cleanText(posts[page]?.content));
    return cleanText(posts[page]?.content) + `\n\n${AUTHORS[randomNum]}`;
  };

  /**
   * ✅ 이미지 강제 다운로드 핸들러
   */
  const handleImageDownload = async () => {
    const imageUrl = posts[page]?.attachments[0];
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const fileName = imageUrl.includes("logo.png")
        ? "logo.png"
        : `incheon_news_${posts[page]?.number || "img"}.jpg`;

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("다운로드 실패:", error);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "incheon_image.jpg";
      link.click();
    }
  };

  return (
    <div className="p-5 pt-1">
      <p className="font-bold text-lg m-2">
        {page + 1}/{posts.length} 번째
      </p>

      <Button
        variant="contained"
        fullWidth
        style={{ height: "15vh", marginBottom: "2vh" }}
        onClick={() => navigator.clipboard.writeText(posts[page]?.title)}
      >
        제목 붙혀넣기
      </Button>
      <Button
        variant="contained"
        fullWidth
        style={{ height: "15vh", marginBottom: "2vh" }}
        onClick={() =>
          navigator.clipboard.writeText(refineContent().split("\n")[0])
        }
      >
        내용 일부분 붙혀넣기
      </Button>
      <Button
        variant="contained"
        fullWidth
        style={{ height: "15vh", marginBottom: "2vh" }}
        onClick={() => navigator.clipboard.writeText(refineContent())}
      >
        내용 붙혀넣기
      </Button>
      <Button
        variant="contained"
        fullWidth
        style={{ height: "15vh", marginBottom: "2vh" }}
        onClick={handleImageDownload}
      >
        이미지 다운로드
      </Button>
      <Button
        variant="contained"
        fullWidth
        style={{ height: "15vh", marginBottom: "2vh" }}
        onClick={() => setPage((prev) => prev + 1)}
      >
        다음 페이지
      </Button>
      <Button
        variant="contained"
        fullWidth
        style={{ height: "15vh", marginBottom: "2vh", marginTop: "5vh" }}
        onClick={() => setPage((prev) => prev - 1)}
      >
        전 페이지
      </Button>
      <Button
        variant="contained"
        fullWidth
        style={{ height: "15vh", marginBottom: "2vh", marginTop: "5vh" }}
        onClick={async () => {
          await supabase
            .from("routine2")
            .upsert(
              { type: "incheon", date: new Date() },
              { onConflict: "type" },
            );
          setRoomPage((prev) => prev + 1);
        }}
      >
        다음으로
      </Button>
    </div>
  );
};

export default IncheonRoom;

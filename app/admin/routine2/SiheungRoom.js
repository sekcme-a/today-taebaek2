import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SiheungRoom = ({ setRoomPage, posts, authors }) => {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [page, setPage] = useState(0);

  function cleanText(raw) {
    let text = raw;

    // 1. "사진 확대보기" 제거 로직 (기존 유지)
    while (text.includes("사진 확대보기")) {
      const photoIndex = text.indexOf("사진 확대보기");
      if (photoIndex === -1) break;
      const before = text.slice(0, photoIndex);
      let after = text.slice(photoIndex + "사진 확대보기".length);
      const firstContentMatch = after.match(/[^\n\s]/);
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

    // 4. [수정됨] "담당 부서" 또는 "담당부서" 이후 모든 내용 삭제
    // \s* 는 공백이 있을 수도 없을 수도 있음을 의미합니다.
    // [:\s]* 는 콜론이나 공백이 뒤따라오는 경우를 처리합니다.
    text = text.replace(/\n\s*담당\s*부서[\s\S]*/g, "");

    return text.trim();
  }

  // 담당부서 문구 빼고 기자명 삽입
  const refineContent = () => {
    const AUTHORS = authors;
    const randomNum = Math.floor(Math.random() * AUTHORS.length);

    // const content = posts[page]?.content;
    // const splitDamDang = content?.split("담당 부서 : ");
    // const removeDamDang = splitDamDang[0];
    // const addAuthor = removeDamDang + `\n\n${AUTHORS[randomNum]}`;
    // return addAuthor;
    console.log(posts[page]?.content);
    console.log(cleanText(posts[page]?.content));
    return cleanText(posts[page]?.content) + `\n\n${AUTHORS[randomNum]}`;
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
        onClick={() => {
          console.log(posts[page]);
          window.open(posts[page]?.images[0]);
        }}
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
              { type: "siheung", date: new Date() },
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

export default SiheungRoom;

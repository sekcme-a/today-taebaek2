"use client";

import { useArticleSelection } from "./ArticleSelectionProvider";
import { Button } from "@mui/material";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { handleFileDelete } from "../../[articleId]/components/ArticleEditor/fileUtils";

export default function BulkActions() {
  // clearSelection 함수를 Context에서 가져옵니다.
  const { selectedArticleIds, clearSelection } = useArticleSelection();
  const router = useRouter();
  const isSelected = selectedArticleIds.length > 0;

  const handleDelete = async () => {
    if (
      !isSelected ||
      !window.confirm(
        `${selectedArticleIds.length}개의 기사를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();

      // 1. article 데이터 모두 받아오기
      // fileUtils 내에서 스토리지 파일을 지우기 위해 content 등의 필드가 포함된 전체 데이터를 가져옵니다.
      const { data: articles, error: fetchError } = await supabase
        .from("articles")
        .select("*")
        .in("id", selectedArticleIds);

      if (fetchError) throw fetchError;

      // 2. 받아온 모든 article들에게 await handleFileDelete({supabase, article}) 실행
      // Promise.all을 사용하여 병렬로 처리하거나, for-of 문으로 순차 처리할 수 있습니다.
      // 파일 삭제 후 DB 레코드도 함께 삭제되도록 fileUtils 로직을 따릅니다.
      if (articles) {
        for (const article of articles) {
          await handleFileDelete({ supabase, article });
        }
      }
      alert(
        `${selectedArticleIds.length}개의 기사가 성공적으로 삭제되었습니다.`,
      );
      clearSelection(); // 삭제 후 선택 목록 초기화
      router.refresh(); // 목록 갱신
    } catch (error) {
      console.error("일괄 삭제 오류:", error);
      alert(`기사 삭제에 실패했습니다: ${error.message}`);
    }
  };

  // "전체 선택 해제" 버튼 클릭 핸들러
  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-600">
          선택된 기사: {selectedArticleIds.length}개
        </p>

        {/* --- 새로 추가된 버튼 --- */}
        <Button
          variant="outlined"
          color="inherit" // 일반적인 색상 사용
          size="small"
          disabled={!isSelected} // 선택된 항목이 있을 때만 활성화
          onClick={handleClearSelection}
        >
          전체 선택 해제
        </Button>
        {/* ------------------- */}
      </div>

      <Button
        variant="contained"
        color="error"
        size="small"
        sx={{ ml: 2 }}
        disabled={!isSelected}
        onClick={handleDelete}
      >
        선택된 기사 일괄 삭제
      </Button>
    </div>
  );
}

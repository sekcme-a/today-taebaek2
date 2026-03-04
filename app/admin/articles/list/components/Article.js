"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";
// 경로를 수정했습니다.
import CategorySelector from "../../[articleId]/components/ArticleEditor/CategorySelector/CategorySelector";
// 새로 추가된 Context Hook 임포트
import { useArticleSelection } from "./ArticleSelectionProvider";
import { Checkbox } from "@mui/material";

export default function Article({ articleId, isMain }) {
  const [article, setArticle] = useState(null);
  const [categories, setCategories] = useState([]); // 현재 연결된 카테고리 (이름 표시용)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // CategorySelector에서 사용될 ID 목록
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // 셀렉터 확장/축소 상태

  // ArticleSelection Context 사용
  const { toggleArticleSelection, isSelected } = useArticleSelection();
  const checked = isSelected(articleId); // 현재 기사의 선택 상태

  useEffect(() => {
    if (articleId) fetchData();
  }, [articleId]);

  // ArticleEditor/CategorySelector/CategorySelector.js 파일이
  // 현재 Article 컴포넌트와 같은 디렉토리 내에 있다고 가정하고 경로를 수정합니다.
  // 만약 ArticleEditor/CategorySelector/CategorySelector.js 가
  // ../../[articleId]/components/ArticleEditor/CategorySelector/CategorySelector 에 있다면
  // import CategorySelector from "../../[articleId]/components/ArticleEditor/CategorySelector/CategorySelector"; 이 맞습니다.

  const fetchData = async () => {
    const supabase = createBrowserSupabaseClient();

    // 1. 기사 정보 가져오기
    let { data: articleData } = await supabase
      .from("articles")
      .select("id, title, created_at")
      .eq("id", articleId)
      .single();
    setArticle(articleData);

    // 2. 현재 연결된 카테고리 정보 가져오기 (Slug와 Name 포함)
    const { data: catData } = await supabase
      .from("article_categories")
      .select(
        `
        category_slug,
        categories (
          id, name
        )
      `,
      )
      .eq("article_id", articleId);

    // 현재 연결된 카테고리 상태 업데이트
    const currentCategories = catData || [];
    setCategories(currentCategories);

    // CategorySelector에 사용할 카테고리 ID 목록 초기화
    const currentCategoryIds = currentCategories
      .map((cat) => cat.categories?.id)
      .filter((id) => id); // null 값 제거
    setSelectedCategoryIds(currentCategoryIds);
  };

  // CategorySelector에서 선택 상태가 변경될 때 호출됩니다.
  const handleCategoryChange = (newSelectedIds) => {
    setSelectedCategoryIds(newSelectedIds);
  };

  // 카테고리 저장 함수
  const handleSaveCategories = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const supabase = createBrowserSupabaseClient();

    try {
      // 1. 기존 article_categories 연결 모두 삭제
      const { error: deleteError } = await supabase
        .from("article_categories")
        .delete()
        .eq("article_id", articleId);

      if (deleteError) throw deleteError;

      // 2. 선택된 카테고리의 slug를 가져옵니다.
      const { data: selectedCategorySlugs, error: slugError } = await supabase
        .from("categories")
        .select("slug")
        .in("id", selectedCategoryIds);

      if (slugError) throw slugError;

      // 3. 새로운 연결 데이터 생성
      const newLinks = selectedCategorySlugs.map((cat, index) => ({
        article_id: articleId,
        category_slug: cat.slug,
        // 첫 번째 카테고리를 메인으로 설정하는 간단한 로직 (선택 사항)
        is_main: index === 0,
      }));

      // 4. 새로운 article_categories 연결 삽입
      const { error: insertError } = await supabase
        .from("article_categories")
        .insert(newLinks);

      if (insertError) throw insertError;

      alert("카테고리가 성공적으로 저장되었습니다!");

      // 저장 후 데이터 새로고침
      await fetchData();
      setIsExpanded(false); // 저장 후 셀렉터 닫기
    } catch (error) {
      console.error("카테고리 저장 오류:", error);
      alert(`카테고리 저장에 실패했습니다: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!article) return <li>로딩중...</li>;

  // 체크박스 클릭 핸들러 (Link 이동 방지)
  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Link로의 이벤트 전파 방지
    toggleArticleSelection(articleId);
  };

  return (
    <li
      key={articleId}
      // 선택 상태에 따라 배경색 변경
      className={`border rounded transition cursor-pointer mb-2 
          ${
            checked
              ? "border-blue-700 bg-blue-50/50 shadow-lg"
              : "border-gray-300 hover:shadow-xl hover:border-blue-700"
          }`}
    >
      <div className="flex items-center">
        {/* 체크박스 영역 */}
        <div className="p-2" onClick={handleCheckboxClick}>
          <Checkbox checked={checked} onChange={() => {}} />
        </div>

        {/* 기사 제목, 날짜 영역 (Link로 감싸기) */}
        <Link href={`/admin/articles/${articleId}`} className="flex-grow">
          <article className="md:flex justify-between items-center pr-4 py-3 break-keep">
            <h2 className="text-lg md:text-xl font-semibold leading-tight line-clamp-2">
              {article.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              작성일:{" "}
              <time dateTime={article.created_at}>
                {new Date(article.created_at).toLocaleDateString()}
              </time>
            </p>
          </article>
        </Link>
      </div>

      <div className="px-4 pb-3">
        {categories.length === 0 && (
          <span className="inline-block bg-red-600 text-white text-sm px-2 py-1 rounded mr-2">
            카테고리가 없습니다.
          </span>
        )}
        {/* 현재 연결된 카테고리 표시 */}
        {categories.map((cat) => (
          <span
            key={cat.category_slug}
            className="inline-block bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded mr-2"
          >
            {cat.categories?.name}
          </span>
        ))}
        {/* 편집 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-block text-blue-600 text-sm px-2 py-1 hover:underline cursor-pointer"
        >
          {isExpanded ? "편집 닫기" : "카테고리 편집"}
        </button>
      </div>

      {/* CategorySelector 및 저장 버튼 */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <CategorySelector
            selectedCategories={selectedCategoryIds}
            onChange={handleCategoryChange}
          />
          <button
            onClick={handleSaveCategories}
            disabled={isSaving}
            className={`mt-4 px-4 py-2 rounded text-sm text-white 
                    ${
                      isSaving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    } 
                    transition`}
          >
            {isSaving ? "저장 중..." : "카테고리 저장"}
          </button>
        </div>
      )}
    </li>
  );
}

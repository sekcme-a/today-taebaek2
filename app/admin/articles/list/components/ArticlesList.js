import { createServerSupabaseClient } from "@/utils/supabase/server";
import Article from "./Article";

export default async function ArticlesList({
  search,
  page = 1,
  pageSize = 10,
  category,
}) {
  const supabase = await createServerSupabaseClient();

  // 1. 기본 select 설정
  // 카테고리 필터링이 필요할 경우 !inner 관계를 추가합니다.
  const selectQuery = category
    ? "id, article_categories!inner(category_slug)"
    : "id";

  let query = supabase.from("articles").select(selectQuery);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 2. 검색 필터 (OR 조건)
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  // 3. 카테고리 필터 (inner join 조건)
  if (category) {
    query = query.eq("article_categories.category_slug", category);
  }

  // 4. 정렬 및 페이징 범위
  query = query.order("created_at", { ascending: false });

  const { data: articles, error } = await query.range(from, to);

  if (error) {
    console.error("Error fetching articles:", error);
    return (
      <div className="text-center mt-24 text-gray-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center mt-24 text-gray-500">
        해당 조건에 맞는 기사가 없습니다.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {articles.map((article) => (
        // 각 Article 컴포넌트 내부에서 상세 정보를 다시 fetch하므로 id만 전달합니다.
        <Article key={article.id} articleId={article.id} />
      ))}
    </ul>
  );
}

import { Suspense } from "react";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import ArticlesList from "./components/ArticlesList";
import ArticleCountAndSearch from "./components/ArticleCountAndSearch";
import ArticlePagination from "./components/ArticlePagination";
import { Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { ArticleSelectionProvider } from "./components/ArticleSelectionProvider";
import BulkActions from "./components/BulkActions";

export default async function ListPage({ params, searchParams }) {
  const { search = "", page = 1, category = "" } = searchParams;

  const supabase = await createServerSupabaseClient();

  // 1. 카테고리 목록 가져오기 (필터 버튼용)
  const { data: allCategories } = await supabase
    .from("categories")
    .select("slug,name")
    .order("order");

  // 2. 총 게시물 수 구하기
  // 카테고리 필터가 있으면 article_categories!inner를 사용하여 조건에 맞는 기사만 카운트합니다.
  let countQuery = supabase
    .from("articles")
    .select(category ? "id, article_categories!inner(category_slug)" : "id", {
      count: "exact",
      head: true,
    });

  if (search) {
    countQuery = countQuery.or(
      `title.ilike.%${search}%,content.ilike.%${search}%`,
    );
  }

  if (category) {
    countQuery = countQuery.eq("article_categories.category_slug", category);
  }

  const { count } = await countQuery;
  const totalPages = count ? Math.ceil(count / 10) : 0;

  return (
    <ArticleSelectionProvider>
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">기사 목록</h1>

        <div className="flex justify-between items-center mb-3">
          <BulkActions />
          <Link href={`/admin/articles/new`}>
            <Button variant="contained" size="small">
              + 새 게시물
            </Button>
          </Link>
        </div>

        <ArticleCountAndSearch
          search={search}
          page={page}
          count={count}
          category={category}
        />
        <div className="mt-5" />

        {/* 카테고리 필터 탭 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/admin/articles/list">
            <Button
              variant={!category ? "contained" : "outlined"}
              size="small"
              sx={{ borderRadius: "20px" }}
            >
              전체
            </Button>
          </Link>
          {allCategories?.map((cat) => (
            <Link
              key={cat.slug}
              href={`/admin/articles/list?category=${cat.slug}${search ? `&search=${search}` : ""}`}
            >
              <Button
                variant={category === cat.slug ? "contained" : "outlined"}
                size="small"
                sx={{ borderRadius: "20px" }}
              >
                {cat.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="mt-5" />

        <Suspense
          fallback={
            <div className="mt-24 flex flex-col items-center justify-center">
              <CircularProgress />
              <p className="mt-5 text-gray-500 text-sm">
                기사를 불러오는 중입니다...
              </p>
            </div>
          }
        >
          <ArticlesList
            search={search}
            page={page}
            pageSize={10}
            category={category}
          />
        </Suspense>

        <ArticlePagination
          search={search}
          category={category}
          currentPage={Number(page)}
          totalPages={totalPages}
        />
      </div>
    </ArticleSelectionProvider>
  );
}

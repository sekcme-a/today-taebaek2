import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function MainNews() {
  const supabase = await createServerSupabaseClient();

  try {
    /** 0️⃣ 헤드라인 기사 ID 불러오기 */
    const { data: headlineData, error: headlineError } = await supabase
      .from("article_categories")
      .select("article_id")
      .eq("category_slug", "politics")
      .eq("is_main", true)
      .maybeSingle();

    /** 1️⃣ 주요 기사 불러오기 (헤드라인 기사 제외) */
    const { data: articleList, error } = await supabase.rpc(
      "get_unique_main_articles",
      { p_limit: 4, p_exclude_id: headlineData?.article_id },
    );
    if (error) throw new Error(`메인 뉴스 조회 실패: ${error.message}`);

    /** 3️⃣ 데이터가 없을 경우 처리 */
    if (!articleList.length) {
      return (
        <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>
      );
    }

    /** 4️⃣ 렌더링 */
    return (
      <ul>
        {articleList.map((article, index) => (
          <li key={index} className="mb-9 md:mb-6">
            <Link href={`/article/${article.id}`} aria-label="기사로 이동">
              {index === 0 ? (
                <article className="mb-7 md:mb-0">
                  <div className="relative w-full h-40 rounded-lg overflow-hidden">
                    <Image
                      src={
                        article.thumbnail_image ??
                        article.images_bodo?.[0] ??
                        "/images/og_logo.png"
                      }
                      alt={article.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mt-3 hover-effect">
                    {article.title}
                  </h3>
                </article>
              ) : (
                <article className="flex gap-x-2 items-center">
                  <div className="w-4/5">
                    <h3 className="text-xl font-semibold hover-effect line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                  <div className="relative w-1/5 aspect-square   rounded-lg overflow-hidden">
                    <Image
                      src={
                        article.thumbnail_image ??
                        article.images_bodo?.[0] ??
                        "/images/og_logo.png"
                      }
                      alt={article.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </article>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );
  } catch (err) {
    console.error("❌ MainNews 에러:", err);
    return (
      <p className="text-center text-red-500">
        뉴스를 불러오는 중 오류가 발생했습니다.
      </p>
    );
  }
}

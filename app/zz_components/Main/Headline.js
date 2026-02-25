import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function Headline() {
  const supabase = await createServerSupabaseClient();

  // article_categories 테이블을 기준으로 쿼리를 시작합니다.
  const { data: articles, error } = await supabase
    .from("article_categories")
    // 1. article_id를 통해 articles 테이블의 모든(*) 컬럼을 조인하여 가져옵니다.
    //    PostgREST/Supabase는 Foreign Key 관계를 기반으로 이 조인을 수행합니다.
    .select("articles(title, thumbnail_image, id, images_bodo)")
    // 2. category_slug가 'general'인 항목을 필터링합니다.
    .eq("category_slug", "politics")
    // 3. is_main이 true인 항목을 필터링합니다.
    .eq("is_main", true);

  if (error) {
    console.error("Error fetching headline article:", error);
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  // 데이터 구조:
  // categoryArticles는 [{ articles: { id: ..., title: ..., ... } }] 형태입니다.
  const articleData = articles?.[0]?.articles;

  if (!articleData) {
    return <div>메인 기사를 찾을 수 없습니다.</div>;
  }

  return (
    <Link href={`article/${articleData.id}`} aria-label="기사로 이동">
      <article>
        <div className="relative w-full h-64 md:h-96 md:rounded-xl overflow-hidden">
          <Image
            src={
              articleData.thumbnail_image ??
              articleData.images_bodo?.[0] ??
              "/images/og_logo.png"
            }
            alt={articleData.title}
            // 2. width, height 대신 fill 속성을 사용합니다.
            fill
            // 3. object-fit으로 이미지의 크기 조정 방식을 제어합니다.
            //    - cover: 비율을 유지하며 부모 영역을 모두 덮음 (일부가 잘릴 수 있음)
            //    - contain: 비율을 유지하며 부모 영역에 맞춤 (여백이 생길 수 있음)
            style={{ objectFit: "contain" }}
            // 4. (선택적) Tailwind CSS 스타일로 object-fit을 적용할 수도 있습니다.
            // className="object-cover"
          />
        </div>
        <h2 className="text-xl md:text-3xl font-bold mt-3 leading-snug md:mt-5 hover-effect line-clamp-2">
          {articleData.title}
        </h2>
      </article>
    </Link>
  );
}

import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";
import AdBanner from "../AdBanner";
import YoutubeSlider from "../YoutubeSlider"; // 임포트 추가

export default async function RecentArticles() {
  const supabase = await createServerSupabaseClient();

  // 1. 광고 데이터와 유튜브 데이터를 병렬로 조회하여 성능 최적화
  const [adRes, ytRes] = await Promise.all([
    supabase
      .from("advertisements")
      .select("image_url, target_url, ad_type")
      .eq("ad_type", "main_top_right")
      .maybeSingle(),
    supabase
      .from("youtube_links")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const mainRightAd = adRes.data;
  const youtubeLinks = ytRes.data || [];
  const hasYoutube = youtubeLinks.length > 0;

  try {
    // 2. 뉴스 기사 개수 동적 조절
    // 기본 7개 -> (유튜브 있으면 5개) -> (광고까지 있으면 3~4개로 자동 조정 가능)
    let articleLimit = mainRightAd ? 5 : 7;
    if (hasYoutube) articleLimit -= 3; // 유튜브 컴포넌트 공간 확보를 위해 3개 차감

    const { data: recentArticles, error } = await supabase
      .from("articles")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(articleLimit);

    if (error) throw new Error(`최근 뉴스 조회 실패: ${error.message}`);

    return (
      <div className="flex flex-col">
        <ul>
          {recentArticles.map((article, index) => (
            <li
              key={article.id}
              className={`py-5 md:py-4 hover-effect ${
                index !== recentArticles.length - 1 ? "border-b-[1px]" : ""
              } border-[#3d3d3d]`}
            >
              <Link href={`/article/${article.id}`} aria-label="기사로 이동">
                <span className="font-semibold text-[17px] leading-snug line-clamp-2">
                  {article.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 3. 유튜브 슬라이더 (데이터가 있을 때만 렌더링 및 Prop 전달) */}
        {hasYoutube && (
          <div className="mt-2">
            <YoutubeSlider initialLinks={youtubeLinks} />
          </div>
        )}

        {/* 4. 광고 배너 */}
        {mainRightAd && (
          <div className="mt-4">
            <AdBanner data={mainRightAd} />
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}

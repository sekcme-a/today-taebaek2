import { categories } from "@/utils/data/categories";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const baseUrl = "https://xn--2n1b19ndwjhoj6sb.com";
  const today = "2025-10-16T00:00:00Z";

  // 로그인은 SEO에서 의미 없으므로 생략 또는 priority 0.1
  const staticURLs = [
    {
      loc: baseUrl,
      lastmod: today,
      changefreq: "weekly",
      priority: "1.0",
    },
  ];

  // category page는 SEO에 중요 → 적절한 설정 추가
  const categoryURLs = categories.map((category) => ({
    loc: `${baseUrl}/${category.slug}`,
    lastmod: today,
    changefreq: "weekly",
    priority: "0.8",
  }));

  // articles
  const { data: articles } = await supabase
    .from("articles")
    .select("id, created_at");

  const articleURLs =
    articles?.map((article) => ({
      loc: `${baseUrl}/article/${article.id}`,
      lastmod: new Date(article.created_at).toISOString(),
      changefreq: "yearly",
      priority: "0.6",
    })) || [];

  const urls = [...staticURLs, ...categoryURLs, ...articleURLs]
    .map((url) => {
      return `
     <url>
       <loc>${url.loc}</loc>
       <lastmod>${url.lastmod}</lastmod>
       ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
       <priority>${url.priority}</priority>
     </url>
   `;
    })
    .join("");

  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>  
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>
  `.trim();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

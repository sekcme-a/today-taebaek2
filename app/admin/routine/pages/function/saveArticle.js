import { handleFileUpload } from "@/app/admin/articles/[articleId]/components/ArticleEditor/fileUtils";
import { uploadFile } from "@/app/admin/articles/[articleId]/components/ArticleEditor/storageUtils";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export const saveArticle = async (data) => {
  const supabase = createBrowserSupabaseClient();
  let articleId = "";
  try {
    const { data: newArticle, error } = await supabase
      .from("articles")
      .insert({ title: "(임시)", content: "", files: [] })
      .select("id")
      .single();
    if (error || !newArticle?.id) throw new Error("게시글 ID 생성 실패");

    articleId = newArticle.id;

    const uploadedImages = await Promise.all(
      data.images?.map(async (img) => {
        const { url } = await uploadFile(img.file, "images", articleId);
        return url;
      }),
    );

    const { error: articleErr } = await supabase
      .from("articles")
      .update({
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        author: data.author,
        image_descriptions: data.image_descriptions,
        images_bodo: uploadedImages,
        thumbnail_image: uploadedImages[0] ?? null,
      })
      .eq("id", articleId);

    if (articleErr) throw articleErr;

    const { error: catError } = await supabase
      .from("article_categories")
      .insert([
        // { article_id: articleId, category_slug: "general" },
        { article_id: articleId, category_slug: data.slug },
      ]);

    if (catError) throw catError;
  } catch (e) {
    throw { ...e, article_id: articleId, title: data.title };
  }
};

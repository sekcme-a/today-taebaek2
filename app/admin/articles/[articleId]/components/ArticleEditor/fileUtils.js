import {
  uploadFile,
  deleteFiles,
  extractImagePathsFromHtml,
} from "./storageUtils";

export const handleFileUpload = async ({
  supabase,
  articleId,
  title,
  author,
  html,
  files,
  prevFiles,
  prevImages,
}) => {
  let realArticleId = articleId;

  if (!realArticleId) {
    const { data, error } = await supabase
      .from("articles")
      .insert({ title: "(임시)", content: "", files: [] })
      .select("id")
      .single();
    if (error || !data?.id) throw new Error("게시글 ID 생성 실패");
    realArticleId = data.id;
  }

  // Base64 이미지 → Supabase 업로드
  const base64Regex = /<img src="data:image\/[^;]+;base64[^"]+"[^>]*>/g;
  const imgTagMatches = html.match(base64Regex) || [];
  const uploadedImagePaths = [];

  for (const tag of imgTagMatches) {
    const srcMatch = tag.match(/src=\"([^\"]+)\"/);
    if (!srcMatch) continue;

    const base64Data = srcMatch[1];
    const blob = await (await fetch(base64Data)).blob();
    const file = new File([blob], `image_${Date.now()}.png`, {
      type: blob.type,
    });

    const { url, path } = await uploadFile(file, "images", realArticleId);
    uploadedImagePaths.push(path);
    html = html.replace(base64Data, url);
  }

  // 이전 이미지와 비교하여 삭제
  const currentImages = extractImagePathsFromHtml(html);
  const unusedImages = prevImages.filter(
    (path) => !currentImages.includes(path),
  );
  if (unusedImages.length) await deleteFiles(unusedImages);

  // 새로 업로드할 파일만
  const onlyNewFiles = files.filter((f) => f instanceof File);
  const uploadedFiles = [];
  for (const file of onlyNewFiles) {
    const uploaded = await uploadFile(file, "files", realArticleId);
    uploadedFiles.push(uploaded);
  }

  const existingKeptFiles = files.filter((f) => !(f instanceof File));
  const finalFiles = [...existingKeptFiles, ...uploadedFiles];

  // 삭제 대상 계산
  const prevPaths = prevFiles.map((f) => f.path);
  const currentPaths = finalFiles.map((f) => f.path);
  const unusedFiles = prevPaths.filter((path) => !currentPaths.includes(path));
  if (unusedFiles.length) await deleteFiles(unusedFiles);

  // Supabase 업데이트
  const regex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?>/i;
  const match = html.match(regex);
  const updatePayload = {
    title,
    author,
    content: html,
    thumbnail_image: match?.[1] ?? null,
    files: finalFiles,
  };

  const { error } = await supabase
    .from("articles")
    .update(updatePayload)
    .eq("id", realArticleId);
  if (error) throw error;

  return realArticleId;
};

export const handleFileDelete = async ({ supabase, article }) => {
  const images = extractImagePathsFromHtml(JSON.stringify(article));
  const filePaths = article.files?.map((f) => f.path) || [];
  await deleteFiles([...images, ...filePaths]);
  await supabase.from("articles").delete().eq("id", article.id);
};

// import {
//   uploadFile,
//   deleteFiles,
//   extractImagePathsFromHtml,
// } from "./storageUtils";

// export const handleFileUpload = async ({
//   supabase,
//   articleId,
//   title,
//   author,
//   html,
//   files,
//   prevFiles,
//   prevImages,
// }) => {
//   let realArticleId = articleId;

//   if (!realArticleId) {
//     const { data, error } = await supabase
//       .from("articles")
//       .insert({ title: "(임시)", content: "", files: [] })
//       .select("id")
//       .single();
//     if (error || !data?.id) throw new Error("게시글 ID 생성 실패");
//     realArticleId = data.id;
//   }

//   // Base64 이미지 → Supabase 업로드
//   const base64Regex = /<img src="data:image\/[^;]+;base64[^"]+"[^>]*>/g;
//   const imgTagMatches = html.match(base64Regex) || [];
//   const uploadedImagePaths = [];

//   for (const tag of imgTagMatches) {
//     const srcMatch = tag.match(/src=\"([^\"]+)\"/);
//     if (!srcMatch) continue;

//     const base64Data = srcMatch[1];
//     const blob = await (await fetch(base64Data)).blob();
//     const file = new File([blob], `image_${Date.now()}.png`, {
//       type: blob.type,
//     });

//     const { url, path } = await uploadFile(file, "images", realArticleId);
//     uploadedImagePaths.push(path);
//     html = html.replace(base64Data, url);
//   }

//   // 이전 이미지와 비교하여 삭제
//   const currentImages = extractImagePathsFromHtml(html);
//   const unusedImages = prevImages.filter(
//     (path) => !currentImages.includes(path),
//   );
//   if (unusedImages.length) await deleteFiles(unusedImages);

//   // 새로 업로드할 파일만
//   const onlyNewFiles = files.filter((f) => f instanceof File);
//   const uploadedFiles = [];
//   for (const file of onlyNewFiles) {
//     const uploaded = await uploadFile(file, "files", realArticleId);
//     uploadedFiles.push(uploaded);
//   }

//   const existingKeptFiles = files.filter((f) => !(f instanceof File));
//   const finalFiles = [...existingKeptFiles, ...uploadedFiles];

//   // 삭제 대상 계산
//   const prevPaths = prevFiles.map((f) => f.path);
//   const currentPaths = finalFiles.map((f) => f.path);
//   const unusedFiles = prevPaths.filter((path) => !currentPaths.includes(path));
//   if (unusedFiles.length) await deleteFiles(unusedFiles);

//   // Supabase 업데이트
//   const regex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?>/i;
//   const match = html.match(regex);
//   const updatePayload = {
//     title,
//     author,
//     content: html,
//     thumbnail_image: match?.[1] ?? null,
//     files: finalFiles,
//   };

//   const { error } = await supabase
//     .from("articles")
//     .update(updatePayload)
//     .eq("id", realArticleId);
//   if (error) throw error;

//   return realArticleId;
// };

// export const handleFileDelete = async ({ supabase, article }) => {
//   const images = extractImagePathsFromHtml(JSON.stringify(article));
//   const filePaths = article.files?.map((f) => f.path) || [];
//   await deleteFiles([...images, ...filePaths]);
//   await supabase.from("articles").delete().eq("id", article.id);
// };
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
  imagesBodo, // 추가됨
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

  // 썸네일 결정 로직: 본문 이미지 우선, 없으면 imagesBodo[0]
  const regex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?>/i;
  const match = html.match(regex);
  const thumbnail =
    match?.[1] || (imagesBodo && imagesBodo.length > 0 ? imagesBodo[0] : null);

  // Supabase 업데이트
  const updatePayload = {
    title,
    author,
    content: html,
    thumbnail_image: thumbnail, // 결정된 썸네일 사용
    files: finalFiles,
    images_bodo: imagesBodo, // 수정된 images_bodo 저장
  };

  const { error } = await supabase
    .from("articles")
    .update(updatePayload)
    .eq("id", realArticleId);
  if (error) throw error;

  return realArticleId;
};

export const handleFileDelete = async ({ supabase, article }) => {
  const articleId = article.id;
  if (!articleId) return;

  try {
    const bucketName = "public-bucket";
    // 실제 파일들이 저장된 상위 경로를 포함해야 합니다.
    const folderPath = `admin/images/${articleId}`;

    // 1. 해당 폴더 내의 파일 목록 가져오기
    const { data: list, error: listError } = await supabase.storage
      .from(bucketName)
      .list(folderPath); // 경로 수정

    console.log("조회된 파일 목록:", list);

    if (listError) {
      console.error("목록 조회 실패:", listError);
    } else if (list && list.length > 0) {
      // 2. 삭제 시에도 '상위경로/파일명' 형태의 전체 경로 배열이 필요합니다.
      const filesToRemove = list.map((f) => `${folderPath}/${f.name}`);

      const { data: removedData, error: removeError } = await supabase.storage
        .from(bucketName)
        .remove(filesToRemove);

      if (removeError) {
        console.error("Storage 파일 삭제 실패:", removeError);
      } else {
        console.log("Storage 삭제 성공:", removedData);
      }
    }

    // 3. DB 레코드 삭제
    const { error: dbError } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId);

    if (dbError) throw dbError;
  } catch (err) {
    console.error("기사 삭제 중 오류 발생:", err);
    throw err;
  }
};

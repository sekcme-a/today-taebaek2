import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// 파일 업로드
export async function uploadFile(file, folder = "files", postId = "common") {
  const supabase = createBrowserSupabaseClient();

  const extension = file.name.split(".").pop();
  const safeFilename = `${crypto.randomUUID()}.${extension}`;
  const path = `admin/${folder}/${postId}/${safeFilename}`;

  const { error } = await supabase.storage
    .from("public-bucket")
    .upload(path, file);

  if (error) throw error;

  return {
    path,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-bucket/${path}`,
    title: file.name,
  };
}

// 파일/이미지 삭제
export async function deleteFiles(paths = []) {
  const supabase = createBrowserSupabaseClient();

  console.log(paths);
  if (!paths.length) return;

  const cleanedPaths = paths
    .map((p) => {
      if (!p) return null;

      return typeof p === "string"
        ? p.replace(/^\/+/, "")
        : p.path.replace(/^\/+/, "");
    })
    .filter(Boolean);

  const { data, error } = await supabase.storage
    .from("public-bucket")
    .remove(cleanedPaths);

  console.log("삭제 대상:", cleanedPaths);
  if (error) {
    console.error("삭제 실패:", error.message);
    throw error;
  } else {
    console.log("삭제 성공:", data);
  }
}

// HTML 내 이미지 경로 추출
export function extractImagePathsFromHtml(html) {
  const regex = /https:\/\/[^"]+\/public-bucket\/([^"]+)"/g;
  const paths = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) {
    console.log(match[1]);
    paths.add(match[1]);
  }
  return [...paths];
}

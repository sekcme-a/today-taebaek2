"use client";

import { useState } from "react";
import Papa from "papaparse";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function CsvUploader() {
  const supabase = createBrowserSupabaseClient();
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus("CSV 파일을 읽는 중...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await processAndUpload(results.data);
      },
      error: (error) => {
        console.error(error);
        setStatus("파일 읽기 오류 발생");
        setUploading(false);
      },
    });
  };

  const processAndUpload = async (data) => {
    setStatus(`${data.length}개의 데이터를 처리 중...`);

    const transformedData = data.map((row) => {
      // 1. images 데이터 파싱 (JSON 문자열일 경우 대비)
      let imagesArray = [];
      try {
        imagesArray =
          typeof row.images === "string" ? JSON.parse(row.images) : row.images;
      } catch (e) {
        imagesArray = [];
      }

      // 2. thumbnail_image 추출 (첫 번째 이미지 경로)
      const firstImage =
        Array.isArray(imagesArray) && imagesArray.length > 0
          ? imagesArray[0]
          : null;

      // 3. 현재 테이블 구조에 맞게 매핑
      return {
        id: row.id,
        title: row.title || "제목 없음",
        content: row.content,
        created_at: row.created_at,
        subtitle: row.subtitle,
        author: row.author,
        // 예전 images를 현재 images_bodo로 이동
        images_bodo: imagesArray,
        // 첫 번째 이미지를 썸네일로 저장
        thumbnail_image: firstImage,
        // category_id 및 category 관련 필드는 무시하거나 null 처리
        category_main: null,
        category: null,
        files: null, // 필요 시 추가 로직 작성
        image_descriptions: null,
      };
    });

    try {
      // Supabase insert (성능을 위해 100개씩 끊어서 업로드하는 것이 좋으나, 여기선 일괄 처리)
      const { error } = await supabase.from("articles").insert(transformedData);

      if (error) throw error;

      setStatus("성공적으로 업로드되었습니다!");
    } catch (error) {
      console.error(error);
      setStatus(`업로드 실패: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Article CSV 마이그레이션</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {status && <p className="mt-4 text-sm font-medium">{status}</p>}
    </div>
  );
}

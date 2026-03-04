// "use client";

// import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// export default function CheckMissingCategories() {
//   const supabase = createBrowserSupabaseClient();

//   const fetchOrphanedArticles = async () => {
//     console.log("데이터 추출을 시작합니다...");

//     // article_categories와 LEFT JOIN 하여 연결 데이터가 없는(null) 행만 필터링
//     const { data, error } = await supabase
//       .from("articles")
//       .select(
//         `
//         id,
//         title,
//         article_categories!left(article_id)
//       `,
//       )
//       .is("article_categories", null);

//     if (error) {
//       console.error("데이터를 가져오는 중 오류 발생:", error.message);
//       return;
//     }

//     if (data && data.length > 0) {
//       console.log("--- 카테고리가 없는 게시글 목록 ---");
//       // 출력 시 가독성을 위해 map으로 정리하여 출력
//       const result = data.map((item) => ({
//         id: item.id,
//         title: item.title,
//       }));

//       console.table(result); // 테이블 형식으로 예쁘게 출력
//       console.log("총 개수:", result.length);
//     } else {
//       console.log("카테고리가 없는 게시글이 없습니다.");
//     }
//   };

//   return (
//     <div className="p-4 border rounded-lg bg-gray-50">
//       <h2 className="text-lg font-bold mb-2">데이터 무결성 검사</h2>
//       <p className="text-sm text-gray-600 mb-4">
//         카테고리가 연결되지 않은 게시글을 찾아 콘솔에 출력합니다.
//       </p>
//       <button
//         onClick={fetchOrphanedArticles}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//       >
//         미분류 데이터 추출 (Console)
//       </button>
//     </div>
//   );
// }

//8********************************************************************************************************************************************************************************
// "use client";

// import { createBrowserSupabaseClient } from "@/utils/supabase/client";
// import { useState } from "react";

// export default function CategoryUploader() {
//   const supabase = createBrowserSupabaseClient();
//   const [jsonInput, setJsonInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState(null);

//   const handleUpload = async () => {
//     setLoading(true);
//     setStatus(null);

//     try {
//       // 1. JSON 문자열 파싱
//       const rawData = JSON.parse(jsonInput);

//       // 데이터 형식 검증 (단순 배열 여부 확인)
//       if (!Array.isArray(rawData)) {
//         throw new Error("데이터는 [{}, {}] 형식의 배열이어야 합니다.");
//       }

//       // 2. Supabase Insert 실행
//       // is_main은 스키마에서 기본값이 false이므로 생략 가능합니다.
//       const { data, error } = await supabase
//         .from("article_categories")
//         .insert(rawData)
//         .select();

//       if (error) throw error;

//       setStatus({
//         type: "success",
//         message: `${data.length}개의 데이터가 성공적으로 저장되었습니다.`,
//       });
//       setJsonInput(""); // 성공 시 입력창 초기화
//     } catch (err) {
//       console.error(err);
//       setStatus({
//         type: "error",
//         message: err.message || "데이터 저장 중 오류가 발생했습니다.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
//       <h2 className="text-xl font-bold text-gray-800">
//         카테고리 매핑 데이터 업로드
//       </h2>

//       <textarea
//         className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//         placeholder='[{"article_id": "uuid-1", "category_slug": "tech"}, {"article_id": "uuid-1", "category_slug": "ai"}]'
//         value={jsonInput}
//         onChange={(e) => setJsonInput(e.target.value)}
//       />

//       <button
//         onClick={handleUpload}
//         disabled={loading || !jsonInput.trim()}
//         className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors
//           ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
//       >
//         {loading ? "저장 중..." : "데이터 저장하기"}
//       </button>

//       {status && (
//         <div
//           className={`p-3 rounded-lg text-sm ${status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
//         >
//           {status.message}
//         </div>
//       )}
//     </div>
//   );
// }

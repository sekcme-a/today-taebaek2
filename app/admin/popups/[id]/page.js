"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function PopupEditor() {
  const supabase = createBrowserSupabaseClient();

  const { id } = useParams();
  const isEdit = id !== "new";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    link_url: "",
    priority: 0,
    is_active: true,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (isEdit) fetchPopup();
  }, [id]);

  const fetchPopup = async () => {
    const { data } = await supabase
      .from("popups")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setForm(data);
      setPreview(data.image_url);
    }
  };

  const handleUpload = async () => {
    if (!file) return form.image_url;

    const fileExt = file.name.split(".").pop();
    // 경로를 파일명 앞에 붙입니다. (admin/popups/파일명)
    const fileName = `admin/popups/${Date.now()}.${fileExt}`;

    // 1. 파일 업로드 (버킷 이름 확인: 'public-bucket')
    const { data, error } = await supabase.storage
      .from("public-bucket")
      .upload(fileName, file, {
        upsert: true, // 동일한 경로에 파일이 있을 경우 덮어쓰기 설정
      });

    if (error) throw error;

    // 2. Public URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from("public-bucket").getPublicUrl(fileName);

    return publicUrl;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const image_url = await handleUpload();
      const payload = { ...form, image_url };

      if (isEdit) {
        await supabase.from("popups").update(payload).eq("id", id);
      } else {
        await supabase.from("popups").insert([payload]);
      }
      router.push("/admin/popups");
    } catch (err) {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl mt-10 shadow-xl border border-gray-50">
      <h1 className="text-xl font-bold mb-6">
        {isEdit ? "팝업 수정" : "새 팝업 등록"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">제목</label>
          <input
            type="text"
            className="w-full p-3 mt-1 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/5"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">이미지</label>
          <input
            type="file"
            className="block w-full text-xs text-gray-500 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
          {preview && (
            <img
              src={preview}
              className="mt-4 rounded-2xl w-full h-48 object-cover border border-gray-100"
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            이동 링크 (선택)
          </label>
          <input
            type="text"
            className="w-full p-3 mt-1 bg-gray-50 rounded-xl outline-none"
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-600">
              우선순위 (높을수록 먼저)
            </label>
            <input
              type="number"
              className="w-full p-3 mt-1 bg-gray-50 rounded-xl outline-none"
              value={form.priority}
              // 수정된 코드
              onChange={(e) => {
                const val = e.target.value;
                setForm({
                  ...form,
                  // 빈 값이면 0 혹은 '', 숫자가 가능하면 정수로 변환
                  priority: val === "" ? 0 : parseInt(val),
                });
              }}
            />
          </div>
          <div className="flex flex-col justify-center items-center">
            <label className="text-sm font-medium text-gray-600 mb-2">
              활성화
            </label>
            <input
              type="checkbox"
              className="w-6 h-6 accent-black"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-2xl font-semibold hover:opacity-90 transition disabled:bg-gray-400"
        >
          {loading ? "처리 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
}

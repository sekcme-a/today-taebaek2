"use client";

import React, { useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button, TextField } from "@mui/material";

import { handleImageInsert, modules } from "./EditorToolbar";
import { handleFileUpload, handleFileDelete } from "./fileUtils";
import { extractImagePathsFromHtml } from "./storageUtils";
import "react-quill-new/dist/quill.snow.css";
import CategorySelector from "./CategorySelector/CategorySelector";
import MainArticleSetterDialog from "./MainArticleSetterDialog";
import { useAuth } from "@/providers/AuthProvider";
import ChatGptButton from "./ChatGptButton";
import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function ArticleEditor({
  article = null,
  prevSelectedCategories,
}) {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const { profile, user } = useAuth();

  const articleId = article?.id || null;

  const [title, setTitle] = useState(article?.title || "");
  const [author, setAuthor] = useState(
    article?.author || profile.display_name || "",
  );
  const [files, setFiles] = useState(article?.files || []);
  const [prevFiles, setPrevFiles] = useState(article?.files || []);
  const [prevImages, setPrevImages] = useState(
    article ? extractImagePathsFromHtml(article.content) : [],
  );

  const quillRef = useRef();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState(
    prevSelectedCategories || [],
  );

  const [isMainArticleDialogOpen, setIsMainArticleDialogOpen] = useState(false);

  const handleRemoveFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const editor = quillRef.current.getEditor();
      let html = editor.root.innerHTML;

      // 1. 아티클 내용 저장 및 article_id 확보
      const realArticleId = await handleFileUpload({
        supabase,
        articleId,
        title,
        author,
        html,
        files,
        prevFiles,
        prevImages,
      });

      console.log(selectedCategories);
      // 2. 카테고리 연결 업데이트 로직 추가
      // 현재 아티클의 기존 카테고리 목록 가져오기
      const { data: existingLinks, error: existingError } = await supabase
        .from("article_categories")
        .select("category_slug")
        .eq("article_id", realArticleId);

      if (existingError) {
        throw new Error(
          "기존 카테고리 조회 중 오류 발생: " + existingError.message,
        );
      }

      // 기존 slug 배열
      const existingSlugs = existingLinks.map((link) => link.category_slug);

      // 선택된 category_id → slug 로 변환
      const selectedCategorySlugsPromises = selectedCategories.map(
        async (categoryId) => {
          const { data: category, error } = await supabase
            .from("categories")
            .select("slug")
            .eq("id", categoryId)
            .single();

          if (error) throw error;
          return category.slug;
        },
      );
      const selectedSlugs = await Promise.all(selectedCategorySlugsPromises);

      // 추가해야 할 slug
      const slugsToAdd = selectedSlugs.filter(
        (slug) => !existingSlugs.includes(slug),
      );
      // 삭제해야 할 slug
      const slugsToRemove = existingSlugs.filter(
        (slug) => !selectedSlugs.includes(slug),
      );

      // 삭제
      if (slugsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("article_categories")
          .delete()
          .in("category_slug", slugsToRemove)
          .eq("article_id", realArticleId);

        if (deleteError) {
          throw new Error("카테고리 삭제 중 오류 발생: " + deleteError.message);
        }
      }

      // 추가
      if (slugsToAdd.length > 0) {
        const newLinks = slugsToAdd.map((slug) => ({
          article_id: realArticleId,
          category_slug: slug,
        }));

        const { error: insertError } = await supabase
          .from("article_categories")
          .insert(newLinks);

        if (insertError) {
          throw new Error("카테고리 추가 중 오류 발생: " + insertError.message);
        }
      }

      console.log("카테고리 업데이트 완료", {
        add: slugsToAdd,
        remove: slugsToRemove,
      });

      setPrevImages(extractImagePathsFromHtml(html));
      // console.log(html);
      setPrevFiles(files);
      setFiles(files);

      alert("성공적으로 저장되었습니다.");
      if (!article) router.replace(`/admin/articles/${realArticleId}`);
      // else router.back();
    } catch (err) {
      console.error(err);
      alert("저장 중 오류 발생");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!article?.id) return;

      await handleFileDelete({ supabase, article });
      alert("삭제 완료");
      router.back();
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류 발생");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <TextField
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />
      <TextField
        label="작성자"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />
      <CategorySelector
        selectedCategories={selectedCategories}
        onChange={(cat) => setSelectedCategories(cat)}
      />
      <Button
        variant="outlined"
        sx={{ my: 1 }}
        onClick={() => setIsMainArticleDialogOpen(true)}
        disabled={!articleId || articleId === "new" || !title}
      >
        메인 기사 설정
      </Button>
      {articleId !== "new" && article && (
        <ChatGptButton
          title={title}
          content={htmlToPlainString(article.content)}
        />
      )}
      <MainArticleSetterDialog
        open={isMainArticleDialogOpen}
        onClose={() => setIsMainArticleDialogOpen(false)}
        articleId={articleId}
        articleTitle={title}
      />
      <ReactQuill
        ref={quillRef}
        defaultValue={article?.content || ""}
        modules={modules({ handleImageInsert, quillRef })}
        theme="snow"
      />
      <div>
        {/* <input
          type="file"
          multiple
          onChange={(e) =>
            setFiles((prev) => [...prev, ...Array.from(e.target.files)])
          }
        /> */}
        <ul className="mt-2 text-sm text-gray-600">
          {files.map((file, idx) => (
            <li key={idx} className="flex items-center gap-2">
              📎 {file.name ?? file.title}
              <button
                type="button"
                onClick={() => handleRemoveFile(idx)}
                className="text-red-500 hover:underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-x-2 mt-10">
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "저장 중..." : "저장"}
        </Button>
        {article?.id && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            sx={{ ml: 2 }}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        )}
      </div>
    </div>
  );
}

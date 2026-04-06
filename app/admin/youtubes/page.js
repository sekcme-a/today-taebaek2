"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

const getYouTubeThumbnail = (url) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[7].length === 11 ? match[7] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};

// --- 개별 아이템 컴포넌트 ---
function SortableItem({ link, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    boxShadow: isDragging
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      : "0 1px 3px rgba(0,0,0,0.05)",
    listStyle: "none",
  };

  const thumb = getYouTubeThumbnail(link.url);

  return (
    <li ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          marginRight: "16px",
          color: "#9ca3af",
          padding: "8px",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>

      {thumb && (
        <img
          src={thumb}
          alt="thumbnail"
          style={{
            width: "80px",
            height: "45px",
            borderRadius: "6px",
            objectFit: "cover",
            marginRight: "16px",
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <strong
          style={{
            display: "block",
            fontSize: "1rem",
            color: "#111827",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {link.title}
        </strong>
        <span style={{ fontSize: "0.85rem", color: "#6366f1" }}>
          {link.url}
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
        {/* 수정 버튼 */}
        <button
          onClick={() => onEdit(link)}
          style={{
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "600",
          }}
        >
          수정
        </button>
        {/* 삭제 버튼 */}
        <button
          onClick={() => onDelete(link.id)}
          style={{
            backgroundColor: "#fef2f2",
            color: "#ef4444",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "600",
          }}
        >
          삭제
        </button>
      </div>
    </li>
  );
}

// --- 메인 페이지 컴포넌트 ---
export default function YoutubeAdmin() {
  const supabase = createBrowserSupabaseClient();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 편집 관련 상태
  const [editingId, setEditingId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data } = await supabase
      .from("youtube_links")
      .select("*")
      .order("sort_order", { ascending: true });
    setLinks(data || []);
  };

  // 수정 버튼 클릭 시 실행
  const handleEditClick = (link) => {
    setEditingId(link.id);
    setTitle(link.title);
    setUrl(link.url);
    window.scrollTo({ top: 0, behavior: "smooth" }); // 폼이 있는 상단으로 이동
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (editingId) {
      // --- 수정 로직 (UPDATE) ---
      const { error } = await supabase
        .from("youtube_links")
        .update({ title, url })
        .eq("id", editingId);

      if (!error) {
        setEditingId(null);
        setTitle("");
        setUrl("");
        await fetchLinks();
      }
    } else {
      // --- 신규 등록 로직 (INSERT) ---
      const nextOrder =
        links.length > 0 ? Math.max(...links.map((l) => l.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from("youtube_links")
        .insert([{ title, url, sort_order: nextOrder }]);

      if (!error) {
        setTitle("");
        setUrl("");
        await fetchLinks();
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (confirm("정말 이 링크를 삭제하시겠습니까?")) {
      await supabase.from("youtube_links").delete().eq("id", id);
      if (editingId === id) cancelEdit();
      fetchLinks();
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      const newOrderedList = arrayMove(links, oldIndex, newIndex);
      setLinks(newOrderedList);

      const updates = newOrderedList.map((link, index) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        sort_order: index,
      }));

      const { error } = await supabase.from("youtube_links").upsert(updates);
      if (error) fetchLinks();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <header style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            📺 유튜브 링크 관리
          </h1>
          {editingId && (
            <p style={{ color: "#6366f1", fontSize: "0.9rem" }}>
              현재 항목을 수정 중입니다.
            </p>
          )}
        </header>

        {/* 입력/수정 카드 */}
        <section
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            marginBottom: "32px",
            border: editingId ? "2px solid #6366f1" : "1px solid transparent",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  영상 제목
                </label>
                <input
                  placeholder="예: 2024 신작 소개"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  URL
                </label>
                <input
                  placeholder="https://youtube.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: "14px",
                  backgroundColor: editingId ? "#059669" : "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {isSubmitting
                  ? "처리 중..."
                  : editingId
                    ? "수정 완료"
                    : "영상 추가하기"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: "14px 20px",
                    backgroundColor: "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </section>

        {/* 리스트 섹션 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul style={{ padding: 0, margin: 0 }}>
              {links.map((link) => (
                <SortableItem
                  key={link.id}
                  link={link}
                  onDelete={handleDelete}
                  onEdit={handleEditClick}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {links.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#9ca3af",
              border: "2px dashed #e5e7eb",
              borderRadius: "16px",
            }}
          >
            등록된 영상이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

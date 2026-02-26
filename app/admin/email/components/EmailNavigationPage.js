import {
  Button,
  Stack,
  Typography,
  Paper,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBackIos,
  ArrowForwardIos,
  CloudUpload,
  Save,
  Download,
} from "@mui/icons-material";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const TEXT = `아래의 문장은 hwp파일에 들어있는 보도자료들을 복사한거야. 규칙에 맞게 json 형태로 변환해줘. 
1. 데이터 형식은 [{title, content, slug}] 
2. 기사의 내용은 절때 바꾸면 안되. 
3. 보도자료 내용이 길어도 모든 보도자료를 추출해줘. “…” 와 같은 방식으로 content 데이터를 자르면 안되.
4. JSON형식의 코드로만 대답하고, 다른 부가적인 설명이나 말 하지마.
5.`;

const IMG_TEXT = `기사 JSON와 이미지명 JSON을 합쳐줘. 이미지명을 통해 각 기사에 맞는 이미지가 들어가야되.
1. 데이터 형식: [{title, content, slug, images:[]}]
2. JSON형식의 코드로만 대답하고, 다른 부가적인 설명이나 말 하지마.
3. 기사가 1개라면, 모든 이미지가 그 기사에 해당돼.
`;

// MIME 타입별 확장자 매핑 테이블
const MIME_EXT_MAP = {
  // 문서
  "application/x-hwp": "hwp",
  "application/haansofthwp": "hwp",
  "application/vnd.hancom.hwp": "hwp",
  "application/x-tika-msoffice": "doc",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/html": "html",

  // 이미지
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/webp": "webp",
  "image/svg+xml": "svg",

  // 압축 파일
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/x-rar-compressed": "rar",
  "application/x-7z-compressed": "7z",
  "application/x-tar": "tar",
};

export function EmailNavigationPage({ selectedEmails, onGoBack }) {
  const supabase = createBrowserSupabaseClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [files, setFiles] = useState([]);
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [titleContentJson, setTitleContentJson] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");

  const currentMail = selectedEmails[currentIndex];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("slug")
      .eq("parent_id", "422d1e7f-6582-4fe6-8362-ed7e83c04ec3");
    const text = data?.map((item) => item.slug).join(",") || "";
    setAiInstruction(
      `${TEXT} "${text}" 중에 가장 어울리는 주제 하나 선택해 slug에 추가해.`,
    );
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });
  const showToast = (message, severity = "info") =>
    setToast({ open: true, message, severity });

  const handleImageCompression = useCallback(async (rawFiles) => {
    const options = {
      maxSizeMB: 0.7,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    setIsCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        rawFiles.map(async (file) => {
          try {
            const compressedBlob = await imageCompression(file, options);
            return new File([compressedBlob], file.name, { type: file.type });
          } catch (err) {
            return file;
          }
        }),
      );
      setFiles((prev) => [...prev, ...compressedFiles]);
      showToast(
        `${compressedFiles.length}개의 이미지가 추가되었습니다.`,
        "success",
      );
    } finally {
      setIsCompressing(false);
    }
  }, []);

  useEffect(() => {
    const handlePaste = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      const items = event.clipboardData?.items;
      const pastedFiles = [];
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              const ext = file.type.split("/")[1] || "png";
              pastedFiles.push(
                new File([file], `pasted-${Date.now()}-${i}.${ext}`, {
                  type: file.type,
                }),
              );
            }
          }
        }
      }
      if (pastedFiles.length > 0) handleImageCompression(pastedFiles);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageCompression]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageCompression,
    accept: { "image/*": [] },
  });

  // --- [수정된 부분] 통합 다운로드 핸들러 (확장자 복구 로직 포함) ---
  const handleDownload = async () => {
    if (!currentMail) return;
    setIsDownloading(true);
    showToast("파일 확장자를 확인하며 압축하는 중...", "info");

    const mainZip = new JSZip();

    try {
      // 1. 대용량 파일 처리 (Proxy 활용 및 확장자 추론)
      const bigUrls = currentMail.bigFileUrls;
      const urlList = Array.isArray(bigUrls)
        ? bigUrls
        : bigUrls
          ? [bigUrls]
          : [];

      const bigFilePromises = urlList.map(async (url, idx) => {
        try {
          const res = await fetch(
            `/api/proxy-download?url=${encodeURIComponent(url)}`,
          );
          if (!res.ok) throw new Error();

          const blob = await res.blob();
          const contentType = res.headers
            .get("Content-Type")
            ?.split(";")[0]
            .toLowerCase();

          // 기본 파일명 추출
          let fileName =
            url.split("/").filter(Boolean).pop()?.split("?")[0] ||
            `file-${idx + 1}`;

          // 파일명에 점(.)이 없거나 확장자가 의심될 때 MIME 타입으로 확장자 추가
          const hasExtension = fileName.includes(".");
          if (!hasExtension && contentType && MIME_EXT_MAP[contentType]) {
            fileName = `${fileName}.${MIME_EXT_MAP[contentType]}`;
          }

          mainZip.file(fileName, blob);
        } catch (err) {
          console.error("대용량 파일 다운로드 실패:", url);
        }
      });

      // 2. 일반 첨부파일 처리 (내부 파일 추출)
      const mainResponse = await fetch(`/api/mail/download/${currentMail.uid}`);
      if (mainResponse.ok) {
        const mainBlob = await mainResponse.blob();
        const tempZip = new JSZip();
        const loadedZip = await tempZip.loadAsync(mainBlob);

        const extractPromises = [];
        loadedZip.forEach((relativePath, file) => {
          if (!file.dir) {
            extractPromises.push(
              file
                .async("blob")
                .then((content) => mainZip.file(relativePath, content)),
            );
          }
        });
        await Promise.all(extractPromises);
      }

      await Promise.all(bigFilePromises);

      // 3. 저장
      const finalZipContent = await mainZip.generateAsync({ type: "blob" });
      saveAs(finalZipContent, `${currentMail.subject || "download"}.zip`);
      showToast("모든 파일이 통합되어 다운로드되었습니다.", "success");
    } catch (error) {
      showToast("다운로드 중 오류가 발생했습니다.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToSupabase = async () => {
    if (!jsonInput) return showToast("JSON 데이터를 입력해주세요.", "warning");
    setIsSubmitting(true);
    try {
      const parsedData = JSON.parse(jsonInput);
      for (const article of parsedData) {
        const { data: inserted, error: dbErr } = await supabase
          .from("articles")
          .insert({ title: article.title, content: article.content })
          .select()
          .single();
        if (dbErr) throw dbErr;

        const publicUrls = [];
        for (const fileName of article.images || []) {
          const file = files.find(
            (f) => f.name.normalize("NFC") === fileName.normalize("NFC"),
          );
          if (!file) continue;
          const path = `admin/images/${inserted.id}/${uuidv4()}.${file.name.split(".").pop()}`;
          const { error: upErr } = await supabase.storage
            .from("public-bucket")
            .upload(path, file);
          if (upErr) throw upErr;
          const {
            data: { publicUrl },
          } = supabase.storage.from("public-bucket").getPublicUrl(path);
          publicUrls.push(publicUrl);
        }

        await supabase
          .from("articles")
          .update({
            images_bodo: publicUrls,
            thumbnail_image: publicUrls[0] || null,
          })
          .eq("id", inserted.id);

        await supabase
          .from("article_categories")
          .insert({ article_id: inserted.id, category_slug: article.slug });
      }
      showToast("성공적으로 저장되었습니다.", "success");
      setFiles([]);
      setJsonInput("");
    } catch (error) {
      showToast(`에러: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 800, margin: "0 auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <IconButton
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h6">
          {currentIndex + 1} / {selectedEmails.length} 번째 메일
        </Typography>
        <IconButton
          disabled={currentIndex === selectedEmails.length - 1}
          onClick={() => setCurrentIndex(currentIndex + 1)}
        >
          <ArrowForwardIos />
        </IconButton>
      </Stack>

      <Paper variant="outlined" sx={{ p: 4, bgcolor: "#f9f9f9" }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          className="line-clamp-1"
        >
          [제목] {currentMail?.subject}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="line-clamp-1"
        >
          [발신] {currentMail?.from}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Button
          fullWidth
          variant="contained"
          sx={{ height: 50, mb: 1 }}
          onClick={() => {
            navigator.clipboard.writeText(aiInstruction);
            showToast("지시문 복사됨");
          }}
        >
          지시문 복사
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleDownload}
          disabled={isDownloading}
          startIcon={
            isDownloading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Download />
            )
          }
          sx={{ height: 50, mb: 3 }}
        >
          {isDownloading
            ? "파일 수집 및 압축 중..."
            : "전체 첨부파일 통합 다운로드"}
        </Button>

        <TextField
          label="AI 지시문 결과 (기사 JSON)"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={titleContentJson}
          onChange={(e) => setTitleContentJson(e.target.value)}
          sx={{ mb: 3, bgcolor: "white" }}
        />

        <Box
          {...getRootProps()}
          sx={{
            p: 3,
            border: "2px dashed #ccc",
            borderRadius: 2,
            textAlign: "center",
            bgcolor: isDragActive ? "#e3f2fd" : "#fff",
            cursor: "pointer",
            mb: 2,
          }}
        >
          <input {...getInputProps()} />
          {isCompressing ? (
            <CircularProgress size={24} />
          ) : (
            <Typography>이미지 드래그 또는 붙여넣기 (Ctrl+V)</Typography>
          )}
          <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
            선택된 파일: {files.length}개
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          disabled={files.length === 0}
          sx={{ my: 1 }}
          onClick={() => {
            navigator.clipboard.writeText(
              `${IMG_TEXT}\n\n***이미지명***\n${JSON.stringify(
                files.map((f) => f.name),
                null,
                2,
              )}\n\n***기사***\n${titleContentJson}`,
            );
            showToast("AI 프롬프트 복사됨");
          }}
        >
          이미지 포함 AI 명령어 복사
        </Button>

        <TextField
          label="최종 통합 JSON 데이터 입력"
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          sx={{ mb: 3, bgcolor: "white" }}
        />

        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          startIcon={<Save />}
          onClick={handleSaveToSupabase}
          disabled={isSubmitting || isCompressing}
        >
          {isSubmitting ? "저장 중..." : "Supabase에 저장하기"}
        </Button>
      </Paper>

      <Button variant="text" onClick={onGoBack}>
        목록으로 돌아가기
      </Button>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

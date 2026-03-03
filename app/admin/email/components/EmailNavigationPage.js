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
  LinearProgress, // 추가
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
import { emailLog } from "../utils/emailLog";

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

const MIME_EXT_MAP = {
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
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/webp": "webp",
  "image/svg+xml": "svg",
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
  const [downloadProgress, setDownloadProgress] = useState(0); // 진행률 상태 추가
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
    const { data } = await supabase.from("categories").select("slug");
    const text = data?.map((item) => item.slug).join(",") || "";
    setAiInstruction(
      `${TEXT} "${text}" 중에 가장 어울리는 주제 하나 선택해 slug에 추가해.\n\n`,
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
              // 1. 파일 이름이 존재하면(파일 형태 복사) 그대로 사용,
              // 2. 이름이 없으면(스크린샷 등) 기본값 지정
              const originalName = file.name || `pasted-${Date.now()}-${i}`;

              pastedFiles.push(
                new File([file], originalName, {
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

  // --- [수정된 부분] 다운로드 진행률 반영 로직 ---
  const handleDownload = async () => {
    if (!currentMail) return;
    setIsDownloading(true);
    setDownloadProgress(0); // 초기화

    const mainZip = new JSZip();

    try {
      const bigUrls = currentMail.bigFileUrls;
      const urlList = Array.isArray(bigUrls)
        ? bigUrls
        : bigUrls
          ? [bigUrls]
          : [];

      // 전체 작업 수 계산 (대용량 파일 수 + 일반 첨부파일 1뭉치)
      const totalTasks = urlList.length + 1;
      let completedTasks = 0;

      const updateProgress = () => {
        completedTasks++;
        setDownloadProgress(Math.round((completedTasks / totalTasks) * 100));
      };

      // 1. 대용량 파일 처리
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

          let fileName =
            url.split("/").filter(Boolean).pop()?.split("?")[0] ||
            `file-${idx + 1}`;

          // 확장자 추출 (소문자 변환)
          const extension = fileName.split(".").pop().toLowerCase();

          // --- [추가된 필터링 로직] ---
          // 1. 확장자가 hwp, hwpx인 경우
          // 2. 또는 MIME 타입이 한글 관련인 경우
          const isHwp =
            ["hwp", "hwpx"].includes(extension) ||
            contentType?.includes("hwp") ||
            contentType?.includes("haansofthwp");

          if (!isHwp) {
            console.log(`한글 파일이 아니므로 제외됨: ${fileName}`);
            return; // 한글 파일이 아니면 여기서 중단하여 zip에 추가하지 않음
          }
          // --------------------------

          const hasExtension = fileName.includes(".");
          if (!hasExtension && contentType && MIME_EXT_MAP[contentType]) {
            fileName = `${fileName}.${MIME_EXT_MAP[contentType]}`;
          }

          mainZip.file(fileName, blob);
        } catch (err) {
          console.error("대용량 파일 다운로드 실패:", url);
        } finally {
          updateProgress();
        }
      });

      // 2. 일반 첨부파일 처리
      const processMainFiles = async () => {
        try {
          const mainResponse = await fetch(
            `/api/mail/download/${currentMail.uid}`,
          );
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
        } catch (e) {
          console.error("일반 첨부파일 처리 실패", e);
        } finally {
          updateProgress(); // 작업 완료 업데이트
        }
      };

      await Promise.all([...bigFilePromises, processMainFiles()]);

      // 3. 압축파일 생성 및 저장
      const finalZipContent = await mainZip.generateAsync({ type: "blob" });
      saveAs(finalZipContent, `${currentMail.subject || "download"}.zip`);
      showToast("모든 파일이 통합되어 다운로드되었습니다.", "success");
    } catch (error) {
      showToast("다운로드 중 오류가 발생했습니다.", "error");
      navigator.clipboard.writeText("downloading_failed");
      emailLog({
        type: "error",
        title: currentMail.subject,
        message: `파일 다운로드 중 오류가 발생했습니다.`,
        error: error,
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      navigator.clipboard.writeText("downloading_success");
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
      emailLog({
        type: "error",
        title: currentMail.subject,
        error: error,
        message: "supabase 저장 실패",
      });
    } finally {
      setIsSubmitting(false);
      emailLog({
        type: "success",
        title: currentMail.subject,
        message: "저장 성공",
      });
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

        {/* --- 다운로드 버튼 수정 구간 --- */}
        <Box sx={{ position: "relative", mb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleDownload}
            // disabled={isDownloading}
            startIcon={
              isDownloading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Download />
              )
            }
            sx={{ height: 50 }}
          >
            {isDownloading
              ? `파일 다운로드 중... (${downloadProgress}%)`
              : "전체 첨부파일 통합 다운로드"}
          </Button>
          {isDownloading && (
            <LinearProgress
              variant="determinate"
              value={downloadProgress}
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
              }}
            />
          )}
        </Box>
        {/* --------------------------- */}

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

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={currentIndex === 0}
            startIcon={<ArrowBackIos />}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            sx={{ height: 70, fontSize: "1.2rem", bgcolor: "#757575" }}
          >
            이전 메일
          </Button>
          <Button
            variant="contained"
            size="large"
            fullWidth
            endIcon={<ArrowForwardIos />}
            onClick={() => {
              if (currentIndex === selectedEmails.length - 1) {
                navigator.clipboard.writeText("mail_finished");
                return;
              }
              setCurrentIndex(currentIndex + 1);
            }}
            sx={{ height: 70, fontSize: "1.2rem" }}
          >
            다음 메일
          </Button>
        </Stack>
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

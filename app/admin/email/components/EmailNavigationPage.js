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
  ContentCopy,
  Save,
} from "@mui/icons-material";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import imageCompression from "browser-image-compression"; // 라이브러리 임포트

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

export function EmailNavigationPage({ selectedEmails, onGoBack }) {
  const supabase = createBrowserSupabaseClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [files, setFiles] = useState([]); // 압축된 이미지 파일들
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // 압축 로딩 상태 추가
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [titleContentJson, setTitleContentJson] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");

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

  const currentMail = selectedEmails[currentIndex];
  const handleCloseToast = () => setToast({ ...toast, open: false });
  const showToast = (message, severity = "info") =>
    setToast({ open: true, message, severity });

  // --- 이미지 압축 로직 ---
  const handleImageCompression = async (rawFiles) => {
    const options = {
      maxSizeMB: 0.7, // 최대 1MB
      maxWidthOrHeight: 1920, // 최대 해상도
      useWebWorker: true,
    };

    setIsCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        rawFiles.map(async (file) => {
          try {
            const compressedBlob = await imageCompression(file, options);
            // 압축 후 원래 파일명을 유지하기 위해 다시 File 객체로 변환
            return new File([compressedBlob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
          } catch (err) {
            console.error("파일 압축 실패:", file.name, err);
            return file; // 실패 시 원본 반환
          }
        }),
      );
      setFiles((prev) => [...prev, ...compressedFiles]);
      showToast(
        `${compressedFiles.length}개의 이미지가 압축되어 추가되었습니다.`,
        "success",
      );
    } catch (error) {
      showToast("이미지 압축 중 오류가 발생했습니다.", "error");
    } finally {
      setIsCompressing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    handleImageCompression(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleDownload = () => {
    if (!currentMail) return;
    window.location.href = `/api/mail/download/${currentMail.uid}`;
  };

  const handleSaveToSupabase = async () => {
    if (!jsonInput) return showToast("JSON 데이터를 입력해주세요.", "warning");
    setIsSubmitting(true);

    try {
      const parsedData = JSON.parse(jsonInput);

      for (const article of parsedData) {
        const { data: insertedArticle, error: dbError } = await supabase
          .from("articles")
          .insert({
            title: article.title,
            content: article.content,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        const publicUrls = [];

        for (const fileName of article.images || []) {
          const fileToUpload = files.find((f) => {
            return f.name.normalize("NFC") === fileName.normalize("NFC");
          });

          if (!fileToUpload) continue;

          const fileExt = fileToUpload.name.split(".").pop();
          const filePath = `admin/images/${insertedArticle.id}/${uuidv4()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("public-bucket")
            .upload(filePath, fileToUpload);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("public-bucket").getPublicUrl(filePath);

          publicUrls.push(publicUrl);
        }

        const { error: updateError } = await supabase
          .from("articles")
          .update({
            images_bodo: publicUrls,
            thumbnail_image: publicUrls[0] || null,
          })
          .eq("id", insertedArticle.id);

        if (updateError) throw updateError;

        const categoryMappings = [
          { article_id: insertedArticle.id, category_slug: article.slug },
          // { article_id: insertedArticle.id, category_slug: "general" },
        ];

        const { error: categoryError } = await supabase
          .from("article_categories")
          .insert(categoryMappings);

        if (categoryError)
          console.error("Category Insert Error:", categoryError);
      }

      showToast("모든 기사와 카테고리가 성공적으로 저장되었습니다.", "success");
      setFiles([]);
      setJsonInput("");
      setTitleContentJson("");
    } catch (error) {
      console.error(error);
      showToast(`저장 실패: ${error.message}`, "error");
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
          sx={{ mt: 1, height: 50 }}
          variant="contained"
          onClick={() => navigator.clipboard.writeText(aiInstruction)}
        >
          지시문 복사
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleDownload}
          sx={{ height: 50, my: 2 }}
        >
          이 메일의 첨부파일 다운로드 (ZIP)
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
            position: "relative",
          }}
        >
          <input {...getInputProps()} />
          {isCompressing ? (
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size={24} />
              <Typography>이미지 압축 중...</Typography>
            </Stack>
          ) : (
            <>
              <CloudUpload
                sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
              />
              <Typography>
                이미지들을 이곳에 드래그하거나 클릭하세요. (자동 압축 적용)
              </Typography>
            </>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            현재 선택된 파일: {files.length}개
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          disabled={files.length === 0}
          sx={{ my: 1 }}
          onClick={() => {
            navigator.clipboard.writeText(
              `${IMG_TEXT}\n\n***이미지명 JSON***\n${JSON.stringify(
                files.map((f) => f.name),
                null,
                2,
              )}\n\n***기사 JSON***\n${titleContentJson}`,
            );
            showToast("AI 프롬프트가 복사되었습니다.", "info");
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
          placeholder='[{"title": "...", "content": "...", "images": ["파일명.jpg"], "slug": "..."}]'
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

      <Stack direction="row" spacing={2}>
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
          disabled={currentIndex === selectedEmails.length - 1}
          endIcon={<ArrowForwardIos />}
          onClick={() => setCurrentIndex(currentIndex + 1)}
          sx={{ height: 70, fontSize: "1.2rem" }}
        >
          다음 메일
        </Button>
      </Stack>

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

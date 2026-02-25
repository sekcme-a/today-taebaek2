"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import {
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { convertTextToQuillHTML } from "../routine/pages/function/convertTextToQuillHTML";

const TEXT = `역할: 너는 분류기다. 출력은 데이터다.

각 기사 제목에 대해 아래 카테고리 목록 중 정확히 1개를 선택해라.
기사 제목의 순서를 반드시 유지해라.

출력 규칙:
- 반드시 JSON 배열만 코드블럭에 출력
- 마크다운, 설명, 문장, 주석, 공백 텍스트 일절 금지

배열 형식 예시:
["society","lifestyle","sports"]

\n`;

export default function Siheung({
  setPage,
  settings,
  setHistory,
  posts,
  setPosts,
  authors,
}) {
  const supabase = createBrowserSupabaseClient();
  const [log, setLog] = useState([]);
  const [aiText, setAiText] = useState("");
  const [jsonData, setJsonData] = useState("");

  const fetchCategories = async () => {
    // 종합 카테고리 목록 가져오기
    const { data } = await supabase
      .from("categories")
      .select("slug")
      .eq("parent_id", "422d1e7f-6582-4fe6-8362-ed7e83c04ec3");

    const text = data.map((item) => item.slug).join(",");
    return text;
  };

  const [isFetching, setIsFetching] = useState(false);
  const fetchArticles = async () => {
    if (isFetching) return;
    setPosts([]);
    if (!settings.enabled) {
      navigator.clipboard.writeText("siheung_disabled");
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    const categoriesText = await fetchCategories();

    // 1. 날짜 배열 생성 (startDate ~ endDate)
    const start = dayjs(settings.startDate);
    const end = dayjs(settings.endDate);
    const diffDays = end.diff(start, "day");

    if (diffDays < 0) {
      return;
    }

    const dateList = [];
    for (let i = 0; i <= diffDays; i++) {
      dateList.push(start.add(i, "day").format("YYYY-MM-DD"));
    }

    setLog((prev) => [
      ...prev,
      `🚀 시흥 크롤링 시작: 총 ${dateList.length}일치 데이터 요청 중...`,
    ]);

    try {
      // 2. 병렬 처리 (Promise.all)
      const requests = dateList.map(async (date) => {
        try {
          const res = await fetch(
            `/api/crawl/siheung?start=${date}&end=${date}`,
          );
          if (!res.ok) throw new Error(`${date} 요청 실패`);
          const data = await res.json();

          // 시흥은 data.posts에 배열이 담겨 있음
          const articles = data?.posts ?? [];
          return { date, articles, success: true };
        } catch (err) {
          return { date, articles: [], success: false };
        }
      });

      const results = await Promise.all(requests);

      // 3. 결과 합치기 및 로그 출력
      let totalList = [];
      results.forEach((res) => {
        if (res.success) {
          totalList = [...totalList, ...res.articles];
          setLog((prev) => [
            ...prev,
            `✅ ${res.date}: ${res.articles.length}건 수집 완료`,
          ]);
        } else {
          setLog((prev) => [...prev, `❌ ${res.date}: 수집 실패`]);
        }
      });

      // 4. 후처리
      if (totalList.length === 0) {
        navigator.clipboard.writeText("null");
        setAiText("null");
        setLog((prev) => [...prev, "⚠️ 수집된 데이터가 없습니다."]);
      } else {
        const titles = totalList.map((item) => item.title);
        setPosts(totalList);
        setLog((prev) => [
          ...prev,
          `🎉 총 ${totalList.length}건의 기사 제목과 AI 문구가 생성되었습니다.`,
        ]);
        setAiText(
          `${TEXT}카테고리 목록: ${categoriesText}\n\n기사 제목 목록: ${JSON.stringify(
            titles,
          )}`,
        );
      }
    } catch (error) {
      console.error(error);
      setLog((prev) => [...prev, "🚨 크롤링 중 치명적 오류 발생"]);
    } finally {
      setIsFetching(false);
    }
  };

  const saveArticles = async () => {
    try {
      const slugValues = JSON.parse(jsonData);

      // 1. 현재 시점 기준 생성
      const now = new Date();

      // 2. 데이터 가공 (created_at 시차 부여)
      const datas = posts.map((item, index) => {
        const timestamp = new Date(now.getTime() + index * 1000).toISOString();

        return {
          title: item.title,
          content: convertTextToQuillHTML(item.content), // 시흥은 별도의 cleanText 로직이 기존에 없었으므로 바로 변환
          images_bodo: item.images,
          author: authors[Math.floor(Math.random() * authors.length)],
          thumbnail_image: item.images?.[0] ?? null,
          created_at: timestamp,
        };
      });

      // 3. articles 테이블 insert
      const { data: insertedArticles, error: articleError } = await supabase
        .from("articles")
        .insert(datas)
        .select("id");

      if (articleError) throw articleError;

      const newArticleIds = insertedArticles.map((item) => item.id);

      // 4. 카테고리 매핑 데이터 생성
      const slugList = insertedArticles.map((item, index) => ({
        article_id: item.id,
        category_slug: slugValues[index],
      }));

      const generalSlugList = insertedArticles.map((item) => ({
        article_id: item.id,
        category_slug: "general",
      }));

      const siheungSlugList = insertedArticles.map((item) => ({
        article_id: item.id,
        category_slug: "siheung",
      }));

      // 5. article_categories 테이블 insert
      const { error: categoryError } = await supabase
        .from("article_categories")
        .insert([...slugList, ...generalSlugList, ...siheungSlugList]);

      if (categoryError) throw categoryError;

      setHistory((prev) => [
        ...prev,
        {
          type: "success",
          message: `시흥 보도자료 ${datas.length}개 저장 성공`,
          articleIds: newArticleIds,
        },
      ]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Save Error:", error);
      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          message: `시흥 보도자료 저장 실패: ${error.message}`,
          articleIds: [],
        },
      ]);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        시흥 보도자료 크롤링 진행
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "#f5f5f5",
          height: 130,
          overflowY: "auto",
        }}
      >
        {log.length === 0 ? (
          <Typography color="text.secondary">
            로그가 없습니다. 시작 버튼을 눌러주세요.
          </Typography>
        ) : (
          log.map((line, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
              {line}
            </Typography>
          ))
        )}
      </Paper>

      <div className="flex gap-x-2">
        <Button
          variant="contained"
          onClick={fetchArticles}
          sx={{ flex: 2, mt: 2, height: 100 }}
          fullWidth
          color="primary"
          disabled={isFetching}
        >
          크롤링 실행
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            navigator.clipboard.writeText(aiText);
          }}
          sx={{ flex: 2, mt: 2, height: 100 }}
          fullWidth
          color="primary"
        >
          문구 복사
        </Button>
      </div>

      <TextField
        fullWidth
        multiline
        rows={5}
        value={jsonData}
        sx={{ mt: 2 }}
        onChange={(e) => setJsonData(e.target.value)}
      />
      <div className="flex gap-x-2 mt-2 h-20">
        <Button
          variant="contained"
          onClick={() => {
            try {
              const parsed = JSON.parse(jsonData);
              const isStringArray =
                Array.isArray(parsed) &&
                parsed.every((item) => typeof item === "string");

              if (!isStringArray) {
                navigator.clipboard.writeText("invalid_data");
              } else {
                navigator.clipboard.writeText("valid_data");
              }
            } catch (e) {}
          }}
          fullWidth
        >
          올바른 데이터 형식인지 확인
        </Button>
        <Button variant="contained" onClick={saveArticles} fullWidth>
          저장 실행
        </Button>
      </div>
    </Box>
  );
}

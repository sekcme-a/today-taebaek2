import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

// 날짜 문자열(YYYY-MM-DD)을 Date 객체로 변환
function parseDate(str) {
  if (!str) return null;
  const [yyyy, mm, dd] = str.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const startPage = searchParams.get("page") || "1";

  const startDate = startParam ? parseDate(startParam) : null;
  const endDate = endParam ? parseDate(endParam) : null;

  const maxArticles = 50;
  let currentPage = startPage.toString() === "0" ? 1 : parseInt(startPage);
  let articles = [];
  let shouldStop = false;

  const BASE_URL = "https://www.incheon.go.kr";
  // 이미지 파일인지 확인하는 정규식
  const imageRegex = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
  // 기본 로고 경로
  const DEFAULT_LOGO = "/images/incheon_logo.png";

  try {
    while (articles.length < maxArticles && !shouldStop) {
      if (currentPage >= 15) break;

      const listUrl = `${BASE_URL}/IC010205/list?curPage=${currentPage}`;
      const res = await axios.get(listUrl);
      const $ = cheerio.load(res.data);

      const rows = $(".board-blog-list ul li");
      if (rows.length === 0) break;

      let addedThisPage = 0;

      for (let i = 0; i < rows.length; i++) {
        if (articles.length >= maxArticles) break;

        const row = rows.eq(i);
        const linkTag = row.find("a");
        const relativeDetailUrl = linkTag.attr("href");
        const detailUrl = `${BASE_URL}${relativeDetailUrl}`;

        const dateStr = row
          .find(".board-item-area dl.item")
          .find("dd")
          .first()
          .text()
          .trim();
        const date = parseDate(dateStr);

        if (startDate && date < startDate) {
          shouldStop = true;
          break;
        }
        if (endDate && date > endDate) continue;

        const detailRes = await axios.get(detailUrl);
        const $$ = cheerio.load(detailRes.data);

        const title = $$(".board-view-title").first().text().trim();
        const subTitle = $$(".board-view-title-small .board-view-title")
          .text()
          .trim();

        let contentHtml = $$(".cms_content").html() || "";
        let content = contentHtml
          .replace(/<br\s*\/?>/g, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim();

        // 1. 본문 및 썸네일 이미지 추출
        const images = [];
        $$(".cms_content img, .img-area img").each((_, el) => {
          const src = $$(el).attr("src");
          if (src && src !== "#" && !src.includes("noImg")) {
            images.push(src.startsWith("http") ? src : `${BASE_URL}${src}`);
          }
        });

        // 2. 첨부파일 중 "이미지"만 필터링해서 추출
        let validImageFiles = [];
        $$(".file-preview-down-group a").each((_, el) => {
          const href = $$(el).attr("href");
          const fileName = $$(el).parent().find(".file-name").text().trim();

          if (href && href.includes("dmsFileDownload")) {
            const absoluteHref = href.startsWith("http")
              ? href
              : `${BASE_URL}${href}`;
            // 파일명이나 URL 끝이 이미지 확장자인지 체크
            if (
              imageRegex.test(fileName) ||
              imageRegex.test(absoluteHref.split("?")[0])
            ) {
              validImageFiles.push(absoluteHref);
            }
          }
        });

        /**
         * 핵심 로직: 이미지 첨부파일이 없으면
         * 1순위: 본문 이미지 중 첫 번째
         * 2순위: 그마저도 없으면 기본 로고 삽입
         */
        if (validImageFiles.length === 0) {
          if (images.length > 0) {
            validImageFiles.push(images[0]);
          } else {
            validImageFiles.push(DEFAULT_LOGO);
          }
        }

        const seqMatch = relativeDetailUrl.match(/repSeq=([^&]+)/);
        const number = seqMatch ? seqMatch[1] : Date.now().toString();

        articles.push({
          number,
          title: subTitle ? `[${subTitle}] ${title}` : title,
          date: dateStr,
          content,
          attachments: validImageFiles, // 이제 여기엔 무조건 이미지 URL만 들어감
          images: [...new Set(images)],
          url: detailUrl,
        });

        addedThisPage++;
      }

      if (shouldStop) break;
      if (addedThisPage === 0 && articles.length > 0) break;
      if (startPage.toString() !== "0") break;

      currentPage++;
    }

    return new NextResponse(
      JSON.stringify({
        count: articles.length,
        articles,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "크롤링 실패", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

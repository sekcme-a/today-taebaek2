import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

//날짜와 보낸사람에 따른 메일 UID 검색 후, 해당 UID들에서 제목 포함 키워드 필터링 후 그 중 첨부파일이 있는 메일만 반환하는 API

// 일반 첨부파일 유무 확인 함수
const checkAttachments = (structure) => {
  if (!structure) return false;
  if (structure.disposition === "attachment") return true;
  if (structure.childNodes) {
    for (const node of structure.childNodes) {
      if (checkAttachments(node)) return true;
    }
  }
  return false;
};

// 대용량 첨부파일 URL 추출 함수
const extractBigFileUrls = (text) => {
  if (!text) return [];
  const regex =
    /https?:\/\/[\w\.]+(?::\d+)?\/bigDataDownload\/[a-zA-Z0-9+/=]+/g;
  return text.match(regex) || [];
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const senderQuery = searchParams.get("senders");
  const subjectQuery = searchParams.get("subject");
  const afterQuery = searchParams.get("after");

  // IMAP Search Query 빌드
  const searchQuery = {};

  // if (subjectQuery) {
  //   searchQuery.subject = subjectQuery;
  // }

  if (afterQuery) {
    searchQuery.sentSince = new Date(afterQuery);
  }
  searchQuery.from = senderQuery || "";

  // 발신자 리스트 처리 (search 단계에서 넣을 수도 있으나, 콤마 분리 처리를 위해 fetch 후 체크하거나 OR 조건을 써야함)
  const senderList = senderQuery
    ? senderQuery.split(",").map((s) => s.trim().toLowerCase())
    : [];
  const client = new ImapFlow({
    host: "imap.daum.net",
    port: 993,
    secure: true,
    auth: {
      user: process.env.DAUM_EMAIL,
      pass: process.env.DAUM_APP_PASSWORD,
    },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const messages = [];
      console.log(searchQuery);
      // 1. 서버 측 검색을 통해 조건에 맞는 UID 목록만 가져옴
      // sender는 복수 처리를 위해 fetch 루프 내에서 필터링하거나, 복잡한 search query를 구성할 수 있습니다.
      const uids = await client.search(searchQuery);

      console.log(uids);

      if (uids.length > 0) {
        // 2. 검색된 UID들에 대해서만 필요한 데이터(source 등)를 Fetch
        for await (let msg of client.fetch(uids, {
          envelope: true,
          uid: true,
          bodyStructure: true,
          source: true,
        })) {
          const fromAddress =
            msg.envelope.from?.[0]?.address?.toLowerCase() ?? "";

          // 발신자(senderList) 필터링 (서버 search 쿼리에서 처리하기 까다로운 콤마 구분자 처리)
          if (
            senderList.length > 0 &&
            !senderList.some((s) => fromAddress.includes(s))
          ) {
            continue;
          }

          // 메일 소스 파싱
          const parsed = await simpleParser(msg.source);

          // 일반 첨부파일 확인
          const hasAttachments = checkAttachments(msg.bodyStructure);

          // 대용량 첨부파일 URL 추출
          const bigFileUrls = [
            ...extractBigFileUrls(parsed.html),
            ...extractBigFileUrls(parsed.text),
          ];

          const uniqueBigFileUrls = [...new Set(bigFileUrls)];

          messages.push({
            uid: msg.uid,
            subject: msg.envelope.subject,
            from: msg.envelope.from?.[0]?.address ?? "(unknown)",
            date: msg.envelope.date,
            hasAttachments: hasAttachments || uniqueBigFileUrls.length > 0,
            bigFileUrls: uniqueBigFileUrls,
          });
        }
      }

      // 최신순 정렬
      messages.sort((a, b) => new Date(b.date) - new Date(a.date));

      return Response.json(messages);
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error("Daum Mail Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    await client.logout();
  }
}

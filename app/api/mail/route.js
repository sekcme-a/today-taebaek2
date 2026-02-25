import { ImapFlow } from "imapflow";

// 첨부파일 유무를 확인하는 재귀 함수
const checkAttachments = (structure) => {
  if (!structure) return false;

  // 이 노드 자체가 첨부파일인지 확인
  if (structure.disposition === "attachment") return true;

  // 자식 노드가 있으면 재귀적으로 확인
  if (structure.childNodes && structure.childNodes.length > 0) {
    for (const node of structure.childNodes) {
      if (checkAttachments(node)) return true;
    }
  }
  return false;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const senderQuery = searchParams.get("senders");
  const subjectQuery = searchParams.get("subject");
  const afterQuery = searchParams.get("after");

  const senderList = senderQuery
    ? senderQuery.split(",").map((s) => s.trim().toLowerCase())
    : [];

  const afterDate = afterQuery ? new Date(afterQuery) : null;

  const client = new ImapFlow({
    host: "imap.daum.net",
    port: 993,
    secure: true,
    auth: {
      user: process.env.DAUM_EMAIL,
      pass: process.env.DAUM_APP_PASSWORD,
    },
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    const messages = [];

    // uid와 bodyStructure도 함께 가져옵니다.
    for await (let msg of client.fetch("1:*", {
      envelope: true,
      uid: true,
      bodyStructure: true,
    })) {
      const fromAddress = msg.envelope.from?.[0]?.address?.toLowerCase() ?? "";
      const subject = msg.envelope.subject?.toLowerCase() ?? "";
      const date = new Date(msg.envelope.date);

      // 첨부파일 유무 확인
      const hasAttachments = checkAttachments(msg.bodyStructure);

      // ✅ 필터 조건
      const matchSender =
        senderList.length === 0 ||
        senderList.some((s) => fromAddress.includes(s));

      const matchSubject =
        !subjectQuery || subject.includes(subjectQuery.toLowerCase());

      const matchDate = !afterDate || date.getTime() >= afterDate.getTime();

      if (matchSender && matchSubject && matchDate) {
        messages.push({
          uid: msg.uid, // ⭐ UID 추가
          subject: msg.envelope.subject,
          from: msg.envelope.from?.[0]?.address ?? "(unknown)",
          date: msg.envelope.date,
          hasAttachments: hasAttachments, // ⭐ 첨부파일 유무 추가
        });
      }
    }

    await client.logout();

    // 최신순 정렬
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json(messages); // 최근 30개만 반환
  } catch (error) {
    console.error("Daum Mail Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

import { ImapFlow } from "imapflow";
import archiver from "archiver"; // archiver 라이브러리 추가
import { Readable } from "stream"; // Node.js의 Readable 스트림 추가

// (findAttachments 함수는 그대로 둡니다)
const findAttachments = (structure, path = "") => {
  let attachments = [];

  // disposition이 'attachment'인 경우 첨부파일로 간주
  if (structure.disposition === "attachment") {
    attachments.push({
      path: path || "1", // root part는 '1'
      filename:
        structure.dispositionParameters?.filename ||
        `attachment-${path || "1"}.bin`,
      mimeType: `${structure.type}/${structure.subtype}`,
    });
  }

  // 자식 노드가 있으면 재귀적으로 탐색
  if (structure.childNodes && structure.childNodes.length > 0) {
    structure.childNodes.forEach((child, index) => {
      // index는 0부터 시작하므로 +1
      const newPath = path ? `${path}.${index + 1}` : `${index + 1}`;
      attachments = attachments.concat(findAttachments(child, newPath));
    });
  }
  return attachments;
};

// Next.js Response와 호환되는 Node.js Readable 스트림을 Web Stream으로 변환하는 헬퍼 함수
// archiver는 Node.js Stream을 사용하므로 변환이 필요합니다.
function streamToWebStream(nodeStream) {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => controller.enqueue(chunk));
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export async function GET(request, { params }) {
  const uid = Number(params.uid);

  if (!uid) {
    return Response.json(
      { error: "유효한 UID가 필요합니다." },
      { status: 400 },
    );
  }

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

    let message = await client.fetchOne(
      uid,
      { bodyStructure: true, envelope: true }, // envelope도 가져와서 제목을 ZIP 파일명에 사용
      { uid: true },
    );

    if (!message || !message.bodyStructure) {
      await client.logout();
      return Response.json(
        { error: "메일 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const attachmentsToDownload = findAttachments(message.bodyStructure);

    if (attachmentsToDownload.length === 0) {
      await client.logout();
      return Response.json({ error: "첨부파일이 없습니다." }, { status: 404 });
    }

    // 1. archiver 초기화 및 스트림 설정
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 압축 레벨 설정
    });

    // Node.js Readable 스트림을 생성하여 archiver 출력을 받음
    const zipStream = new Readable({
      read() {}, // 구현이 필요 없습니다. archiver가 데이터를 push합니다.
    });

    // archiver의 출력을 Node.js Readable 스트림으로 연결
    archive.on("data", (chunk) => {
      // archiver가 데이터를 생성할 때마다 스트림으로 push
      zipStream.push(chunk);
    });

    archive.on("end", () => {
      // archiver 작업이 끝나면 스트림 종료
      zipStream.push(null);
      // 스트림 종료 시 IMAP 클라이언트 로그아웃 시도
      client.logout().catch((e) => console.error("Logout error on end:", e));
    });

    archive.on("error", (err) => {
      // 오류 발생 시 스트림에 오류를 전달하고 로그아웃
      zipStream.emit("error", err);
      client.logout().catch((e) => console.error("Logout error on error:", e));
    });

    // 2. 첨부파일 다운로드 및 ZIP에 추가
    let filenameCounter = {}; // 파일명 중복 방지 카운터

    for (const attachment of attachmentsToDownload) {
      // ImapFlow로 첨부파일 다운로드 (스트림 형태)
      const downloadResult = await client.download(uid, attachment.path, {
        uid: true,
      });
      const partStream = downloadResult.content;

      if (!partStream) {
        console.warn(
          `UID ${uid}의 파트 ${attachment.path} 스트림 가져오기 실패.`,
        );
        continue; // 이 파일만 건너뛰고 다음 파일 시도
      }

      // 파일명 중복 처리: 'file.txt' -> 'file(1).txt'
      let baseFilename = attachment.filename;
      let nameWithoutExt = baseFilename.split(".").slice(0, -1).join(".");
      let extension = baseFilename.split(".").pop();
      let uniqueFilename = baseFilename;

      if (filenameCounter[baseFilename]) {
        filenameCounter[baseFilename]++;
        uniqueFilename = `${nameWithoutExt}(${filenameCounter[baseFilename]}).${extension}`;
      } else {
        filenameCounter[baseFilename] = 1;
      }

      // archiver에 스트림 추가
      archive.append(partStream, { name: uniqueFilename });
    }

    // 3. archiver 작업 종료 (ZIP 파일 생성 시작)
    archive.finalize();

    // 4. 응답 구성 (Next.js Response)
    const subject = message.envelope.subject || `mail-${uid}`;
    const zipFilename = `[${subject}]_Attachments.zip`;

    const response = new Response(streamToWebStream(zipStream), {
      // Node.js 스트림을 Web Stream으로 변환하여 사용
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          zipFilename,
        )}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Attachment Download Outer Error:", error);
    try {
      await client.logout();
    } catch (e) {}
    return Response.json(
      { error: `첨부파일 다운로드 중 오류 발생: ${error.message}` },
      { status: 500 },
    );
  }
}

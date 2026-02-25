const DATA = {
  NAME: `투데이태백`,
  DESCRIPTION: `서부 뉴스에서 실시간 속보와 핵심 정보를 놓치지 마세요, 가장 빠르고 정확한 오늘의 주요 뉴스 신문. `,
  URL: `https://xn--2n1b19ndwjhoj6sb.com`,
};

export function createMetadata({ title, description, url }) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${DATA.URL}${url}`,
      siteName: DATA.NAME,
      type: "website",
      images: [
        {
          url: `${DATA.URL}/images/og_logo.png`,
          width: 1200,
          height: 630,
          alt: `${DATA.NAME} 대표 이미지`,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [`${DATA.URL}/images/og_logo.png`],
    },
  };
}

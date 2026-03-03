const DATA = {
  NAME: `투데이태백`,
  DESCRIPTION: `태백의 정치, 경제, 사회, 문화 등 다양한 분야의 최신 뉴스를 빠르게 확인하세요.`,
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

const DATA = {
  NAME: `투데이태백`,
  SUBTITLE: `오늘의 태백 뉴스`,
  DESCRIPTION: `태백의 정치, 경제, 사회, 문화 등 다양한 분야의 최신 뉴스를 빠르게 확인하세요.`,
  URL: `https://www.xn--2n1b19ndwjhoj6sb.com`,
};

const metadata = {
  metadataBase: new URL(DATA.URL),
  title: `${DATA.NAME} - ${DATA.SUBTITLE}`,
  title: {
    default: `${DATA.NAME} - ${DATA.SUBTITLE}`,
    template: `%s | ${DATA.NAME}`,
  },
  description: DATA.DESCRIPTION,
  keywords: `${DATA.NAME}, 태백, 뉴스, 신문`,
  openGraph: {
    title: `${DATA.NAME} - ${DATA.SUBTITLE}`,
    description: DATA.DESCRIPTION,
    url: DATA.URL,
    siteName: DATA.NAME,
    images: [
      {
        url: `${DATA.URL}/images/og_logo.png`,
        width: 1200,
        height: 630,
        alt: `${DATA.NAME} 대표 이미지`,
      },
    ],
    type: `website`,
  },
  twitter: {
    title: `${DATA.NAME} - ${DATA.SUBTITLE}`,
    description: DATA.DESCRIPTION,
    images: [`${DATA.URL}/images/og_logo.png`],
  },
};

export default metadata;

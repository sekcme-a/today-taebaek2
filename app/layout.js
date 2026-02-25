import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/config/theme";
import AuthProvider from "@/providers/AuthProvider";
import metadata from "./metadata";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export { metadata };
export default async function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="google-site-verification"
          content="A6KUKr1vGzoqcpBVclpjxstOtyLutxNtOJ9CyuPjD7o"
        />
        <meta
          name="naver-site-verification"
          content="ed1a27114b5fb9210151ad92826cc1c75a280862"
        />
        <link
          rel="shortcut icon"
          href="https://www.xn--2n1b19ndwjhoj6sb.com/favicon.ico"
        ></link>
      </head>
      <body
        className={[
          `bg-[#1f1f1f] text-white vsc-initialized ${geistSans.variable} ${geistMono.variable}`,
        ]}
      >
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js"
          integrity="sha384-JpLApTkB8lPskhVMhT+m5Ln8aHlnS0bsIexhaak0jOhAkMYedQoVghPfSpjNi9K1"
          crossorigin="anonymous"
        />
        <AuthProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

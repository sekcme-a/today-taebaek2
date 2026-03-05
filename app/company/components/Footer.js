import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  // 텍스트 색상을 더 짙은 회색(gray-500/600)으로 조정했습니다.
  const SPAN_CLASS = " px-2 text-sm text-gray-500 my-1";

  const FOOTER_ONE = [
    "주소 - 강원특별자치 태백시 석공길28-14(장성동)",
    "전화 - 010-5339-6943",
    "발행인 - 김균식",
    "편집인 - 김균식",
    "청소년보호책임자 - 심귀자",
    "고충처리인 - 심귀자",
  ];
  const FOOTER_TWO = [
    "사업자명 - 투데이 태백",
    "사업자등록번호 - 268-06-03022",
  ];

  const FOOTER_NAV = [
    { name: "회사소개", href: "company/about/intro" },
    { name: "기사제보", href: "company/inquiry/report" },
    { name: "광고문의", href: "company/inquiry/ad" },
    { name: "제휴문의", href: "company/inquiry/partner" },
    { name: "이용약관", href: "company/policy/terms" },
    {
      name: "개인정보처리방침",
      href: "company/policy/privacy",
      highlight: true,
    },
    { name: "청소년보호정책", href: "company/policy/youth" },
  ];

  return (
    <footer className="md:mx-[4vw] lg:mx-[7vw] mx-[12px] bg-white text-gray-800">
      <nav className="py-3 border-t border-b border-gray-200">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {FOOTER_NAV.map((item, index) => (
            <li key={index} className="flex items-center gap-6">
              <Link
                href={item.href}
                className={`text-[14px] hover:text-black font-medium transition-colors ${
                  item.highlight ? "font-bold text-gray-900" : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
              {index !== FOOTER_NAV.length - 1 && (
                <div className="hidden md:block w-[1px] h-3 bg-gray-300" />
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col md:flex-row py-10 px-2 items-center">
        {/* 로고 이미지가 흰색 바탕용(검은색 글자 등)으로 교체되어야 합니다. */}
        <Image
          src="/images/logo.png"
          alt="footer 로고 이미지"
          width={150}
          height={35}
          className="object-contain md:mr-20 mt-10 md:mt-0"
        />
        <div className="flex-1 mt-4 md:mt-0">
          <ul className="flex flex-wrap items-center justify-center md:justify-start">
            {FOOTER_ONE.map((item, index) => (
              <li key={index} className="flex flex-wrap items-center">
                <p className="px-2 text-sm text-gray-500 my-1">{item}</p>
                {FOOTER_ONE.length - 1 !== index && (
                  <div className="h-3 w-[1px] bg-gray-300 mx-2 hidden md:block" />
                )}
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-center justify-center md:justify-start">
            {FOOTER_TWO.map((item, index) => (
              <li key={index} className="flex flex-wrap items-center">
                <p className="px-2 text-sm text-gray-500 my-1">{item}</p>
                {FOOTER_TWO.length - 1 !== index && (
                  <div className="h-3 w-[1px] bg-gray-300 mx-2 hidden md:block" />
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="text-xs text-gray-400 pl-2 text-center md:text-start leading-relaxed">
              투데이태백의 모든 콘텐트(기사)는 저작권법의 보호를 받은바, 무단
              전재, 복사, 배포 등을 금합니다.
            </p>
            <p className="text-xs text-gray-400 pl-2 text-center md:text-start font-light">
              Copyright by Today Taebaek Co., Ltd. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

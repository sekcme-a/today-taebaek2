import Image from "next/image";

const Footer = () => {
  const SPAN_CLASS = " px-2 text-sm text-gray-400 my-1";

  const FOOTER_ONE = [
    "주소 - 강원특별자치 태백시 석공길28-14(장성동)",
    "전화 - 010-5339-6943",
    "발행인 - 김균식",
    "편집인 - 김균식",
    "청소년보호책임자 - 김균식",
  ];
  const FOOTER_TWO = [
    "사업자명 - 투데이 태백",
    "사업자등록번호 - 268-06-03022",
  ];
  return (
    <footer className="  md:mx-[4vw] lg:mx-[7vw] mx-[12px]">
      <div className="mt-18 flex flex-col md:flex-row border-t-2 border-white py-10 px-2 items-center">
        {/* <div className="relative w-full md:w-72 aspect-[3/1] "> */}
        <Image
          src="/images/logo_white.png"
          alt="footer 로고 이미지"
          // fill
          width={150}
          height={35}
          className="object-contain md:mr-20 mt-10 md:mt-0"
        />
        {/* </div> */}
        <div className="flex-1 mt-4 md:mt-0">
          <ul className="flex flex-wrap items-center justify-center md:justify-start">
            {FOOTER_ONE.map((item, index) => (
              <li key={index} className="flex flex-wrap items-center">
                <p className="px-2 text-sm text-gray-400 my-1">{item}</p>
                {FOOTER_ONE.length - 1 !== index && (
                  <div className="h-3 w-[1px] bg-gray-600 mx-2 hidden md:block" />
                )}
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-center justify-center md:justify-start">
            {FOOTER_TWO.map((item, index) => (
              <li key={index} className="flex flex-wrap items-center">
                <p className="px-2 text-sm text-gray-400 my-1">{item}</p>
                {FOOTER_TWO.length - 1 !== index && (
                  <div className="h-3 w-[1px] bg-gray-600 mx-2 hidden md:block" />
                )}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-400 pl-2 mt-2 text-center md:text-start">{`투데이태백의 모든 콘텐트(기사)는 저작권법의 보호를 받은바, 무단 전재, 복사, 배포 등을 금합니다.`}</p>
          <p className="text-sm text-gray-400 pl-2 text-center md:text-start">
            Copyright by Today Taebaek Co., Ltd. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

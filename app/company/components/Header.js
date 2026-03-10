"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menus = [
    {
      title: "회사소개",
      sub: [
        { name: "회사소개", path: "/company/about/intro" },
        // { name: "회사연혁", path: "/company/about/history" },
        { name: "회사개요", path: "/company/about/overview" },
      ],
    },
    {
      title: "제보 및 문의",
      sub: [
        { name: "기사제보", path: "/company/inquiry/report" },
        { name: "광고문의", path: "/company/inquiry/ad" },
        { name: "제휴문의", path: "/company/inquiry/partner" },
      ],
    },
    {
      title: "약관 및 정책",
      sub: [
        { name: "이용약관", path: "/company/policy/terms" },
        { name: "개인정보처리방침", path: "/company/policy/privacy" },
        { name: "청소년보호정책", path: "/company/policy/youth" },
      ],
    },
  ];

  return (
    <header className="fixed w-full bg-white shadow-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link
            href="/"
            className=" relative text-3xl w-[140px] h-[60px] md:w-[170px] md:h-[80px] font-extrabold text-blue-900 tracking-tighter"
          >
            <span className="sr-only">
              투데이태백 - 내일의 중심이 되는 뉴스
            </span>
            <Image
              src="/images/logo.png" // 블랙 로고로 변경 권장
              alt="투데이태백 로고"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* PC Menu */}
          <nav className="hidden md:flex space-x-12">
            {menus.map((menu, idx) => (
              <div key={idx} className="relative group py-6">
                <span className="text-gray-800 font-semibold cursor-pointer hover:text-blue-700">
                  {menu.title}
                </span>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-48 bg-white border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-b-lg overflow-hidden">
                  {menu.sub.map((subItem, subIdx) => (
                    <Link
                      key={subIdx}
                      href={subItem.path}
                      className={`block px-5 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                        pathname === subItem.path
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-600"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4 shadow-inner">
            {menus.map((menu, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-4">
                <div className="font-bold text-gray-900 mb-2">{menu.title}</div>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {menu.sub.map((subItem, subIdx) => (
                    <Link
                      key={subIdx}
                      href={subItem.path}
                      className="text-sm text-gray-600 hover:text-blue-700 py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

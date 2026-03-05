import React from "react";
import { ShieldCheck, Globe, Users, PenTool, Radio, Heart } from "lucide-react"; // lucide-react 아이콘 사용 권장
import Link from "next/link";

export default function CompanyOverview() {
  const infoItems = [
    {
      icon: <ShieldCheck size={28} />,
      label: "매체명",
      value: "투데이태백 (Today Taebaek)",
    },
    { icon: <PenTool size={28} />, label: "발행인", value: "김균식" },
    { icon: <Radio size={28} />, label: "등록번호", value: "268-06-03022" },
    {
      icon: <Globe size={28} />,
      label: "서비스 영역",
      value: "정치, 경제, 사회, 문화, 지역 정보",
    },
    {
      icon: <Users size={28} />,
      label: "소재지",
      value: "강원특별자치 태백시 석공길28-14(장성동)",
    },
    {
      icon: <Heart size={28} />,
      label: "핵심 가치",
      value: "정론직필, 시민참여, 지역상생",
    },
  ];

  return (
    <section className="bg-slate-900 py-24 md:py-32 relative overflow-hidden">
      {/* 배경 장식 (뉴스 테마의 디지털 그리드 느낌) */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-blue-500 font-bold tracking-widest uppercase mb-4">
              Corporate Overview
            </h2>
            <p className="text-4xl md:text-5xl font-black text-white leading-tight">
              투데이태백의 <br />
              <span className="text-slate-500">투명한 정보</span>
            </p>
          </div>
          <p className="text-slate-400 max-w-sm text-lg font-light leading-relaxed">
            언론사의 기본 정보를 투명하게 공개하여{" "}
            <br className="hidden md:block" />
            독자와의 신뢰를 최우선으로 합니다.
          </p>
        </div>

        {/* 개요 그리드 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {infoItems.map((item, idx) => (
            <div
              key={idx}
              className="group bg-slate-900 p-10 hover:bg-slate-800/50 transition-all duration-300"
            >
              <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                {item.icon}
              </div>
              <p className="text-slate-500 text-sm font-bold tracking-wider mb-2 uppercase">
                {item.label}
              </p>
              <p className="text-white text-xl font-medium leading-snug">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* 하단 미션 선언 */}
        <div className="mt-20 p-10 md:p-16 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                "진실을 넘어 가치를 전달합니다"
              </h3>
              <p className="text-blue-100 text-lg font-light">
                투데이태백은 지역사회의 건강한 공론장을 지향합니다.
              </p>
            </div>
            <Link href="/company/inquiry/report">
              <button className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 whitespace-nowrap">
                제보하기 문의
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

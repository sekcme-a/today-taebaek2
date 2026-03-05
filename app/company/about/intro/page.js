import React from "react";

export default function AboutIntro() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section: 감각적인 헤더 */}
      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-blue-400 uppercase border border-blue-400/30 rounded-full bg-blue-400/10">
            About Today Taebaek
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            진실을 비추는{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              투명한 거울
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-light leading-relaxed">
            세상의 모든 이야기를 가장 정직하고 빠르게 전달합니다.
            <br className="hidden md:block" />
            우리는 지역을 넘어 시대의 목소리를 담습니다.
          </p>
        </div>
      </section>

      {/* Content Section: CEO 인사말 */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Side Info: 비전 요약 */}
          <div className="lg:col-span-4 space-y-8 pt-20">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Core Values
              </h3>
              <ul className="space-y-4">
                {[
                  {
                    title: "정론직필",
                    desc: "치우침 없이 사실만을 기록합니다.",
                  },
                  {
                    title: "성역 없는 취재",
                    desc: "권력에 흔들리지 않는 독립된 언론.",
                  },
                  {
                    title: "지역의 등불",
                    desc: "소외된 이웃의 작은 목소리에도 귀를 기울입니다.",
                  },
                ].map((item, idx) => (
                  <li key={idx} className="flex flex-col">
                    <span className="text-blue-600 font-bold text-sm">
                      {item.title}
                    </span>
                    <span className="text-slate-600 text-sm">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden lg:block">
              <div className="h-40 w-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center text-white p-8">
                <p className="text-lg font-medium italic text-center">
                  {`  "독자의 신뢰가`}
                  <br />
                  {` 우리의 유일한 자산입니다."`}
                </p>
              </div>
            </div>
          </div>

          {/* Main Message: 인사말 본문 */}
          <div className="lg:col-span-8 bg-white p-10 md:p-20 shadow-2xl shadow-slate-200/50 rounded-[40px] border border-slate-50 relative">
            <div className="absolute top-10 right-10 text-9xl font-serif text-slate-50 select-none">
              {`"`}
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                <span className="w-8 h-1 bg-blue-600"></span>
                CEO 인사말
              </h2>

              <div className="space-y-8 text-slate-700 text-lg leading-[1.8] font-light">
                <p className="text-xl font-semibold text-slate-900">
                  안녕하십니까, 투데이태백 대표이사 김균식입니다.
                </p>

                <p>
                  정보의 홍수 속에서 진실을 가려내는 일은 그 어느 때보다
                  중요해졌습니다. 가짜 뉴스가 범람하고 편향된 정보가 여론을
                  왜곡하는 시대에,
                  <strong> 투데이태백</strong>은 오직{" "}
                  <span className="text-blue-600 font-medium">{`'팩트'`}</span>
                  와{" "}
                  <span className="text-blue-600 font-medium">{`'진실'`}</span>
                  이라는 언론 본연의 가치를 지키기 위해 탄생했습니다.
                </p>

                <p>
                  우리는 어떠한 권력이나 자본의 외압에도 흔들리지 않는
                  <span className="bg-blue-50 px-1 font-medium">
                    성역 없는 취재
                  </span>
                  를 약속드립니다. 사회의 어두운 곳을 밝히는 등불이 되고, 소외된
                  이웃의 작은 목소리도 크게 듣는 따뜻한 언론이 되겠습니다.
                </p>

                <p>
                  독자 여러분의 날카로운 비판과 따뜻한 격려가 투데이태백을
                  성장시키는 가장 큰 원동력입니다. 앞으로도 초심을 잃지 않고
                  정론직필의 길을 묵묵히 걸어가겠습니다. 감사합니다.
                </p>
              </div>

              <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col items-end">
                <p className="text-slate-500 text-sm mb-2 italic">
                  Truth & Transparency
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-xl text-slate-900">투데이태백 대표이사</p>
                  <p className="text-3xl font-serif font-bold text-slate-900 tracking-widest">
                    김 균 식
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Decoration */}
      <footer className="py-12 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm">
          © 2026 Today Taebaek. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

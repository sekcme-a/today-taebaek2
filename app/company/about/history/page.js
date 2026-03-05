export default function AboutHistory() {
  const histories = [
    {
      year: "2026",
      events: [
        { month: "12", desc: "투데이태백 모바일 전용 앱(App) 출시" },
        { month: "09", desc: "제1회 '서부 탐사보도상' 제정 및 시상식 개최" },
        {
          month: "03",
          desc: "투데이태백 공식 홈페이지 전면 개편 및 정식 오픈",
        },
        { month: "01", desc: "(주)투데이태백 법인 설립 및 정기간행물 등록" },
      ],
    },
    {
      year: "2025",
      events: [
        { month: "11", desc: "창립 준비 위원회 발족" },
        { month: "08", desc: "시민 기자단 1기 모집" },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">회사연혁</h1>
        <p className="text-xl text-gray-500">
          투데이태백가 걸어온 올곧은 발자취입니다.
        </p>
      </div>

      <div className="space-y-16">
        {histories.map((hist, idx) => (
          <div key={idx} className="flex flex-col md:flex-row gap-8">
            <div className="md:w-32 flex-shrink-0">
              <h2 className="text-5xl font-black text-blue-100">{hist.year}</h2>
            </div>
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-2xl"></div>
              <ul className="space-y-6">
                {hist.events.map((event, eIdx) => (
                  <li key={eIdx} className="flex items-start">
                    <span className="text-xl font-bold text-blue-700 w-16 pt-0.5">
                      {event.month}
                    </span>
                    <span className="text-lg text-gray-700">{event.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "투데이태백 - 소개페이지",
  description:
    "흔들리지 않는 원칙으로 시대의 흐름을 읽고, 독자 여러분께 가장 빠르고 정확한 뉴스를 전달합니다.",
};

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden py-32">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-lg">
            진실을 향한 <span className="text-blue-400">담대한 걸음</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            흔들리지 않는 원칙으로 시대의 흐름을 읽고,
            <br className="hidden md:block" />
            독자 여러분께 가장 빠르고 정확한 뉴스를 전달합니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/about/intro"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition shadow-lg"
            >
              투데이태백 소개
            </Link>
            <Link
              href="/inquiry/report"
              className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-full font-bold text-lg transition shadow-lg"
            >
              기사 제보하기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Quick Info */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                📰
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                정론직필
              </h3>
              <p className="text-gray-600">
                어떤 권력에도 타협하지 않고
                <br />
                오직 팩트만을 전달합니다.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                신속정확
              </h3>
              <p className="text-gray-600">
                24시간 깨어있는 취재망으로
                <br />
                누구보다 빠르게 소식을 전합니다.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                🤝
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                독자중심
              </h3>
              <p className="text-gray-600">
                독자의 목소리에 귀 기울이며
                <br />
                소통하는 언론이 되겠습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

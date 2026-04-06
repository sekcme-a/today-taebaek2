"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Swiper 필수 스타일
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// props로 데이터를 직접 받습니다.
export default function YoutubeSlider({ initialLinks = [] }) {
  const getYouTubeId = (url) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  if (initialLinks.length === 0) return null;

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          추천 영상
        </h3>
      </div>

      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          loop
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="rounded-xl overflow-hidden shadow-md border border-gray-100"
        >
          {initialLinks.map((link) => {
            const videoId = getYouTubeId(link.url);
            return (
              <SwiperSlide key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative aspect-video group/item"
                >
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt={link.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-red-600 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-semibold line-clamp-1">
                      {link.title}
                    </p>
                  </div>
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #fff !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background: #fff !important;
          opacity: 1;
        }
        .swiper-pagination {
          bottom: 10px !important;
        }
      `}</style>
    </div>
  );
}

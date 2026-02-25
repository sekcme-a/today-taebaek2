import Image from "next/image";
import Link from "next/link";

export default function MyPageNavbar({ selectedMenu }) {
  const item = [
    { name: "내 댓글", link: "/mypage/comments" },
    { name: "북마크", link: "/mypage/bookmarks" },
    { name: "프로필", link: "/mypage/profile" },
  ];
  return (
    <div className="flex  py-3 justify-between items-center border-b border-white">
      <div className="flex items-center">
        <Link
          href="/"
          title="투데이태백 홈으로 이동"
          className="relative w-[100px] h-[33px] md:w-[150px] md:h-[50px] block"
        >
          <Image
            src="/images/logo_white.png"
            alt="투데이태백"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>
        <h1 className="text-xl font-bold">마이페이지</h1>
      </div>
      <ul className="flex gap-x-7 pr-3">
        {item.map((menu) => (
          <li
            key={menu.name}
            className={`cursor-pointer hover:text-white ${
              selectedMenu === menu.name ? "font-bold" : "text-gray-300"
            }`}
          >
            <Link href={menu.link}>{menu.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

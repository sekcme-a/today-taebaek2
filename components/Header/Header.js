import Image from "next/image";
import HeaderClient from "./HeaderClient";
import NavList from "./NavList";
import { getCategories } from "@/utils/supabase/getCategories";
import Link from "next/link";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export default async function Header({ scrolled, hasH1 }) {
  // return res.json();
  const supabase = await createServerSupabaseClient();
  const categories = await getCategories();

  // 세션 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 여부 (Boolean)
  const isSignedIn = !!user;

  return (
    <HeaderClient
      scrolled={scrolled}
      categories={categories}
      isSignedIn={isSignedIn}
    >
      {hasH1 ? (
        <h1>
          <Link
            href="/"
            className="relative w-[120px] h-[33px] md:w-[170px] md:h-[50px] block"
          >
            <span class="sr-only">투데이태백 - 오늘의 태백 뉴스</span>
            <Image
              src="/images/logo_white.png"
              alt="투데이태백 로고"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        </h1>
      ) : (
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
      )}
      <NavList />
    </HeaderClient>
  );
}

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse } from "next/server";

// export const applyMiddlewareSupabaseClient = async (request) => {
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         getAll() {
//           const all = request.cookies.getAll();
//           return all.map(({ name, value }) => ({ name, value }));
//         },
//         setAll(cookiesToSet) {
//           for (const cookie of cookiesToSet) {
//             request.cookies.set(cookie);
//             response = NextResponse.next({
//               request: {
//                 headers: request.headers,
//               },
//             });
//             response.cookies.set(cookie);
//           }
//         },
//       },
//     }
//   );

//   await supabase.auth.getUser();

//   return response;
// };

// export async function middleware(request) {
//   return await applyMiddlewareSupabaseClient(request);
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 여기서 response를 새로 생성하지 않고 기존 response에 쿠키를 심습니다.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value); // 요청 가공
            response.cookies.set(name, value, options); // 응답에 반영
          });
        },
      },
    },
  );

  // 세션 토큰이 만료되었다면 여기서 자동으로 갱신(Refresh)을 시도합니다.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

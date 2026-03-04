// "use server";

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// export const createServerSupabaseClient = async (
//   cookieStore = cookies(),
//   admin = false
// ) => {
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     // admin
//     false
//       ? process.env.NEXT_SUPABASE_SERVICE_ROLE
//       : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         getAll() {
//           const all = cookieStore.getAll();
//           return all.map(({ name, value }) => ({ name, value }));
//         },
//         setAll(cookiesToSet) {
//           for (const cookie of cookiesToSet) {
//             try {
//               cookieStore.set(cookie);
//             } catch (error) {
//               // Ignore errors in Server Component context
//             }
//           }
//         },
//       },
//     }
//   );
// };

// export const createServerSupabaseAdminClient = async (
//   cookieStore = cookies()
// ) => {
//   return createServerSupabaseClient(cookieStore, true);
// };
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServerSupabaseClient = async () => {
  // Next.js 15 이상에서는 cookies()가 Promise를 반환하므로 await가 필요합니다.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component 환경에서는 set이 불가능하므로 무시합니다.
            // 실제 갱신은 middleware에서 수행됩니다.
          }
        },
      },
    },
  );
};

export const createServerSupabaseAdminClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SUPABASE_SERVICE_ROLE, // Admin용 Service Role Key
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
};

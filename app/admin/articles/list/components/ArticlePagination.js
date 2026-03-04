"use client"; // ✅ 반드시 최상단에

import Pagination from "@mui/material/Pagination";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function ArticlePagination({
  currentPage,
  totalPages,
  category,
  search = "",
}) {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (event, page) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("page", page);

    router.push(`/admin/articles/list?${params.toString()}`);
  };

  return (
    <div className="mt-10 flex justify-center">
      <Pagination
        count={totalPages}
        page={Number(currentPage)}
        onChange={handleChange}
        variant="outlined"
        color="primary"
        showFirstButton
        showLastButton
        size={isSmallScreen ? "small" : "medium"}
      />
    </div>
  );
}

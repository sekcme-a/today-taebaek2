"use client";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useState, useRef, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { getCategories } from "@/utils/supabase/getCategories";
import Link from "next/link";

const supabase = createBrowserSupabaseClient();

const fetchCategories = async () => {
  console.log("Supabase에서 카테고리 데이터 로딩 시작...");

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent_id, order, slug")
    .order("order", { ascending: true });

  if (error) {
    console.error("Supabase 카테고리 로딩 오류:", error);
    throw new Error("카테고리 데이터를 불러오는 데 실패했습니다.");
  }

  return data;
};

const buildCategoryTree = (categories) => {
  const map = {};
  const tree = [];

  categories.forEach((category) => {
    map[category.id] = { ...category, children: [] };
  });

  categories.forEach((category) => {
    const item = map[category.id];
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(item);
    } else {
      tree.push(item);
    }
  });

  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };

  sortTree(tree);
  return tree;
};

export default function SideNavbar({ categoriess, onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const sideNavRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const categoryTree = buildCategoryTree(categoriess);
        setCategories(categoryTree);
      } catch (e) {
        setError(e.message || "알 수 없는 오류가 발생했습니다.");
        console.error("카테고리 로딩 실패:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (sideNavRef.current) {
          sideNavRef.current.classList.remove("translate-x-full");
          sideNavRef.current.classList.add("translate-x-0");
        }
      }, 50);
    }
  }, [isOpen]);

  const closeSidebar = () => {
    if (sideNavRef.current) {
      sideNavRef.current.classList.remove("translate-x-0");
      sideNavRef.current.classList.add("translate-x-full");
    }

    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const CategoryItem = ({ category }) => {
    const hasChildren = category.children && category.children.length > 0;
    const [isExpanded, setIsExpanded] = useState(false);

    const href = `/${category.slug}`;

    return (
      <li className="mb-1">
        <div className="flex items-center justify-between">
          <a
            href={href}
            onClick={closeSidebar}
            className="flex-grow p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-150 font-medium"
          >
            {category.name}
          </a>
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 ml-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition duration-150"
              aria-expanded={isExpanded}
              aria-controls={`submenu-${category.id}`}
            >
              <ArrowRightIcon
                className={`transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          )}
        </div>

        {hasChildren && (
          <ul
            id={`submenu-${category.id}`}
            className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}
          >
            {category.children.map((child) => (
              <CategoryItem key={child.id} category={child} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <button
        onClick={() => {
          onClick();
          setTimeout(() => {
            setIsOpen(true);
          }, 200);
        }}
        className="ml-[10px] cursor-pointer"
      >
        <MenuRoundedIcon style={{ color: "white", fontSize: "28px" }} />
      </button>

      {isOpen && (
        <>
          {/* 검은색 배경, 50% 투명 */}
          <div
            className="fixed inset-0 bg-black opacity-50 z-40 transition-opacity duration-300"
            onClick={closeSidebar}
          ></div>

          {/* 사이드 메뉴 */}
          <div
            ref={sideNavRef}
            className="fixed top-0 right-0 w-64 md:w-80 h-full bg-white 
            shadow-xl transform transition-transform duration-300 ease-in-out 
            z-50 translate-x-full p-6
            overflow-y-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-8">
              <button
                onClick={closeSidebar}
                className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition duration-150"
                aria-label="Close sidebar"
              >
                <CloseRoundedIcon style={{ fontSize: "24px" }} />
              </button>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-4 mb-6">
              투데이태백
            </h2>

            <nav className="overflow-y-auto max-h-[calc(100vh-150px)]">
              {error ? (
                <div className="text-center py-8 text-red-500">
                  <p>⚠️ 데이터 로딩 실패: {error}</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                  <p>카테고리 로딩 중...</p>
                </div>
              ) : categories.length === 0 ? (
                <p className="text-gray-500">등록된 카테고리가 없습니다.</p>
              ) : (
                <ul>
                  {categories.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))}

                  <li className="mb-1">
                    <div className="flex-grow p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-150 font-medium">
                      <Link href="/article/pdf" onClick={closeSidebar}>
                        <div className="flex items-center justify-between">
                          PDF 지면 보기
                        </div>
                      </Link>
                    </div>
                  </li>
                </ul>
              )}
            </nav>

            {/* <div className=" bottom-0 left-0 right-0 p-6 border-t text-sm text-gray-400">
              <p>투데이태백</p>
            </div> */}
          </div>
        </>
      )}
    </>
  );
}

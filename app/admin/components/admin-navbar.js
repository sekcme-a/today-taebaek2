export const MENU = [
  {
    text: "대쉬보드",
    link: "/",
  },

  {
    text: "기사 관리",
    items: [
      {
        text: "기사 목록",
        link: "/articles/list",
      },
      {
        text: "안산 보도자료",
        link: "/routine/ansan",
        role: "super_admin",
      },
      {
        text: "시흥 보도자료",
        link: "/routine/sihueng",
        role: "super_admin",
      },
    ],
  },
  {
    text: "카테고리 관리",
    link: "/categories",
  },
  {
    text: "오늘의 루틴2",
    link: "/routine2",
    role: "super_admin",
  },
  {
    text: "이메일 보도자료",
    link: "/email",
    role: "super_admin",
  },
  {
    text: "광고(배너) 관리",
    link: "/advertisements",
  },
  {
    text: "지면 PDF 관리",
    link: "/articles/pdf",
  },
];

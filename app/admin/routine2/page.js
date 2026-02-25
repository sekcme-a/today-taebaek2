"use client";

import { useState } from "react";
import Settings from "./Settings";
import dayjs from "dayjs";
import Ansan from "./Ansan";
import { useEffect } from "react";
import { Button } from "@mui/material";
import AnsanRoom from "./AnsanRoom";
import Siheung from "./Siheung";
import SiheungRoom from "./SiheungRoom";
import Incheon from "./Incheon";
import IncheonRoom from "./IncheonRoom";

export default function Routine2() {
  const [page, setPage] = useState(0);

  // 지역별 크롤링 설정 상태
  const [settings, setSettings] = useState({
    ansan: { enabled: true, startDate: dayjs(), endDate: dayjs() },
    siheung: { enabled: true, startDate: dayjs(), endDate: dayjs() },
    incheon: { enabled: true, startDate: dayjs(), endDate: dayjs() },
  });

  // 기자 설정을 위한 상태 (항상 문자열로 관리)
  const [authors, setAuthors] = useState({
    ansan: "",
    taebaek: "",
    incheon: "",
    siheung: "",
    seobu: "",
  });

  const [history, setHistory] = useState([]);
  // [{type:"success"||"error", message:"", articleIds:[]}]

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    console.log(history);
  }, [history]);

  if (page === 0)
    return (
      <>
        <Settings
          setPage={setPage}
          settings={settings}
          setSettings={setSettings}
          {...{ authors, setAuthors }}
        />
      </>
    );
  if (page === 1)
    return (
      <>
        <Ansan
          setPage={setPage}
          settings={settings.ansan}
          setHistory={setHistory}
          posts={posts}
          setPosts={setPosts}
          authors={authors.ansan.split(",").map((name) => name.trim())}
        />
        <PageButtons setPage={setPage} />
      </>
    );

  if (page === 2)
    return (
      <>
        <AnsanRoom
          posts={posts}
          setRoomPage={setPage}
          authors={authors.ansan.split(",").map((name) => name.trim())}
        />
        <PageButtons setPage={setPage} />
      </>
    );
  if (page === 3)
    return (
      <>
        <Siheung
          setPage={setPage}
          settings={settings.siheung}
          setHistory={setHistory}
          posts={posts}
          setPosts={setPosts}
          authors={authors.siheung.split(",").map((name) => name.trim())}
        />
        <PageButtons setPage={setPage} />
      </>
    );
  if (page === 4)
    return (
      <>
        <SiheungRoom
          posts={posts}
          setRoomPage={setPage}
          authors={authors.siheung.split(",").map((name) => name.trim())}
        />
        <PageButtons setPage={setPage} />
      </>
    );
  if (page === 5)
    return (
      <>
        <Incheon
          setPage={setPage}
          settings={settings.incheon}
          setHistory={setHistory}
          posts={posts}
          setPosts={setPosts}
          authors={authors.incheon.split(",").map((name) => name.trim())}
        />
        <PageButtons setPage={setPage} />
      </>
    );
  if (page === 6)
    return (
      <>
        <IncheonRoom
          posts={posts}
          setRoomPage={setPage}
          authors={authors.incheon.split(",").map((name) => name.trim())}
        />
        <PageButtons setPage={setPage} />
      </>
    );
}

const PageButtons = ({ setPage }) => {
  return (
    <div className="flex mt-2 gap-x-2">
      <Button
        variant="outlined"
        fullWidth
        onClick={() => setPage((prev) => prev - 1)}
        sx={{ flex: 1 }}
      >
        이전으로
      </Button>
      <Button
        variant="outlined"
        fullWidth
        onClick={() => setPage((prev) => prev + 1)}
        sx={{ flex: 1 }}
      >
        다음으로
      </Button>
    </div>
  );
};

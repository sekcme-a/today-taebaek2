"use client";

import { useState } from "react";
import { EmailSearchPage } from "./components/EmailSearchPage";
import { EmailNavigationPage } from "./components/EmailNavigationPage";

export default function Email() {
  const [page, setPage] = useState(0);

  // 공통 상태
  const [searchSender, setSearchSender] = useState("");
  const [searchSubject, setSearchSubject] = useState("보도");
  const [searchDate, setSearchDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [emailList, setEmailList] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleEmail = (mail) => {
    const isSelected = selectedEmails.some((item) => item.uid === mail.uid);
    if (isSelected) {
      setSelectedEmails(selectedEmails.filter((item) => item.uid !== mail.uid));
    } else {
      setSelectedEmails([...selectedEmails, mail]);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        senders: searchSender,
        subject: searchSubject,
        after: searchDate,
      });
      const res = await fetch(`/api/mail?${params.toString()}`);
      const data = await res.json();
      setEmailList(data.filter((mail) => mail.hasAttachments));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {page === 0 ? (
        <EmailSearchPage
          searchSender={searchSender}
          setSearchSender={setSearchSender}
          searchSubject={searchSubject}
          setSearchSubject={setSearchSubject}
          searchDate={searchDate}
          setSearchDate={setSearchDate}
          emailList={emailList}
          loading={loading}
          fetchEmails={fetchEmails}
          selectedEmails={selectedEmails}
          toggleEmail={toggleEmail}
          onStartWork={() => setPage(1)}
        />
      ) : (
        <EmailNavigationPage
          selectedEmails={selectedEmails}
          onGoBack={() => setPage(0)}
        />
      )}
    </>
  );
}

"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  Box,
  Switch,
  Typography,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Button,
  TextField,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Settings({
  setPage,
  settings,
  setSettings,
  authors,
  setAuthors,
}) {
  const supabase = createBrowserSupabaseClient();

  const [autoEnabled, setAutoEnabled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState(
    dayjs().set("hour", 9).set("minute", 0),
  );

  // 코드 상단에 현재 날짜를 추적하기 위한 state가 필요하다면 추가 (또는 전역 변수 활용)
  const [lastCheckedDate, setLastCheckedDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );

  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 1. 지역별 날짜 데이터 로딩
      const { data, error } = await supabase
        .from("routine2")
        .select("type, date")
        .in("type", ["ansan", "siheung", "incheon"]);

      if (error) {
        console.error("데이터 로딩 실패:", error);
      } else {
        const today = dayjs().startOf("day");
        const updatedSettings = { ...settings };

        data?.forEach((row) => {
          if (updatedSettings[row.type]) {
            const lastDate = dayjs(row.date).startOf("day");
            const nextDay = lastDate.add(1, "day");

            updatedSettings[row.type].startDate = nextDay;
            updatedSettings[row.type].endDate = today;
            updatedSettings[row.type].enabled = !nextDay.isAfter(today);
          }
        });
        setSettings(updatedSettings);
      }

      // 2. 기자 명단 데이터 로딩 (배열을 문자열로 변환하여 상태에 저장)
      const { data: authorData } = await supabase
        .from("routine2")
        .select("data")
        .eq("type", "authors")
        .single();

      if (authorData && authorData.data) {
        const rawAuthors = authorData.data;
        const formattedForInput = {};

        // DB의 배열 데이터를 "김기자, 이기자" 형태의 문자열로 변환
        Object.keys(authors).forEach((key) => {
          const val = rawAuthors[key];
          formattedForInput[key] = Array.isArray(val)
            ? val.join(", ")
            : val || "";
        });
        setAuthors(formattedForInput);
      }

      // 3. schedule_time 데이터 로딩 (추가됨)
      const { data: scheduleData } = await supabase
        .from("routine2")
        .select("date")
        .eq("type", "schedule_time")
        .single();

      if (scheduleData && scheduleData.date) {
        setScheduleTime(dayjs(scheduleData.date));
        setAutoEnabled(true); // 저장된 시간이 있으면 스위치를 켬
      }
    };

    const fetchIsWorking = async () => {
      const { data } = await supabase
        .from("routine2")
        .select("date")
        .eq("type", "check_button")
        .single();

      if (data && data.date) {
        const lastCheck = dayjs(data.date);
        const now = dayjs();
        if (now.diff(lastCheck, "minute") <= 10) {
          setIsWorking(true);
        } else {
          setIsWorking(false);
        }
      }
    };

    fetchData();
    fetchIsWorking();
  }, []);

  const handleToggle = (city) => {
    const { startDate, endDate, enabled } = settings[city];
    if (!enabled && startDate.isAfter(endDate)) {
      alert("시작 날짜가 종료 날짜보다 늦을 수 없습니다.");
      return;
    }
    setSettings((prev) => ({
      ...prev,
      [city]: { ...prev[city], enabled: !prev[city].enabled },
    }));
  };

  const handleDateChange = (city, field, value) => {
    setSettings((prev) => {
      const newState = {
        ...prev,
        [city]: { ...prev[city], [field]: value },
      };
      if (newState[city].startDate.isAfter(newState[city].endDate)) {
        newState[city].enabled = false;
      }
      return newState;
    });
  };

  const handleAuthorChange = (city, value) => {
    setAuthors((prev) => ({
      ...prev,
      [city]: value,
    }));
  };

  const handleSaveAndStart = async () => {
    navigator.clipboard.writeText("");
    // 저장하기 전 문자열을 다시 배열로 변환 (방어 코드 추가)
    const formattedAuthors = Object.keys(authors).reduce((acc, key) => {
      const value = authors[key];
      if (typeof value === "string") {
        acc[key] = value
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);
      } else if (Array.isArray(value)) {
        acc[key] = value;
      } else {
        acc[key] = [];
      }
      return acc;
    }, {});

    const { error } = await supabase
      .from("routine2")
      .upsert(
        { type: "authors", data: formattedAuthors },
        { onConflict: "type" },
      );
    await supabase
      .from("routine2")
      .upsert(
        { type: "schedule_time", date: scheduleTime.toISOString() },
        { onConflict: "type" },
      );

    if (error) {
      alert("저장 중 오류가 발생했습니다.");
      console.error(error);
    } else {
      setPage(1);
    }
  };

  const handleCheckButton = async () => {
    const now = dayjs();
    const todayStr = now.format("YYYY-MM-DD");

    try {
      // 1. Supabase에 현재 체크 시간 기록
      await supabase
        .from("routine2")
        .upsert(
          { type: "check_button", date: now.toISOString() },
          { onConflict: "type" },
        );

      // 2. 날짜 변경 여부 확인 (기존 저장된 날짜와 현재 날짜 비교)
      if (lastCheckedDate !== todayStr) {
        console.log("날짜가 변경되었습니다. 페이지를 새로고침합니다.");
        // 상태 업데이트 후 새로고침 (혹은 즉시 새로고침)
        window.location.reload();
      }

      // 만약 현재 PC 시간이 scheduleTime ~ +/-5분 이내라면 "do_crawling" 클립보드에 복사하기
      const scheduledHour = scheduleTime.hour();
      const scheduledMinute = scheduleTime.minute();

      const lowerBound = now
        .set("hour", scheduledHour)
        .set("minute", scheduledMinute)
        .subtract(5, "minute");
      const upperBound = now
        .set("hour", scheduledHour)
        .set("minute", scheduledMinute)
        .add(5, "minute");

      if (now.isAfter(lowerBound) && now.isBefore(upperBound)) {
        await navigator.clipboard.writeText("do_crawling");
        console.log("클립보드에 'do_crawling' 복사됨");
      } else {
        console.log("현재 시간이 예약된 시간 범위 내에 있지 않습니다.");
      }
    } catch (error) {
      console.error("체크 업데이트 중 오류 발생:", error);
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 650, mx: "auto" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          크롤링 관리 시스템
        </Typography>

        {/* 자동화 섹션 */}
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 4, bgcolor: "#f0f4f8", borderRadius: 2 }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                완전 자동화 스케줄러
              </Typography>
              <Typography variant="body2" color="text.secondary">
                정해진 시간에 자동으로 크롤링을 시작합니다.
              </Typography>
            </Box>
            <Switch
              checked={autoEnabled}
              onChange={(e) => setAutoEnabled(e.target.checked)}
              color="primary"
            />
          </Stack>
          {autoEnabled && (
            <Box sx={{ mt: 2 }}>
              <TimePicker
                label="매일 실행 시간 설정"
                value={scheduleTime}
                onChange={(newValue) => setScheduleTime(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: { bgcolor: "white" },
                  },
                }}
              />
            </Box>
          )}
          <p
            className={`${isWorking ? "text-green-700" : "text-red-700"} mt-2 font-bold`}
          >
            {isWorking
              ? "컴퓨터와 연결되어 있습니다."
              : "컴퓨터와 연결되어있지 않습니다."}
          </p>
          <Button
            fullWidth
            variant="contained"
            sx={{ height: 50, mt: 2 }}
            onClick={handleCheckButton}
          >{`체킹버튼(직접 누르지 마시오)`}</Button>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* 지역별 날짜 설정 */}
        {Object.entries({
          ansan: "안산 보도자료",
          siheung: "시흥 보도자료",
          incheon: "인천 보도자료",
        }).map(([key, label]) => {
          const isInvalidDate = settings[key].startDate.isAfter(
            settings[key].endDate,
          );
          const isEnabled = settings[key].enabled;

          return (
            <Box
              key={key}
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: isEnabled ? "primary.light" : "#eee",
                bgcolor: isEnabled ? "transparent" : "#fcfcfc",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: isEnabled ? "text.primary" : "text.disabled",
                  }}
                >
                  {label}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isEnabled}
                      onChange={() => handleToggle(key)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight="bold">
                      {isEnabled ? "ON" : "OFF"}
                    </Typography>
                  }
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="시작 날짜"
                  value={settings[key].startDate}
                  onChange={(val) => handleDateChange(key, "startDate", val)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: isInvalidDate,
                    },
                  }}
                />
                <DatePicker
                  label="종료 날짜"
                  value={settings[key].endDate}
                  onChange={(val) => handleDateChange(key, "endDate", val)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: isInvalidDate,
                    },
                  }}
                />
              </Stack>
            </Box>
          );
        })}

        <Divider sx={{ my: 4 }} />

        {/* 기자 설정 섹션 */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          기자 명단 설정
        </Typography>
        <Paper
          variant="outlined"
          sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: "#fafafa" }}
        >
          {[
            { id: "ansan", label: "안산" },
            { id: "taebaek", label: "태백" },
            { id: "incheon", label: "인천" },
            { id: "siheung", label: "시흥" },
            { id: "seobu", label: "서부" },
          ].map((city) => (
            <Box key={city.id} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={`${city.label} 담당 기자`}
                variant="outlined"
                size="small"
                placeholder="쉼표(,)로 구분 (예: 김기자, 이기자)"
                value={authors[city.id] || ""}
                onChange={(e) => handleAuthorChange(city.id, e.target.value)}
                sx={{ bgcolor: "white" }}
              />
            </Box>
          ))}
        </Paper>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
          onClick={() => {
            window.open("http://icinews.co.kr/icms/login.do", "_blank");
          }}
        >
          인천시사뉴스 열기
        </Button>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
          onClick={() => {
            window.open("http://shinews.co.kr/icms/login.do", "_blank");
          }}
        >
          시흥인터넷뉴스 열기
        </Button>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
          onClick={() => {
            window.open("http://asinews.co.kr/icms/login.do", "_blank");
          }}
        >
          안산인터넷뉴스 열기
        </Button>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
          onClick={() => {
            window.open("https://chatgpt.com/", "_blank");
          }}
        >
          챗지피티 열기
        </Button>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
          onClick={handleSaveAndStart}
          disabled={Object.values(settings).some(
            (s) => s.enabled && s.startDate.isAfter(s.endDate),
          )}
        >
          설정 저장 및 크롤링 시작
        </Button>
      </Box>
    </LocalizationProvider>
  );
}

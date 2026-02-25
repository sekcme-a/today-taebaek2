import {
  Button,
  TextField,
  Stack,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Checkbox,
} from "@mui/material";

export function EmailSearchPage({
  searchSender,
  setSearchSender,
  searchSubject,
  setSearchSubject,
  searchDate,
  setSearchDate,
  emailList,
  loading,
  fetchEmails,
  selectedEmails,
  toggleEmail,
  onStartWork,
}) {
  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h5" fontWeight="bold">
        이메일 첨부파일 추출기
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="보낸 사람"
            value={searchSender}
            onChange={(e) => setSearchSender(e.target.value)}
            fullWidth
          />
          <TextField
            label="제목 포함 단어"
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            fullWidth
          />
          <TextField
            label="검색 시작 날짜"
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Button variant="contained" onClick={fetchEmails} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "검색"}
          </Button>
        </Stack>
      </Paper>

      <Button
        variant="contained"
        color="secondary"
        disabled={selectedEmails.length === 0}
        onClick={onStartWork}
        sx={{ height: 50 }}
      >
        {selectedEmails.length}개 선택됨 - 작업 시작
      </Button>

      {emailList.length > 0 && (
        <Paper variant="outlined" sx={{ maxHeight: 400, overflow: "auto" }}>
          <List>
            {emailList.map((mail) => {
              const isSelected = selectedEmails.some(
                (item) => item.uid === mail.uid,
              );
              return (
                <div key={mail.uid}>
                  <ListItemButton onClick={() => toggleEmail(mail)}>
                    <Checkbox checked={isSelected} edge="start" />
                    <ListItemText
                      primary={mail.subject}
                      secondary={`${mail.from} | ${new Date(mail.date).toLocaleString()}`}
                    />
                  </ListItemButton>
                  <Divider />
                </div>
              );
            })}
          </List>
        </Paper>
      )}
    </Stack>
  );
}

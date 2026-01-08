import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/ja"; // Optional: Japanese locale

dayjs.locale("ja");

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  // Navigation
  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleToday = () => setCurrentDate(dayjs());

  // Calendar Logic
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = currentDate.daysInMonth();

  // Generate grid cells
  const days = [];

  // Empty cells for previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Days of actual month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(startOfMonth.date(i));
  }

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", p: 2 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" fontWeight="bold">
            {currentDate.format("YYYY年 M月")}
          </Typography>
        </Box>
        <Box>
          <Button variant="outlined" onClick={handleToday} sx={{ mr: 2 }}>
            今日
          </Button>
          <IconButton onClick={handlePrevMonth}>
            <ArrowBack />
          </IconButton>
          <IconButton onClick={handleNextMonth}>
            <ArrowForward />
          </IconButton>
        </Box>
      </Paper>

      {/* Calendar Grid */}
      <Paper elevation={3} sx={{ p: 2 }}>
        {/* Container using CSS Grid for perfect alignment */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            rowGap: 1,
            columnGap: 1,
          }}
        >
          {/* Weekday Header */}
          {weekDays.map((day, index) => (
            <Box
              key={day}
              sx={{
                textAlign: "center",
                py: 1,
                borderBottom: "1px solid #eee",
              }}
            >
              <Typography
                fontWeight="bold"
                color={
                  index === 0
                    ? "error.main"
                    : index === 6
                    ? "info.main"
                    : "text.secondary"
                }
              >
                {day}
              </Typography>
            </Box>
          ))}

          {/* Days */}
          {days.map((date, index) => (
            <Box key={index} sx={{ minHeight: 80 }}>
              <Box
                sx={{
                  height: "100%",
                  border: "1px solid #f0f0f0",
                  borderRadius: 1,
                  p: 1,
                  bgcolor:
                    date && date.isSame(dayjs(), "day")
                      ? "#e3f2fd"
                      : "transparent",
                  cursor: date ? "pointer" : "default",
                  "&:hover": {
                    bgcolor: date ? "#f5f5f5" : "transparent",
                  },
                }}
              >
                {date && (
                  <Typography
                    variant="body2"
                    fontWeight={date.isSame(dayjs(), "day") ? "bold" : "normal"}
                  >
                    {date.date()}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Calendar;

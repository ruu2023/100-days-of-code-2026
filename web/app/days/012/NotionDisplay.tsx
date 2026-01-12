"use client";

import { NotionPage } from "./actions";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Grid,
  Box,
  Container,
  Stack,
  Link,
  useTheme,
} from "@mui/material";
import {
  Description as FileIcon,
  Link as LinkIcon,
  Event as DateIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

// Helper to render property values
const PropertyValue = ({ prop }: { prop: any }) => {
  if (!prop) return null;

  switch (prop.type) {
    case "rich_text":
      if (!prop.rich_text || prop.rich_text.length === 0) return null;
      return (
        <Typography variant="body2" color="text.secondary" noWrap>
          {prop.rich_text.map((t: any) => t.plain_text).join("")}
        </Typography>
      );
    case "number":
      return (
        <Chip
          label={prop.number}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ height: 20 }}
        />
      );
    case "select":
      if (!prop.select) return null;
      return (
        <Chip
          label={prop.select.name}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.75rem",
            backgroundColor:
              prop.select.color !== "default"
                ? `var(--notion-${prop.select.color})`
                : undefined,
          }}
        />
      );
    case "multi_select":
      if (!prop.multi_select || prop.multi_select.length === 0) return null;
      return (
        <Stack
          direction="row"
          spacing={0.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 0.5 }}
        >
          {prop.multi_select.map((opt: any) => (
            <Chip
              key={opt.id}
              label={opt.name}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.75rem",
              }}
            />
          ))}
        </Stack>
      );
    case "date":
      if (!prop.date) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <DateIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            {prop.date.start} {prop.date.end ? `→ ${prop.date.end}` : ""}
          </Typography>
        </Stack>
      );
    case "checkbox":
      return (
        <CheckIcon
          color={prop.checkbox ? "primary" : "disabled"}
          fontSize="small"
        />
      );
    case "url":
      if (!prop.url) return null;
      return (
        <Link
          href={prop.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "flex", alignItems: "center", fontSize: "0.8rem" }}
        >
          <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} /> Link
        </Link>
      );
    case "email":
      if (!prop.email) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <EmailIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption">{prop.email}</Typography>
        </Stack>
      );
    case "phone_number":
      if (!prop.phone_number) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PhoneIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption">{prop.phone_number}</Typography>
        </Stack>
      );
    case "files":
      if (!prop.files || prop.files.length === 0) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <FileIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption">{prop.files.length} Files</Typography>
        </Stack>
      );
    default:
      return null;
  }
};

export default function NotionDisplay({ data }: { data: NotionPage[] }) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Notion DB
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {data.length} Items Loaded from Database
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {data.map((page) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={page.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
              }}
            >
              {page.cover && (
                <CardMedia
                  component="img"
                  height="140"
                  image={page.cover}
                  alt="cover"
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: 3, pt: page.cover ? 2 : 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mb: 2,
                    gap: 1,
                  }}
                >
                  {page.icon &&
                    (page.icon.startsWith("http") ||
                    page.icon.startsWith("data:") ? (
                      <img
                        src={page.icon}
                        alt="icon"
                        style={{
                          width: 24,
                          height: 24,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Typography variant="h6" component="span">
                        {page.icon}
                      </Typography>
                    ))}
                  <Link
                    href={page.url}
                    target="_blank"
                    underline="hover"
                    color="inherit"
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      fontWeight="bold"
                      lineHeight={1.2}
                    >
                      {page.title || "Untitled"}
                    </Typography>
                  </Link>
                </Box>

                <Stack spacing={1.5}>
                  {Object.entries(page.properties).map(
                    ([key, prop]: [string, any]) => {
                      if (prop.id === "title") return null;
                      const content = PropertyValue({ prop });
                      if (!content) return null;

                      return (
                        <Box key={key}>
                          <Typography
                            variant="caption"
                            sx={{
                              textTransform: "uppercase",
                              fontWeight: 700,
                              color: "text.disabled",
                              fontSize: "0.65rem",
                              mb: 0.5,
                              display: "block",
                            }}
                          >
                            {key}
                          </Typography>
                          {content}
                        </Box>
                      );
                    }
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Notion Colors CSS Variables for custom coloring if needed, though MUI theme is preferred, this bridges the gap for colored tags */}
      <style global jsx>{`
        :root {
          --notion-gray: #e3e2e0;
          --notion-brown: #eee0da;
          --notion-orange: #fadec9;
          --notion-yellow: #fdecc8;
          --notion-green: #dbeddb;
          --notion-blue: #d3e5ef;
          --notion-purple: #e8deee;
          --notion-pink: #f5e0e9;
          --notion-red: #ffe2dd;
          --notion-default: #e0e0e0;
        }
      `}</style>
    </Container>
  );
}

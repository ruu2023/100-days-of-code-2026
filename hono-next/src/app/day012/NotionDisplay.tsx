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
} from "@mui/material";
import {
  Description as FileIcon,
  Link as LinkIcon,
  Event as DateIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

const PropertyValue = ({ prop }: { prop: unknown }) => {
  if (!prop) return null;
  const p = prop as Record<string, unknown>;

  switch (p.type) {
    case "rich_text":
      if (!p.rich_text || !(p.rich_text as Array<unknown>).length) return null;
      return (
        <Typography variant="body2" color="text.secondary" noWrap>
          {(p.rich_text as Array<{ plain_text: string }>).map((t) => t.plain_text).join("")}
        </Typography>
      );
    case "number":
      return (
        <Chip
          label={p.number as number | string}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ height: 20 }}
        />
      );
    case "select":
      if (!p.select) return null;
      return (
        <Chip
          label={(p.select as { name: string }).name}
          size="small"
          sx={{ height: 20, fontSize: "0.75rem" }}
        />
      );
    case "multi_select":
      if (!p.multi_select || !(p.multi_select as Array<unknown>).length) return null;
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
          {(p.multi_select as Array<{ id: string; name: string }>).map((opt) => (
            <Chip
              key={opt.id}
              label={opt.name}
              size="small"
              sx={{ height: 20, fontSize: "0.75rem" }}
            />
          ))}
        </Stack>
      );
    case "date":
      if (!p.date) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <DateIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            {(p.date as { start: string; end?: string }).start} {(p.date as { end?: string }).end ? `→ ${(p.date as { end: string }).end}` : ""}
          </Typography>
        </Stack>
      );
    case "checkbox":
      return (
        <CheckIcon
          color={(p.checkbox as boolean) ? "primary" : "disabled"}
          fontSize="small"
        />
      );
    case "url":
      if (!p.url) return null;
      return (
        <Link
          href={p.url as string}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "flex", alignItems: "center", fontSize: "0.8rem" }}
        >
          <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} /> Link
        </Link>
      );
    case "email":
      if (!p.email) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <EmailIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption">{p.email as string}</Typography>
        </Stack>
      );
    case "phone_number":
      if (!p.phone_number) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PhoneIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption">{p.phone_number as string}</Typography>
        </Stack>
      );
    case "files":
      if (!p.files || !(p.files as Array<unknown>).length) return null;
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <FileIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption">{(p.files as Array<unknown>).length} Files</Typography>
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
                    ([key, prop]: [string, unknown]) => {
                      if ((prop as { id?: string })?.id === "title") return null;
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

      <style>{`
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

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draw",
  description: "デジタルイラスト・お絵描きアプリ",
};

export default function Day057Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

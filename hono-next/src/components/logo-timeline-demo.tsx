import {
  BadgeHelp,
  Binary,
  Blocks,
  Braces,
  Cable,
  Cpu,
  Database,
  FileCog,
  FileCode2,
  Globe,
  Layers3,
  Microscope,
  MonitorSmartphone,
  Network,
  Orbit,
  Rocket,
  Sigma,
  TerminalSquare,
  Workflow,
} from "lucide-react"

import { LogoTimeline } from "@/components/ui/logo-timeline"
import type { LogoItem } from "@/components/ui/logo-timeline"

export interface ProgrammingLanguageHistoryItem extends Omit<LogoItem, "label"> {
  name: string
  yearLabel: string
  period: string
  creator: string
  purpose: string
  comparison: string
}

export const programmingLanguageHistory: ProgrammingLanguageHistoryItem[] = [
  {
    name: "A-0 System",
    yearLabel: "1951",
    period: "1951〜1952年",
    creator: "グレース・ホッパー",
    purpose:
      "サブルーチン呼び出しの羅列を機械語へ変換する仕組みとして作られ、現代の感覚では世界初のコンパイラに近い位置づけです。",
    comparison: "特定の対抗馬はなく、後継として A-1、A-2、FLOW-MATIC へ発展しました。",
    icon: <FileCog />,
    animationDelay: -84,
    animationDuration: 84,
    row: 1,
  },
  {
    name: "FORTRAN",
    yearLabel: "1957",
    period: "1954年(設計)〜1957年",
    creator: "ジョン・バッカス (IBM)",
    purpose:
      "アセンブリのような低水準言語を置き換え、人間が読みやすい形で科学技術計算と数値計算を高速に実行するために設計されました。",
    comparison: "ALGOL が研究用途での対抗馬、COBOL が事務処理分野での双璧でした。",
    icon: <Sigma />,
    animationDelay: -64,
    animationDuration: 64,
    row: 1,
  },
  {
    name: "ALGOL",
    yearLabel: "1958",
    period: "1958年",
    creator: "欧州の研究者主導",
    purpose:
      "アメリカ主導の FORTRAN に対抗しつつ、構造化プログラミングの発想を早期に取り入れた汎用的な記述体系を目指しました。",
    comparison: "FORTRAN が直接の比較対象でした。",
    icon: <Workflow />,
    animationDelay: -36,
    animationDuration: 64,
    row: 1,
  },
  {
    name: "LISP",
    yearLabel: "1958",
    period: "1958年(開発)〜1960年",
    creator: "ジョン・マッカーシー (MIT) 等",
    purpose:
      "もともとは数学的記法として構想され、後に人工知能処理や記号処理を理詰めで扱う用途に発展しました。",
    comparison: "最古級の関数型言語として、手続き型言語全般と対比されます。",
    icon: <Braces />,
    animationDelay: -32,
    animationDuration: 64,
    row: 2,
  },
  {
    name: "COBOL",
    yearLabel: "1959",
    period: "1959年〜1960年",
    creator: "グレース・ホッパー、J. Sammet ら (米国防総省主導)",
    purpose:
      "専門知識の薄い事務担当者でも理解しやすいよう、英語に近い記法を持つ事務処理向け言語として整備されました。",
    comparison: "科学技術計算の FORTRAN と対になる存在でした。",
    icon: <FileCode2 />,
    animationDelay: -54,
    animationDuration: 54,
    row: 2,
  },
  {
    name: "BASIC",
    yearLabel: "1964",
    period: "1964年",
    creator: "米ダートマス大学",
    purpose:
      "FORTRAN が学生には難しすぎたため、初心者や学生でも学び始めやすい入門向け言語として作られました。",
    comparison: "FORTRAN の学習難度の高さが比較基準でした。",
    icon: <TerminalSquare />,
    animationDelay: -27,
    animationDuration: 54,
    row: 2,
  },
  {
    name: "PL/I",
    yearLabel: "1964",
    period: "1964年〜1966年",
    creator: "IBM",
    purpose:
      "科学技術計算の FORTRAN と事務計算の COBOL を、1つの言語でまとめて扱えるようにする狙いで設計されました。",
    comparison: "FORTRAN と COBOL の統合を目指した点が核心です。",
    icon: <Layers3 />,
    animationDelay: -44,
    animationDuration: 58,
    row: 3,
  },
  {
    name: "Simula",
    yearLabel: "1967",
    period: "1967年",
    creator: "クリステン・ニガード、オルヨハン・ダール",
    purpose:
      "従来言語では扱いにくかった離散事象シミュレーションを記述しやすくするために生まれ、オブジェクトの概念を早期に導入しました。",
    comparison: "ALGOL や FORTRAN ではシミュレーション設計に限界がありました。",
    icon: <Orbit />,
    animationDelay: -66,
    animationDuration: 58,
    row: 3,
  },
  {
    name: "B",
    yearLabel: "1970",
    period: "1970年頃",
    creator: "ケネス・R・トンプソンら (ベル研究所)",
    purpose:
      "UNIX を実現するためのシステムプログラミング言語として設計され、後の C 言語の直系の前身になりました。",
    comparison: "BCPL が直接の起源です。",
    icon: <BadgeHelp />,
    animationDelay: -31,
    animationDuration: 58,
    row: 3,
  },
  {
    name: "Pascal",
    yearLabel: "1970",
    period: "1969年(設計)〜1970年",
    creator: "ニクラウス・ヴィルト (チューリッヒ大学)",
    purpose:
      "ALGOL を基に、規律正しく読みやすい構造化プログラミングを奨励し、教育と信頼性の高い実装を支えるために作られました。",
    comparison: "後に人気を二分した C 言語とよく比較されます。",
    icon: <Blocks />,
    animationDelay: -60,
    animationDuration: 60,
    row: 4,
  },
  {
    name: "C",
    yearLabel: "1972",
    period: "1972年",
    creator: "デニス・M・リッチーら (ベル研究所)",
    purpose:
      "UNIX 実装を前進させるため、B 言語の後継として低水準制御と移植性を両立するシステム記述言語として開発されました。",
    comparison: "後年は D、Go、Rust が置き換え候補や比較対象として現れました。",
    icon: <Cpu />,
    animationDelay: -40,
    animationDuration: 60,
    row: 4,
  },
  {
    name: "Smalltalk",
    yearLabel: "1972",
    period: "1970年代前半",
    creator: "ゼロックス PARC、アラン・ケイら",
    purpose:
      "子どもでも扱えるコンピュータという発想のもと、GUI を含む対話的な計算環境と純度の高いオブジェクト指向を実現するために作られました。",
    comparison: "Simula から強い影響を受けたオブジェクト指向の系譜です。",
    icon: <MonitorSmartphone />,
    animationDelay: -20,
    animationDuration: 60,
    row: 4,
  },
  {
    name: "C++",
    yearLabel: "1983",
    period: "1983年",
    creator: "ビャーネ・ストロヴストルップ (ベル研究所)",
    purpose:
      "C 言語の性能と資産を保ちながら、Simula に由来するクラスや継承を持ち込んで大規模開発を支えるために拡張されました。",
    comparison: "同時期の Objective-C と並ぶ C 系オブジェクト指向拡張です。",
    icon: <Layers3 />,
    animationDelay: -20,
    animationDuration: 60,
    row: 5,
  },
  {
    name: "Objective-C",
    yearLabel: "1983",
    period: "1983年",
    creator: "ブラッド・コックス",
    purpose:
      "C 言語を土台に Smalltalk のオブジェクトシステムを取り込み、より動的なオブジェクト指向を実現するために設計されました。",
    comparison: "C++ が同時期の主要な比較対象でした。",
    icon: <Braces />,
    animationDelay: -47,
    animationDuration: 60,
    row: 5,
  },
  {
    name: "Perl",
    yearLabel: "1987",
    period: "1987年",
    creator: "ラリー・ウォール",
    purpose:
      "複雑な処理を C で都度書かずに済むよう、書いてから動かすまでを大幅に簡略化する実用的なスクリプト言語として生まれました。",
    comparison: "後に Python の規律ある設計思想と対比されました。",
    icon: <Cable />,
    animationDelay: -56,
    animationDuration: 56,
    row: 5,
  },
  {
    name: "Python",
    yearLabel: "1990",
    period: "1990年",
    creator: "グイド・ヴァンロッサム",
    purpose:
      "Perl と対照的に、書き手ごとのばらつきを抑えたシンプルで読みやすい言語を目指して設計されました。",
    comparison: "Perl、Ruby、R が主要な比較対象として挙がります。",
    icon: <Binary />,
    animationDelay: -28,
    animationDuration: 56,
    row: 6,
  },
  {
    name: "Ruby",
    yearLabel: "1995",
    period: "1993年(開発)〜1995年",
    creator: "まつもとゆきひろ",
    purpose:
      "Perl の実用性を持ちながら、純粋なオブジェクト指向を徹底し、楽しく書けるスクリプト言語を目指して設計されました。",
    comparison: "Perl、Python、PHP と比較されることが多い言語です。",
    icon: <Braces />,
    animationDelay: -22,
    animationDuration: 68,
    row: 6,
  },
  {
    name: "PHP",
    yearLabel: "1995",
    period: "1994年〜1995年",
    creator: "ラスマス・ラードフ",
    purpose:
      "HTML の中へ直接コードを埋め込み、冗長な出力コードを書かずに Web 開発を進められるようにするためでした。",
    comparison: "Perl、Ruby、Python が近い比較対象です。",
    icon: <Globe />,
    animationDelay: -46,
    animationDuration: 68,
    row: 6,
  },
  {
    name: "Java",
    yearLabel: "1995",
    period: "1991年(開発)〜1995年",
    creator: "ジェームズ・ゴスリン (サン・マイクロシステムズ)",
    purpose:
      "一度書けばどこでも動く環境と自動メモリ管理を提供し、もともとの家電向け構想から汎用ソフトウェア開発へ広がりました。",
    comparison: "後年は C#、Go、Kotlin とよく比較されます。",
    icon: <Database />,
    animationDelay: -68,
    animationDuration: 68,
    row: 7,
  },
  {
    name: "JavaScript",
    yearLabel: "1995",
    period: "1995年",
    creator: "ネットスケープ・コミュニケーションズ",
    purpose:
      "Web ブラウザ上でポップアップなどの動的処理を実現するために生まれ、Java 人気に便乗した名称が与えられました。",
    comparison: "Flash、Dart、TypeScript などが代替や拡張の比較対象です。",
    icon: <Globe />,
    animationDelay: -45,
    animationDuration: 68,
    row: 7,
  },
  {
    name: "C#",
    yearLabel: "2000",
    period: "2000年",
    creator: "マイクロソフト (アンダース・ヘルスバーグ)",
    purpose:
      "Microsoft が C++ や Java に対抗できる自社言語を持つため、C++ に Java 的な安全性や生産性の要素を取り込んで設計しました。",
    comparison: "Java が主要な比較対象でした。",
    icon: <MonitorSmartphone />,
    animationDelay: -58,
    animationDuration: 58,
    row: 8,
  },
  {
    name: "Go",
    yearLabel: "2009",
    period: "2009年",
    creator: "Google (ロバート・グリースマら)",
    purpose:
      "C/C++ の複雑さを減らしつつ、シンプルさ、開発速度、並行処理の扱いやすさを重視した実用言語として作られました。",
    comparison: "Rust と対比されるほか、C/C++ 代替として語られます。",
    icon: <Cpu />,
    animationDelay: -72,
    animationDuration: 72,
    row: 8,
  },
  {
    name: "Rust",
    yearLabel: "2010",
    period: "2010年(発表)〜2015年",
    creator: "Mozilla",
    purpose:
      "C/C++ の代替として、低レベル制御と実行性能を維持しながら、メモリ安全性をコンパイル時に保証することを狙いました。",
    comparison: "Go、C/C++、Zig が代表的な比較対象です。",
    icon: <Microscope />,
    animationDelay: -51,
    animationDuration: 72,
    row: 8,
  },
  {
    name: "Dart",
    yearLabel: "2011",
    period: "2011年",
    creator: "Google",
    purpose:
      "JavaScript を作り直して置き換えるという強い構想から始まり、のちに Flutter の中核言語として定着しました。",
    comparison: "JavaScript が直接の対抗軸です。",
    icon: <Rocket />,
    animationDelay: -30,
    animationDuration: 72,
    row: 9,
  },
  {
    name: "Kotlin",
    yearLabel: "2011",
    period: "2011年",
    creator: "JetBrains",
    purpose:
      "Java の冗長さや不便さを減らし、安全性と簡潔さを高めつつ、既存 Java 開発者が移行しやすい進化系として設計されました。",
    comparison: "Java に加え、iOS 側では Swift と対比されます。",
    icon: <Network />,
    animationDelay: -62,
    animationDuration: 72,
    row: 9,
  },
  {
    name: "Swift",
    yearLabel: "2014",
    period: "2014年",
    creator: "Apple (クリス・ラトナーら)",
    purpose:
      "古くなった Objective-C に代わる形で、より安全で現代的な構文を持つ Apple 向け開発環境を提供するために登場しました。",
    comparison: "Objective-C と Kotlin が比較対象です。",
    icon: <MonitorSmartphone />,
    animationDelay: -24,
    animationDuration: 72,
    row: 9,
  },
]

const programmingLanguageTimeline: LogoItem[] = programmingLanguageHistory.map((item) => ({
  label: `${item.yearLabel} ${item.name}`,
  icon: item.icon,
  animationDelay: item.animationDelay,
  animationDuration: item.animationDuration,
  row: item.row,
  detailEyebrow: item.period,
  detailTitle: item.name,
  detailSections: [
    { label: "誰が", value: item.creator },
    { label: "なぜ", value: item.purpose },
    { label: "対抗馬・比較対象", value: item.comparison },
  ],
}))

export function LogoTimelineDemo() {
  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-background via-background to-muted/20">
      <LogoTimeline
        items={programmingLanguageTimeline}
        title="Programming Language History"
        height="h-[420px] sm:h-[520px]"
        iconSize={18}
        showRowSeparator
        animateOnHover={false}
      />
    </div>
  )
}

export default LogoTimelineDemo

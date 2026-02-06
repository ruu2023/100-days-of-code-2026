import Link from "next/link";

const Dashboard = () => {
  const links = [
    { day: "001", link: "/days/001", text: "本日のおみくじ" },
    { day: "003", link: "/days/003", text: "Docker Quiz" },
    { day: "012", link: "/days/012", text: "Notion BI tool Demo" },
    { day: "020", link: "/days/020/pic-spot", text: "Pic-Spot" },
    { day: "021", link: "/days/021/mindflow", text: "MindFlow" },
    { day: "023", link: "/days/023/sql-drill", text: "SQL Drill" },
    { day: "028", link: "/days/028", text: "Glassmorphism Gen" },
    { day: "030", link: "/days/030", text: "Gravity Dash" },
    { day: "031", link: "/days/031", text: "YT_LOG.exe" },
    { day: "032", link: "/days/032", text: "Text Stats App" },
    { day: "033", link: "/days/033", text: "Debugging Tavern" },
    { day: "034", link: "/days/034", text: "MyBatis Tutor" },
    { day: "035", link: "/days/035", text: "Quick Markdown" },
    { day: "036", link: "/days/036", text: "Lyric Studio" },
    { day: "037", link: "/days/037", text: "Simple Tango" },
  ];
  return (
    <div>
      <h1>ダッシュボード</h1>
      {links.map((l) => (
        <Link
          key={l.day}
          href={l.link}
          style={{ display: "block", margin: "1rem 0" }}
        >
          {l.day} : {l.text}
        </Link>
      ))}
    </div>
  );
};

export default Dashboard;

import Link from "next/link";

const Dashboard = () => {
  const links = [
    { day: "001", link: "/days/001", text: "本日のおみくじ" },
    { day: "003", link: "/days/003", text: "Docker Quiz" },
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

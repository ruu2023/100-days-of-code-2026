import Link from 'next/link'

const Dashboard = () => {
    const links = [
        {day: "001", link: "/days/001", text: "本日のおみくじ"}
    ]
  return (
    <div>
        <h1>ダッシュボード</h1>
        {links.map(l => (
            <Link href={l.link}>{l.day} : {l.text}</Link>
        ))}
    </div>
  )
}

export default Dashboard
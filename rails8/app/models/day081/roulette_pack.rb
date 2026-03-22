module Day081
  class RoulettePack
    def self.presets
      {
        names: {
          label: "名前ルーレット",
          description: "参加者や候補者を追加して抽選できます。",
          items: [
            "Aoi",
            "Ren",
            "Mio",
            "Sora",
            "Yuna",
            "Haru",
            "Riku",
            "Nagi"
          ]
        },
        punishments: {
          label: "罰ゲームルーレット",
          description: "軽いお題から攻めた罰ゲームまで混ぜて使えます。",
          items: [
            "モノマネをする",
            "次の1杯をおごる",
            "全員に敬語で3分話す",
            "最近の黒歴史を1つ話す",
            "変顔で記念撮影",
            "好きな曲をワンフレーズ歌う",
            "おもしろポーズで10秒静止",
            "今日の主役を褒めちぎる"
          ]
        }
      }
    end
  end
end

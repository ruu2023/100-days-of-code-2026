languages = [
  { name: "A-0 System", appeared: "1951〜1952年", developer: "グレース・ホッパー", purpose: "サブルーチン呼び出しの羅列を機械語に変換するため。現代の感覚では世界初のコンパイラにあたる。", competitors: "特になし" },
  { name: "FORTRAN", appeared: "1954年(設計)〜1957年", developer: "ジョン・バッカス (IBM)", purpose: "人間が読みやすく科学技術・数値計算を高速に実行できる世界初の高級言語を作るため。", competitors: "ALGOL, COBOL" },
  { name: "ALGOL (58/60)", appeared: "1958年", developer: "欧州の研究者主導", purpose: "アメリカのFORTRANに対抗するため。構造化プログラミングの考え方を最初に取り入れた。", competitors: "FORTRAN" },
  { name: "LISP", appeared: "1958年(開発)〜1960年", developer: "ジョン・マッカーシー (MIT)等", purpose: "元々数学の記法として作られ、理屈で進化していく人工知能処理などのため。", competitors: "手続き型言語全般" },
  { name: "COBOL", appeared: "1959年〜1960年", developer: "グレース・ホッパー等", purpose: "専門知識を持たない事務員でも馴染めるよう、英語に似せて作られた事務処理用言語として。", competitors: "FORTRAN" },
  { name: "BASIC", appeared: "1964年", developer: "米ダートマス大学", purpose: "FORTRANは学生にとって難しすぎたため、初心者・学生向けとして開発。", competitors: "FORTRAN" },
  { name: "PL/I", appeared: "1964年〜1966年", developer: "IBM", purpose: "FORTRANとCOBOLの両方の用途を1つの言語でカバーするため。", competitors: "FORTRAN, COBOL" },
  { name: "Simula", appeared: "1967年", developer: "C.ニガード、O.J.ダール", purpose: "離散事象シミュレーションに適応するため、「オブジェクト」の概念を初導入。", competitors: "ALGOL, FORTRAN" },
  { name: "B言語", appeared: "1970年頃", developer: "ケネス・R・トンプソンら", purpose: "UNIXを実現するためのシステム・プログラミング言語を開発するため。", competitors: "BCPL" },
  { name: "Pascal", appeared: "1969年(設計)〜1970年", developer: "ニクラウス・ヴィルト", purpose: "規律正しく明晰で読みやすい構造化プログラミングを奨励するため。", competitors: "C言語" },
  { name: "C言語", appeared: "1972年", developer: "デニス・M・リッチーら", purpose: "UNIXの実装を進めるためのシステム記述言語として、B言語の後継として開発。", competitors: "D, Go, Rust" },
  { name: "Smalltalk", appeared: "1970年代前半", developer: "アラン・ケイら", purpose: "「子供達にも扱えるコンピュータ」を目指し、GUIのインターフェースを実現するため。", competitors: "Simula" },
  { name: "C++", appeared: "1983年", developer: "B.ストロヴストルップ", purpose: "C言語にSimulaのオブジェクト指向（クラスや継承）を導入し、拡張するため。", competitors: "Objective-C" },
  { name: "Objective-C", appeared: "1983年", developer: "ブラッド・コックス", purpose: "C言語をベースに、Smalltalkのオブジェクトシステムを合体させるため。", competitors: "C++" },
  { name: "Perl", appeared: "1987年", developer: "ラリー・ウォール", purpose: "書いてから動かすまでを劇的に簡単にするため。", competitors: "Python" },
  { name: "Python", appeared: "1990年", developer: "グイド・ヴァンロッサム", purpose: "コードのばらつきを許さない「シンプルイズベスト」に重点を置くため。", competitors: "Perl, Ruby, R" },
  { name: "Ruby", appeared: "1993年〜1995年", developer: "まつもとゆきひろ", purpose: "純粋なオブジェクト指向言語として楽しく書けるように設計。", competitors: "Perl, Python, PHP" },
  { name: "PHP", appeared: "1994年〜1995年", developer: "ラスマス・ラードフ", purpose: "HTMLの中に直接コードを埋め込み、Web開発に特化するため。", competitors: "Perl, Ruby, Python" },
  { name: "Java", appeared: "1991年〜1995年", developer: "ジェームズ・ゴスリン", purpose: "「一度書けばどこでも動く」を実現し、自動メモリ管理等でバグを防ぐため。", competitors: "C#, Go, Kotlin" },
  { name: "JavaScript", appeared: "1995年", developer: "ネットスケープ", purpose: "Webブラウザのポップアップ等、動的な処理を実装するため。", competitors: "TypeScript, Dart" },
  { name: "C#", appeared: "2000年", developer: "マイクロソフト", purpose: "C++にJavaの要素を取り込んだ優秀な言語を自社で持つため。", competitors: "Java" },
  { name: "Go言語", appeared: "2009年", developer: "Google", purpose: "シンプルで開発速度が速く、並行処理が楽な言語を作るため。", competitors: "Rust, C/C++" },
  { name: "Rust", appeared: "2010年〜2015年", developer: "Mozilla", purpose: "メモリ安全性、低レベル制御、最速の実行速度を目指すため。", competitors: "Go, C/C++, Zig" },
  { name: "Dart", appeared: "2011年", developer: "Google", purpose: "JavaScriptを刷新しようとしたが、後にFlutterの言語として成功。", competitors: "JavaScript" },
  { name: "Kotlin", appeared: "2011年", developer: "JetBrains", purpose: "Javaの不便さを解消し、簡潔性や安全性を向上させるため。", competitors: "Java, Swift" },
  { name: "Swift", appeared: "2014年", developer: "Apple", purpose: "Objective-Cに代わり、安定性が高く近代的な構文を提供するため。", competitors: "Objective-C, Kotlin" }
]

languages.each do |lang|
  Language.find_or_create_by!(name: lang[:name]) do |l|
    l.appeared = lang[:appeared]
    l.developer = lang[:developer]
    l.purpose = lang[:purpose]
    l.competitors = lang[:competitors]
  end
end
class AgencyAgentsController < ApplicationController
  def index
    base_path = Rails.root.join("lib", "data", "agency-agents-repo")
    
    # 全部門・全エージェントの日本語マッピングデータ
    @agent_translations = {
      # Engineering
      "engineering-frontend-developer" => { s: "React/Vue/Angular、UI実装、パフォーマンス最適化", w: "モダンWebアプリ、ピクセルパーフェクトなUI、Core Web Vitalsの改善" },
      "engineering-backend-architect" => { s: "API設計、データベース設計、スケーラビリティ", w: "サーバーサイドシステム、マイクロサービス、クラウドインフラ" },
      "engineering-mobile-app-builder" => { s: "iOS/Android、React Native、Flutter", w: "ネイティブおよびクロスプラットフォームのモバイルアプリ開発" },
      "engineering-ai-engineer" => { s: "機械学習モデル、デプロイ、AI統合", w: "AI機能の実装、データパイプライン、AI搭載アプリの開発" },
      "engineering-devops-automator" => { s: "CI/CD、インフラ自動化、クラウド運用", w: "パイプライン構築、デプロイ自動化、モニタリング体制の整備" },
      "engineering-rapid-prototyper" => { s: "迅速なPOC開発、MVP開発", w: "高速なプロトタイプ作成、ハッカソン、迅速な反復開発" },
      "engineering-senior-developer" => { s: "Laravel/Livewire、高度な設計パターン", w: "複雑な機能実装、アーキテクチャの意思決定" },
      "engineering-filament-optimization-specialist" => { s: "Filament PHP管理画面のUX、リソース最適化", w: "Filamentリソース/テーブルの再構築、管理画面の高速化" },
      "engineering-security-engineer" => { s: "脅威モデリング、セキュアコードレビュー、防御設計", w: "アプリの脆弱性診断、セキュリティ監査、セキュアなCI/CD" },
      "engineering-autonomous-optimization-architect" => { s: "LLMルーティング、コスト最適化、シャドウテスト", w: "自律システムにおけるインテリジェントなAPI選択とコスト管理" },
      "engineering-embedded-firmware-engineer" => { s: "ベアメタル、RTOS、ESP32/STM32/Nordic", w: "製品グレードの組み込みシステムおよびIoTデバイスの開発" },
      "engineering-incident-response-commander" => { s: "インシデント管理、ポストモーテム、オンコール", w: "本番環境の障害対応、インシデントへの備えの構築" },
      "engineering-solidity-smart-contract-engineer" => { s: "EVMコントラクト、ガス最適化、DeFi", w: "安全でガス代を抑えたスマートコントラクトとDeFiプロトコル" },
      "engineering-technical-writer" => { s: "開発者ドキュメント、APIリファレンス、チュートリアル", w: "明快で正確な技術文書の作成" },
      "engineering-threat-detection-engineer" => { s: "SIEMルール、脅威ハンティング、ATT&CKマッピング", w: "検知レイヤーの構築とセキュリティインシデントの追跡" },
      "engineering-wechat-mini-program-developer" => { s: "WeChatエコシステム、ミニプログラム、決済統合", w: "WeChat内での高パフォーマンスなアプリ構築" },
      "engineering-code-reviewer" => { s: "建設的なコードレビュー、保守性向上、品質担保", w: "PRレビュー、品質ゲートの設置、レビューを通じたメンタリング" },
      "engineering-database-optimizer" => { s: "スキーマ設計、クエリ最適化、インデックス戦略", w: "PostgreSQL/MySQLのチューニング、スロークエリの改善、移行計画" },
      "engineering-git-workflow-master" => { s: "ブランチ戦略、規約コミット、高度なGit操作", w: "Gitワークフロー設計、履歴のクリーンアップ、CIフレンドリーな管理" },
      "engineering-software-architect" => { s: "システム設計、DDD、アーキテクチャパターン", w: "設計上の意思決定、ドメインモデリング、システムの進化戦略" },
      "engineering-sre" => { s: "SLO、エラーバジェット、オブザーバビリティ、カオスエンジニアリング", w: "本番環境の信頼性向上、トイルの削減、キャパシティプランニング" },
      "engineering-ai-data-remediation-engineer" => { s: "自己修復型パイプライン、セマンティッククラスタリング", w: "データ欠損を伴わない大規模なデータ修復と正規化" },
      "engineering-data-engineer" => { s: "データパイプライン、レイクハウス、ETL/ELT", w: "信頼性の高いデータインフラとウェアハウスの構築" },
      "engineering-feishu-integration-developer" => { s: "Feishu/Lark Open Platform、Bot、ワークフロー", w: "Feishuエコシステムにおける業務自動化の構築" },
      "engineering-cms-developer" => { s: "WordPress/Drupal、プラグイン開発、コンテンツ構造", w: "コード主導のCMS実装とカスタマイズ" },
      "engineering-email-intelligence-engineer" => { s: "メールパース、MIME抽出、エージェント用構造化データ", w: "生のメールスレッドをAI推論に最適な文脈へ変換" },

      # Design
      "design-ui-designer" => { s: "ビジュアルデザイン、コンポーネント、デザインシステム", w: "UI制作、ブランドの一貫性保持、部品設計" },
      "design-ux-researcher" => { s: "ユーザーテスト、行動分析、リサーチ", w: "ユーザー理解、ユーザビリティテスト、設計根拠の獲得" },
      "design-ux-architect" => { s: "技術的設計、CSSシステム、実装ガイド", w: "開発者向けの基盤構築、実装の正確なガイダンス" },
      "design-brand-guardian" => { s: "ブランドアイデンティティ、一貫性、ポジショニング", w: "ブランド戦略、アイデンティティ開発、ガイドライン策定" },
      "design-visual-storyteller" => { s: "視覚的な物語、マルチメディアコンテンツ", w: "魅力的な視覚的ストーリーテリング、ブランドの発信" },
      "design-whimsy-injector" => { s: "個性、喜び、遊び心のあるインタラクション", w: "楽しさの追加、マイクロインタラクション、ブランドの個性化" },
      "design-image-prompt-engineer" => { s: "AI画像生成プロンプト、写真技術", w: "Midjourney/DALL-E等の高品質な画像生成指示" },
      "design-inclusive-visuals-specialist" => { s: "表現、バイアス軽減、真正性のある画像", w: "文化的に正確で多様性のあるAI画像・映像の生成" },

      # Paid Media
      "paid-media-ppc-strategist" => { s: "Google/MS/Amazon広告、アカウント構造、入札戦略", w: "アカウント構築、予算配分、スケーリング、診断" },
      "paid-media-search-query-analyst" => { s: "検索語句分析、除外キーワード、意図マッピング", w: "クエリ監査、無駄な支出の排除、キーワード発見" },
      "paid-media-auditor" => { s: "200項目以上の詳細監査、競合分析", w: "アカウント引き継ぎ、四半期レビュー、競合ピッチ" },
      "paid-media-tracking-specialist" => { s: "GTM、GA4、コンバージョン計測、CAPI", w: "新規計測実装、計測監査、プラットフォーム移行" },
      "paid-media-creative-strategist" => { s: "レスポンシブ広告コピー、Meta素材、P-Maxアセット", w: "クリエイティブ公開、テスト計画、広告疲弊の刷新" },

      # Sales
      "sales-outbound-strategist" => { s: "シグナルベースの開拓、マルチチャネルシーケンス", w: "量ではなく調査に基づくアウトリーチによるパイプライン構築" },
      "sales-discovery-coach" => { s: "SPIN、Gap Selling、Sandler — 質問設計", w: "商談準備、適格判定、営業メンバーのコーチング" },
      "sales-deal-strategist" => { s: "MEDDPICC適格判定、競合比較、受注計画", w: "ディールスコアリング、リスクの可視化、受注戦略の構築" },
      "sales-engineer" => { s: "技術デモ、POCスコープ定義、競合バトルカード", w: "プレセールスにおける技術的勝利、デモ準備" },

      # Marketing
      "marketing-growth-hacker" => { s: "急速なユーザー獲得、バイラルループ、施策実験", w: "爆発的な成長が必要なフェーズ、転換率の最適化" },
      "marketing-content-creator" => { s: "マルチプラットフォーム対応、制作カレンダー", w: "コンテンツ戦略、コピーライティング、ブランド構築" },
      "marketing-reddit-community-builder" => { s: "誠実な参加、価値主導のコンテンツ", w: "Reddit上での信頼構築、本物のコミュニティマーケティング" },
      "marketing-twitter-engager" => { s: "リアルタイムな反応、思想的リーダーシップ", w: "Twitter/X戦略、LinkedInキャンペーン、プロ向け発信" },
      "marketing-seo-specialist" => { s: "テクニカルSEO、コンテンツ戦略、被リンク構築", w: "持続可能なオーガニック検索流入の成長推進" },
      "marketing-ai-citation-strategist" => { s: "AEO/GEO、AI推薦の可視化、引用監査", w: "ChatGPT/Claude/Perplexity等でのブランド可視化向上" },

      # Product
      "product-manager" => { s: "製品ライフサイクル全般、PRD、GTM戦略", w: "発見、ロードマップ策定、市場投入、成果の測定" },
      "product-sprint-prioritizer" => { s: "アジャイル計画、機能の優先順位付け", w: "スプリント計画、リソース配分、バックログ管理" },
      "product-behavioral-nudge-engine" => { s: "行動心理学、ナッジ設計、エンゲージメント", w: "行動科学を通じたユーザーモチベーションの最大化" },

      # Project Management
      "project-management-studio-producer" => { s: "高度なオーケストレーション、ポートフォリオ管理", w: "複数プロジェクトの監督、戦略的一致、リソース配分" },
      "project-management-project-shepherd" => { s: "部門間調整、タイムライン管理", w: "エンドツーエンドのプロジェクト調整、ステークホルダー管理" },
      "project-manager-senior" => { s: "現実的なスコープ定義、タスク変換", w: "仕様からタスクへの分解、スコープ管理の徹底" },

      # Testing
      "testing-evidence-collector" => { s: "スクリーンショットベースのQA、視覚的証明", w: "UIテスト、視覚的検証、バグの証拠化" },
      "testing-reality-checker" => { s: "エビデンスに基づく認証、品質ゲート", w: "リリース判定、品質承認、プロダクション準備完了の確認" },
      "testing-performance-benchmarker" => { s: "パフォーマンステスト、最適化", w: "スピードテスト、負荷テスト、チューニング" },

      # Support
      "support-support-responder" => { s: "カスタマーサービス、問題解決", w: "顧客サポート、ユーザー体験の向上、運用" },
      "support-analytics-reporter" => { s: "データ分析、ダッシュボード、インサイト", w: "ビジネスインテリジェンス、KPI追跡、可視化" },

      # Academic
      "academic-anthropologist" => { s: "文化システム、親族関係、儀式、信仰体系", w: "内部論理を持つ文化的に一貫した社会の設計" },
      "academic-historian" => { s: "歴史分析、時代区分、物質文化", w: "歴史的一貫性の検証、本格的な時代詳細の補強" },
      "academic-geographer" => { s: "地形/人文地理、気候、地図学", w: "地形や集落がリアルで地理的に一貫した世界構築" },

      # Spatial Computing
      "spatial-computing-xr-interface-architect" => { s: "空間インタラクション設計、没入型UX", w: "AR/VR/XRインターフェース設計、空間コンピューティングUX" },
      "spatial-computing-visionos-spatial-engineer" => { s: "Apple Vision Pro 開発", w: "Vision Pro向けアプリ、空間体験の構築" },

      # Specialized
      "specialized-mcp-builder" => { s: "Model Context Protocolサーバー、AIエージェントツール", w: "AIエージェントの能力を拡張するサーバー開発" },
      "specialized-blockchain-security-auditor" => { s: "スマートコントラクト監査、脆弱性分析", w: "公開前のコントラクト脆弱性発見、セキュリティ確保" }
    }

    # ディレクトリ走査ロジック
    @divisions = []
    dir_names = Dir.glob("#{base_path}/*").select { |f| File.directory?(f) }.map { |f| File.basename(f) }
    exclude_dirs = ["examples", "integrations", "scripts"]
    
    # 部門名の日本語表示用
    division_jp = {
      "engineering" => "開発・エンジニアリング", "design" => "デザイン・クリエイティブ", "paid-media" => "広告運用・メディア",
      "sales" => "営業・セールス", "marketing" => "マーケティング・広報", "product" => "プロダクト企画・戦略",
      "project-management" => "プロジェクト管理", "testing" => "テスト・品質保証", "support" => "カスタマーサポート",
      "spatial-computing" => "空間コンピューティング", "specialized" => "専門職・その他領域", "game-development" => "ゲーム開発", "academic" => "学術・リサーチ"
    }

    dir_names.each do |dir_name|
      next if exclude_dirs.include?(dir_name)
      
      agents = []
      Dir.glob("#{base_path.join(dir_name)}/*.md").each do |file_path|
        file_id = File.basename(file_path, ".md")
        content = File.read(file_path)
        
        # 翻訳があればそれを使う、なければファイル名から推測
        trans = @agent_translations[file_id]
        
        name = file_id.gsub("#{dir_name}-", "").gsub("-", " ").titleize
        specialty = trans ? trans[:s] : "高度な専門知識の提供（詳細未定義）"
        when_to_use = trans ? trans[:w] : "特定の専門的な支援が必要な場面"

        agents << {
          id: file_id,
          name: name,
          specialty: specialty,
          when_to_use: when_to_use,
          prompt: content,
          search_text: "#{name} #{specialty} #{when_to_use}".downcase
        }
      end

      next if agents.empty?

      # アイコン
      icon = case dir_name
             when "engineering" then "code" when "design" then "palette" when "marketing" then "trending-up"
             when "product" then "briefcase" when "sales" then "phone" when "project-management" then "clipboard-list"
             when "testing" then "beaker" when "academic" then "graduation-cap"
             when "support" then "headset" when "game-development" then "gamepad-2"
             when "spatial-computing" then "layers" else "users"
             end

      @divisions << {
        id: dir_name,
        name: division_jp[dir_name] || dir_name.titleize,
        icon: icon,
        agents: agents.sort_by { |a| a[:name] }
      }
    end
    
    priority = ["engineering", "design", "product", "marketing", "project-management", "specialized"]
    @divisions = @divisions.sort_by { |d| priority.index(d[:id]) || 100 }
  end
end

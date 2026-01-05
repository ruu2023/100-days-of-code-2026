use eframe::egui;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{BufReader, BufWriter};

// データの保存先ファイル名
const SAVE_FILE: &str = "habits.json";

fn main() -> eframe::Result<()> {
    let options = eframe::NativeOptions::default();
    eframe::run_native(
        "Day 005: Habit Log",
        options,
        Box::new(|cc| {
            setup_custom_fonts(&cc.egui_ctx);
            // 起動時にロードを試みる
            let app = MyApp::load().unwrap_or_default();
            Ok(Box::new(app))
        }),
    )
}

// 習慣データを表す構造体（JSON保存対象）
#[derive(Serialize, Deserialize, Clone)]
struct Habit {
    name: String,
    count: i32,
}

// アプリ全体の状態
#[derive(Serialize, Deserialize, Default)]
struct MyApp {
    // 習慣のリスト
    habits: Vec<Habit>,
    
    // UI入力用の一時変数（これは保存したくないのでスキップ）
    #[serde(skip)]
    new_habit_name: String,
}

impl MyApp {
    // ファイルから読み込む関数
    fn load() -> Option<Self> {
        let file = File::open(SAVE_FILE).ok()?;
        let reader = BufReader::new(file);
        serde_json::from_reader(reader).ok()
    }

    // ファイルに保存する関数
    fn save(&self) {
        if let Ok(file) = File::create(SAVE_FILE) {
            let writer = BufWriter::new(file);
            let _ = serde_json::to_writer(writer, self);
        }
    }
}

// アプリ終了時に自動的に保存されるように Drop トレイトを実装
impl Drop for MyApp {
    fn drop(&mut self) {
        self.save();
    }
}

// フォント設定（前回と同じ）
fn setup_custom_fonts(ctx: &egui::Context) {
    let mut fonts = egui::FontDefinitions::default();
    fonts.font_data.insert(
        "my_font".to_owned(),
        egui::FontData::from_static(include_bytes!("../../../assets/fonts/NotoSansJP-Regular.ttf")).into(),
    );
    fonts.families.entry(egui::FontFamily::Proportional).or_default().insert(0, "my_font".to_owned());
    fonts.families.entry(egui::FontFamily::Monospace).or_default().push("my_font".to_owned());
    ctx.set_fonts(fonts);
}

impl eframe::App for MyApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Habit Log 📝");
            ui.label("習慣を記録して、継続力を高めましょう！");
            
            ui.add_space(20.0);

            // --- 新規登録エリア ---
            ui.horizontal(|ui| {
                ui.label("新しい習慣:");
                // テキスト入力ボックス
                // Enterキーが押されたら追加処理へ
                let response = ui.text_edit_singleline(&mut self.new_habit_name);
                
                if ui.button("追加").clicked() || (response.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter))) {
                    if !self.new_habit_name.trim().is_empty() {
                        self.habits.push(Habit {
                            name: self.new_habit_name.clone(),
                            count: 0,
                        });
                        self.new_habit_name.clear(); // 入力欄をクリア
                    }
                }
            });

            ui.add_space(20.0);
            ui.separator();
            ui.add_space(20.0);

            // --- リスト表示エリア ---
            // スクロール可能にする
            egui::ScrollArea::vertical().show(ui, |ui| {
                // 削除用インデックス保持（ループ中の削除は危険なので）
                let mut delete_idx = None;

                for (i, habit) in self.habits.iter_mut().enumerate() {
                    ui.horizontal(|ui| {
                        // カウントアップボタン（大きく）
                        if ui.button(egui::RichText::new("＋").size(20.0)).clicked() {
                            habit.count += 1;
                        }

                        // カウント表示
                        ui.label(egui::RichText::new(format!("{}回", habit.count)).strong().size(20.0));
                        
                        // 習慣の名前
                        ui.label(egui::RichText::new(&habit.name).size(18.0));

                        // 右寄せで削除ボタン
                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("🗑").clicked() {
                                delete_idx = Some(i);
                            }
                        });
                    });
                    ui.add_space(5.0);
                }

                // 削除実行
                if let Some(i) = delete_idx {
                    self.habits.remove(i);
                }
            });
        });
    }
}

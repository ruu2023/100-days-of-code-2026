use eframe::egui;

fn main() -> eframe::Result<()> {
    let options = eframe::NativeOptions::default();
    eframe::run_native(
        "Counter App",
        options,
        Box::new(|_cc| {
            setup_custom_fonts(&cc.egui_ctx);
            Ok(Box::new(MyApp::default()))}),
    )
}

#[derive(Default)]
struct MyApp {
    count: i32,
}

fn setup_custom_fonts(ctx: &egui::Context) {
    let mut fonts = egui::FontDefinitions::default();

    // Install my own font (maybe supporting non-latin characters).
    // .ttf and .otf files supported.
    fonts.font_data.insert(
        "my_font".to_owned(),
        egui::FontData::from_static(include_bytes!("../../../assets/fonts/NotoSansJP-Regular.ttf")),
    );

    // Put my font first (highest priority) for proportional text:
    fonts
        .families
        .entry(egui::FontFamily::Proportional)
        .or_default()
        .insert(0, "my_font".to_owned());

    // Put my font as last fallback for monospace:
    fonts
        .families
        .entry(egui::FontFamily::Monospace)
        .or_default()
        .push("my_font".to_owned());

    ctx.set_fonts(fonts);
}


impl eframe::App for MyApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
           ui.heading("Counter App");
           ui.label(format!("Count: {}", self.count));

           if ui.button("追加").clicked() {
            self.count += 1;
           }

           if ui.button("リセット").clicked() {
            self.count = 0;
           }
        });
    }
}

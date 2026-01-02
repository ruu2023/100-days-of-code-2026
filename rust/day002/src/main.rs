mod game;

use eframe::egui;
use game::GameOfLife;
use std::time::{Duration, Instant};

fn main() -> Result<(), eframe::Error> {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([640.0, 680.0]) // Width, Height
            .with_resizable(true),
        ..Default::default()
    };
    eframe::run_native(
        "Day 002: Rust Game of Life",
        options,
        Box::new(|cc| {
            setup_custom_fonts(&cc.egui_ctx);
            Ok(Box::new(GameApp::default()))
        }),
    )
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

struct GameApp {
    game: GameOfLife,
    last_update: Instant,
    update_interval: Duration,
}

impl Default for GameApp {
    fn default() -> Self {
        let width = 50;
        let height = 50;
        let mut game = GameOfLife::new(width, height);
        game.randomize(); // Start with some chaos

        Self {
            game,
            last_update: Instant::now(),
            update_interval: Duration::from_millis(100), // 10 FPS
        }
    }
}

impl eframe::App for GameApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // customize theme
        let mut visuals = egui::Visuals::dark();
        visuals.panel_fill = egui::Color32::from_rgb(0, 0, 0);
        ctx.set_visuals(visuals);
        // Game Loop
        if self.game.running {
            if self.last_update.elapsed() >= self.update_interval {
                self.game.update();
                self.last_update = Instant::now();
                ctx.request_repaint(); // Ensure continuous updates
            } else {
                // Request repaint sooner to maintain smooth animation if needed, or just wait for timer
                 ctx.request_repaint_after(self.update_interval - self.last_update.elapsed());
            }
        }

        // GUI Layout
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("ライフゲーム");
            
            ui.horizontal(|ui| {
                if ui.button(if self.game.running { "Stop" } else { "Start" }).clicked() {
                    self.game.running = !self.game.running;
                    // Reset timer to avoid immediate update jump
                    if self.game.running {
                         self.last_update = Instant::now();
                    }
                }

                if ui.button("Randomize").clicked() {
                     self.game.randomize();
                     ctx.request_repaint();
                }

                if ui.button("Clear").clicked() {
                    self.game.clear();
                    self.game.running = false;
                    ctx.request_repaint();
                }

                ui.label("Speed:");
                let mut speed_ms = self.update_interval.as_millis() as u64;
                if ui.add(egui::Slider::new(&mut speed_ms, 10..=1000).text("ms")).changed() {
                     self.update_interval = Duration::from_millis(speed_ms);
                }
            });

            ui.separator();

            // Render Grid
            // We want to fill the remaining space
            let available_size = ui.available_size();
            let (rect, response) = ui.allocate_exact_size(available_size, egui::Sense::click_and_drag());
            
            // Calculate cell size based on available space
            let cell_w = rect.width() / self.game.width as f32;
            let cell_h = rect.height() / self.game.height as f32;
            let cell_size = cell_w.min(cell_h); // Keep cells square

            // Handle Interaction
            if response.clicked() || response.dragged() {
                if let Some(pos) = response.interact_pointer_pos() {
                    // Convert screen pos to grid index
                    let rel_x = pos.x - rect.min.x;
                    let rel_y = pos.y - rect.min.y;
                    
                    let grid_x = (rel_x / cell_size).floor() as usize;
                    let grid_y = (rel_y / cell_size).floor() as usize;

                    // Toggle cell manually (allow drawing)
                     // In a real drawing app we might want to know if we are 'adding' or 'removing' based on the first click
                     // For simplicity, just resurrecting cells on drag is satisfying.
                     if grid_x < self.game.width && grid_y < self.game.height {
                         // Only make it alive when dragging to avoid rapid toggling
                         self.game.grid[grid_y][grid_x] = true;
                         ctx.request_repaint();
                     }
                }
            }
            
            // Custom Painting
            let painter = ui.painter_at(rect);
            
            for y in 0..self.game.height {
                for x in 0..self.game.width {
                    if self.game.grid[y][x] {
                         let min_x = rect.min.x + x as f32 * cell_size;
                         let min_y = rect.min.y + y as f32 * cell_size;
                         
                         painter.rect_filled(
                            egui::Rect::from_min_size(
                                egui::pos2(min_x, min_y),
                                egui::vec2(cell_size, cell_size)
                            ),
                            1.0, // rounding
                            egui::Color32::from_rgb(255, 255, 255)
                         );
                    }
                }
            }
        });
    }
}

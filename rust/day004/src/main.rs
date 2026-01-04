use indicatif::{ProgressBar, ProgressStyle};
use std::thread;
use std::time::Duration;
use console::style;

fn main() {
    println!("\n{}", style("🍅 ポモドーロ開始").bold().green());
    println!("{}", style("   25分間集中して作業しましょう！\n").dim());

    let minutes = 25;
    let seconds_total = minutes * 60;
    
    // let seconds_total = 5;

    let pb = ProgressBar::new(seconds_total);
    
    pb.set_style(ProgressStyle::with_template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {msg}")
        .unwrap()
        .progress_chars("#>-"));

    for _ in 0..seconds_total {
        pb.inc(1);
        let remaining = seconds_total - pb.position();
        let m = remaining / 60;
        let s = remaining % 60;
        pb.set_message(format!("{:02}:{:02} remaining", m, s));
        
        thread::sleep(Duration::from_secs(1));
    }

    pb.finish_with_message("Done!");

    println!("\n{}", style("🎉 セッションクリア！").bold().green());
    println!("{}", style("   休憩タイム！\n").dim());

    // Bell sound
    print!("\x07");
}

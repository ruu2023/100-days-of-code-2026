import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Main {
    // 状態（State）をクラスのフィールドとして持つ
    // Rustのように厳密な所有権管理は不要
    private static int count = 0;

    public static void main(String[] args) {
        // GUIスレッドで実行
        SwingUtilities.invokeLater(() -> {
            createAndShowGUI();
        });
    }

    private static void createAndShowGUI() {
        // 1. ウィンドウの作成
        JFrame frame = new JFrame("Day 006: Java Counter");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 300);
        
        // レイアウト設定（パネル）
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // 2. コンポーネントの作成
        JLabel titleLabel = new JLabel("Java カウンターアプリ");
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 24));
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel countLabel = new JLabel("カウント: 0");
        countLabel.setFont(new Font("SansSerif", Font.PLAIN, 40));
        countLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        JButton button = new JButton("増やす");
        button.setFont(new Font("SansSerif", Font.PLAIN, 18));
        button.setAlignmentX(Component.CENTER_ALIGNMENT);

        // 3. イベントハンドラ（ロジック）
        // Javaでは「ActionListener」インターフェースを実装して渡す
        button.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // 変数を直接書き換えられる！（Rustだとミュータブル参照が必要で大変）
                count++;
                countLabel.setText("カウント: " + count);
            }
        });

        // パネルに追加
        panel.add(titleLabel);
        panel.add(Box.createRigidArea(new Dimension(0, 20))); // 余白
        panel.add(countLabel);
        panel.add(Box.createRigidArea(new Dimension(0, 20)));
        panel.add(button);

        frame.add(panel);
        frame.setLocationRelativeTo(null); // 画面中央に表示
        frame.setVisible(true);
    }
}

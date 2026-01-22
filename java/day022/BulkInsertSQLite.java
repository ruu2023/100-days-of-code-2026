import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

public class BulkInsertSQLite {
    // SQLiteはファイルパスを指定。存在しなければ作成されます。
    private static final String URL = "jdbc:sqlite:test.db";
    
    private static final int TOTAL_RECORDS = 1_000_000;
    private static final int BATCH_SIZE = 10_000;

    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();
        
        // JDBCドライバの明示的ロード（SLF4J依存関係解決後のエラー回避用）
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            System.err.println("SQLite JDBC Driver not found.");
            e.printStackTrace();
            return;
        }

        try (Connection conn = DriverManager.getConnection(URL)) {
            conn.setAutoCommit(false); // オートコミットをオフにして高速化

            // テーブル作成
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("DROP TABLE IF EXISTS users");
                stmt.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, age INTEGER)");
            }

            String sql = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                for (int i = 1; i <= TOTAL_RECORDS; i++) {
                    pstmt.setString(1, "User" + i);
                    pstmt.setString(2, "user" + i + "@example.com");
                    pstmt.setInt(3, 20 + (i % 50));
                    pstmt.addBatch();

                    if (i % BATCH_SIZE == 0) {
                        pstmt.executeBatch();
                        System.out.println(i + " records inserted...");
                    }
                }
                pstmt.executeBatch(); // 残りの分を実行
            }

            conn.commit(); // 最後に一括でコミット
            
            long endTime = System.currentTimeMillis();
            System.out.println("Done! Total Time: " + (endTime - startTime) + "ms");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
in
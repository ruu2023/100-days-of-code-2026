import java.awt.Color;
import java.awt.Graphics2D;
import java.util.Random;

public class Ghost {
    int x, y;
    int dx, dy;
    int speed = 2; // Slightly slower than Pacman for fairness? Or same.
    Color color;
    
    // For random movement
    private Random random = new Random();

    public Ghost(int x, int y, Color color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.dx = 1; // Start moving right
        this.dy = 0;
    }

    public void move(short[] screenData, int nBlocks, int blockSize) {
        // Only change direction when perfectly aligned with grid
        if (x % blockSize == 0 && y % blockSize == 0) {
            int pos = x / blockSize + nBlocks * (y / blockSize);
            
            // Simple AI: 
            // 1. Continue current direction if possible
            // 2. If hitting wall, choose random valid direction
            // 3. Occasionally change direction at intersection
            
            int[] possibleDX = {1, -1, 0, 0};
            int[] possibleDY = {0, 0, 1, -1};
            
            int count = 0;
            // Check current direction validity
            boolean canContinue = false;
            int nextPos = -1;
            
            // Check if we hit a wall
            if (dx == 1) nextPos = pos + 1;
            if (dx == -1) nextPos = pos - 1;
            if (dy == 1) nextPos = pos + nBlocks;
            if (dy == -1) nextPos = pos - nBlocks;
            
            // 1 is Wall. If not wall, can continue.
            if (nextPos >= 0 && nextPos < screenData.length && (screenData[nextPos] & 1) == 0) {
                canContinue = true;
            }

            // 10% chance to random change even if can continue, or if forced to change
            if (!canContinue || random.nextInt(10) == 0) {
                 // Pick a new random valid direction
                 // Try until we find one (fallback to turning back if needed)
                 int startIdx = random.nextInt(4);
                 for (int i = 0; i < 4; i++) {
                     int idx = (startIdx + i) % 4;
                     int tryDX = possibleDX[idx];
                     int tryDY = possibleDY[idx];
                     
                     // Don't reverse direction immediately unless necessary (optional polish)
                     // if (tryDX == -dx && tryDY == -dy) continue; 

                     int checkPos = -1;
                     if (tryDX == 1) checkPos = pos + 1;
                     if (tryDX == -1) checkPos = pos - 1;
                     if (tryDY == 1) checkPos = pos + nBlocks;
                     if (tryDY == -1) checkPos = pos - nBlocks;
                     
                     if (checkPos >= 0 && checkPos < screenData.length && (screenData[checkPos] & 1) == 0) {
                         dx = tryDX;
                         dy = tryDY;
                         canContinue = true;
                         break;
                     }
                 }
            }
        }
        
        x += dx * speed;
        y += dy * speed;
    }

    public void draw(Graphics2D g2d, int blockSize) {
        g2d.setColor(color);
        g2d.fillOval(x + 1, y + 1, blockSize - 2, blockSize - 2);
    }
}

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;

public class PacmanGame extends JPanel implements ActionListener {

    private final int BLOCK_SIZE = 24;
    private final int N_BLOCKS = 15; // 15x15 Grid
    private final int SCREEN_SIZE = N_BLOCKS * BLOCK_SIZE;
    private Timer timer;

    // Map: 0=Empty, 1=Wall, 2=Dot
    // Simple 15x15 map
    private final short levelData[] = {
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1,
        1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1,
        1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1,
        1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1,
        1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1,
        1, 1, 1, 2, 1, 0, 1, 1, 1, 0, 1, 2, 1, 1, 1,
        1, 2, 2, 2, 2, 0, 1, 0, 1, 0, 2, 2, 2, 2, 1,
        1, 1, 1, 2, 1, 0, 1, 1, 1, 0, 1, 2, 1, 1, 1,
        1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1,
        1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1,
        1, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 1,
        1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1,
        1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    };

    // Current State (mutable)
    private short[] screenData;
    
    // Pacman
    private int pacmanX, pacmanY;
    private int pacmanDX, pacmanDY;
    private int reqDX, reqDY; // Requested direction
    private final int SPEED = 4; // Pixels per frame (must be divisor of BLOCK_SIZE)

    // Ghosts
    private java.util.List<Ghost> ghosts;
    private boolean inGame = true;

    public PacmanGame() {
        initGame();
        initBoard();
    }

    private void initBoard() {
        addKeyListener(new TAdapter());
        setFocusable(true);
        setBackground(Color.black);
        setPreferredSize(new Dimension(SCREEN_SIZE, SCREEN_SIZE));
    }

    private void initGame() {
        screenData = new short[N_BLOCKS * N_BLOCKS];
        System.arraycopy(levelData, 0, screenData, 0, levelData.length);
        
        // Start position
        pacmanX = 7 * BLOCK_SIZE;
        pacmanY = 11 * BLOCK_SIZE;
        pacmanDX = 0;
        pacmanDY = 0;
        reqDX = 0;
        reqDY = 0;
        
        // Init Ghosts
        ghosts = new java.util.ArrayList<>();
        ghosts.add(new Ghost(1 * BLOCK_SIZE, 1 * BLOCK_SIZE, Color.red));
        ghosts.add(new Ghost(13 * BLOCK_SIZE, 1 * BLOCK_SIZE, Color.pink));
        ghosts.add(new Ghost(1 * BLOCK_SIZE, 13 * BLOCK_SIZE, Color.cyan));
        ghosts.add(new Ghost(13 * BLOCK_SIZE, 13 * BLOCK_SIZE, Color.orange));

        inGame = true;
        if (timer != null) timer.stop();
        timer = new Timer(40, this);
        timer.start();
    }

    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        doDrawing(g);
    }

    private void doDrawing(Graphics g) {
        Graphics2D g2d = (Graphics2D) g;

        drawMap(g2d);
        drawPacman(g2d);
        
        for (Ghost ghost : ghosts) {
            ghost.draw(g2d, BLOCK_SIZE);
        }
        
        if (!inGame) {
            drawGameOver(g2d);
        }
    }
    
    private void drawGameOver(Graphics2D g2d) {
        String msg = "Game Over";
        Font small = new Font("Helvetica", Font.BOLD, 14);
        FontMetrics metr = getFontMetrics(small);

        g2d.setColor(Color.white);
        g2d.setFont(small);
        g2d.drawString(msg, (SCREEN_SIZE - metr.stringWidth(msg)) / 2, SCREEN_SIZE / 2);
    }

    private void drawMap(Graphics2D g2d) {
        for (int i = 0; i < N_BLOCKS * N_BLOCKS; i++) {
            int x = (i % N_BLOCKS) * BLOCK_SIZE;
            int y = (i / N_BLOCKS) * BLOCK_SIZE;

            if (screenData[i] == 1) {
                // Wall
                g2d.setColor(new Color(0, 0, 255));
                g2d.setStroke(new BasicStroke(2));
                g2d.drawRect(x + 4, y + 4, BLOCK_SIZE - 8, BLOCK_SIZE - 8);
            } else if (screenData[i] == 2) {
                // Dot
                g2d.setColor(new Color(255, 255, 255));
                g2d.fillOval(x + 10, y + 10, 4, 4);
            }
        }
    }

    private void drawPacman(Graphics2D g2d) {
        if (inGame) {
            g2d.setColor(Color.yellow);
            g2d.fillArc(pacmanX, pacmanY, BLOCK_SIZE, BLOCK_SIZE, 30, 300);
        }
    }

    private void movePacman() {
        if (pacmanX % BLOCK_SIZE == 0 && pacmanY % BLOCK_SIZE == 0) {
            int pos = pacmanX / BLOCK_SIZE + N_BLOCKS * (pacmanY / BLOCK_SIZE);
            int nextPos = -1;

            if (reqDX != 0 || reqDY != 0) {
                if (reqDX == -1 && reqDY == 0) nextPos = pos - 1;
                if (reqDX == 1 && reqDY == 0) nextPos = pos + 1;
                if (reqDX == 0 && reqDY == -1) nextPos = pos - N_BLOCKS;
                if (reqDX == 0 && reqDY == 1) nextPos = pos + N_BLOCKS;

                if (nextPos >= 0 && nextPos < N_BLOCKS * N_BLOCKS && (screenData[nextPos] & 1) == 0) {
                    pacmanDX = reqDX;
                    pacmanDY = reqDY;
                }
            }

            nextPos = -1;
            if (pacmanDX == -1 && pacmanDY == 0) nextPos = pos - 1;
            if (pacmanDX == 1 && pacmanDY == 0) nextPos = pos + 1;
            if (pacmanDX == 0 && pacmanDY == -1) nextPos = pos - N_BLOCKS;
            if (pacmanDX == 0 && pacmanDY == 1) nextPos = pos + N_BLOCKS;
            
            if (nextPos >= 0 && nextPos < N_BLOCKS * N_BLOCKS && (screenData[nextPos] & 1) != 0) {
                pacmanDX = 0;
                pacmanDY = 0;
            }
            
            if ((screenData[pos] & 2) != 0) {
                 screenData[pos] = (short)(screenData[pos] & 1);
            }
        }

        pacmanX += pacmanDX * SPEED;
        pacmanY += pacmanDY * SPEED;
    }
    
    private void moveGhosts(Graphics2D g2d) {
        for (Ghost ghost : ghosts) {
            ghost.move(screenData, N_BLOCKS, BLOCK_SIZE);
            
            // Collision Detection
            // Simple bounding box or distance check
            if (ghost.x > pacmanX - 12 && ghost.x < pacmanX + 12
                && ghost.y > pacmanY - 12 && ghost.y < pacmanY + 12) {
                inGame = false;
            }
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (inGame) {
            movePacman();
            // Note: Ghost logic usually separated, but for simplicity:
            for (Ghost ghost : ghosts) {
                ghost.move(screenData, N_BLOCKS, BLOCK_SIZE);
                if (Math.abs(ghost.x - pacmanX) < BLOCK_SIZE/2 && Math.abs(ghost.y - pacmanY) < BLOCK_SIZE/2) {
                    inGame = false;
                }
            }
        }
        repaint();
    }

    class TAdapter extends KeyAdapter {
        @Override
        public void keyPressed(KeyEvent e) {
            int key = e.getKeyCode();

            if (key == KeyEvent.VK_LEFT) {
                reqDX = -1;
                reqDY = 0;
            } else if (key == KeyEvent.VK_RIGHT) {
                reqDX = 1;
                reqDY = 0;
            } else if (key == KeyEvent.VK_UP) {
                reqDX = 0;
                reqDY = -1;
            } else if (key == KeyEvent.VK_DOWN) {
                reqDX = 0;
                reqDY = 1;
            } else if (key == KeyEvent.VK_ESCAPE && timer.isRunning()) {
                System.exit(0);
            }
        }
    }
}

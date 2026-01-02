use rand::Rng;



pub struct GameOfLife {
    pub grid: Vec<Vec<bool>>,
    pub width: usize,
    pub height: usize,
    pub running: bool,
}

impl GameOfLife {
    pub fn new(width: usize, height: usize) -> Self {
        let grid = vec![vec![false; width]; height];
        Self {
            grid,
            width,
            height,
            running: false,
        }
    }

    pub fn randomize(&mut self) {
        let mut rng = rand::thread_rng();
        for y in 0..self.height {
            for x in 0..self.width {
                self.grid[y][x] = rng.gen_bool(0.2); // 20% chance of being alive
            }
        }
    }

    pub fn clear(&mut self) {
        for y in 0..self.height {
            for x in 0..self.width {
                self.grid[y][x] = false;
            }
        }
    }



    pub fn update(&mut self) {
        if !self.running {
            return;
        }

        let mut next_grid = self.grid.clone();

        for y in 0..self.height {
            for x in 0..self.width {
                let live_neighbors = self.count_live_neighbors(x, y);
                let is_alive = self.grid[y][x];

                next_grid[y][x] = match (is_alive, live_neighbors) {
                    (true, 2) | (true, 3) => true,
                    (false, 3) => true,
                    _ => false,
                };
            }
        }

        self.grid = next_grid;
    }

    fn count_live_neighbors(&self, x: usize, y: usize) -> u8 {
        let mut count = 0;
        for dy in [-1, 0, 1] {
            for dx in [-1, 0, 1] {
                if dx == 0 && dy == 0 {
                    continue;
                }

                let nx = x as isize + dx;
                let ny = y as isize + dy;

                if nx >= 0 && nx < self.width as isize && ny >= 0 && ny < self.height as isize {
                    if self.grid[ny as usize][nx as usize] {
                        count += 1;
                    }
                }
            }
        }
        count
    }
}

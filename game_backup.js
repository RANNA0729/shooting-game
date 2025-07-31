// 確実に動作するシンプル版
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = new Player(this.width / 2, this.height - 60);
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        
        this.score = 0;
        this.lives = 10;
        this.gameState = 'playing';
        
        this.keys = {};
        this.gameStartTime = Date.now();
        this.lastEnemySpawn = Date.now();
        this.enemySpawnRate = 3000;
        
        this.setupEventListeners();
        this.gameLoop();
        
        console.log('Game initialized successfully!');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.player.update(this.keys);
        
        // Spawn enemies
        if (Date.now() - this.gameStartTime > 2000 && Date.now() - this.lastEnemySpawn > this.enemySpawnRate) {
            this.enemies.push(new Enemy(Math.random() * (this.width - 40) + 20, -40));
            this.lastEnemySpawn = Date.now();
        }
        
        // Update bullets
        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => bullet.y > -10);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update());
        this.enemies = this.enemies.filter(enemy => enemy.y < this.height + 40);
        
        // Player shooting
        if (this.keys['Space'] && this.player.canShoot()) {
            this.bullets.push(this.player.shoot());
        }
        
        // Enemy shooting
        this.enemies.forEach(enemy => {
            if (enemy.canShoot()) {
                this.enemyBullets.push(enemy.shoot());
            }
        });
        
        // Update enemy bullets
        this.enemyBullets.forEach(bullet => bullet.update());
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.y < this.height + 10);
        
        this.checkCollisions();
        this.updateUI();
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += 100;
                }
            });
        });
        
        // Enemy bullets vs player
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (this.isColliding(bullet, this.player)) {
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameState = 'gameOver';
                    document.getElementById('gameOver').style.display = 'block';
                }
            }
        });
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.player.render(this.ctx);
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 7;
        this.lastShot = 0;
        this.shootCooldown = 100;
    }
    
    update(keys) {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < 760) {
            this.x += this.speed;
        }
        if (keys['ArrowUp'] && this.y > 0) {
            this.y -= this.speed;
        }
        if (keys['ArrowDown'] && this.y < 560) {
            this.y += this.speed;
        }
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shoot() {
        this.lastShot = Date.now();
        return new Bullet(this.x + this.width / 2, this.y, -8, 'blue');
    }
    
    render(ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.lastShot = 0;
        this.shootCooldown = 4000;
    }
    
    update() {
        this.y += this.speed;
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown && Math.random() < 0.01;
    }
    
    shoot() {
        this.lastShot = Date.now();
        return new Bullet(this.x + this.width / 2, this.y + this.height, 2, 'red');
    }
    
    render(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Bullet {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.speed = speed;
        this.color = color;
    }
    
    update() {
        this.y += this.speed;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    }
}

// ゲーム開始
const game = new Game();
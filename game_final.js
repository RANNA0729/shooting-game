// Base64埋め込み画像データ（デプロイ環境で確実に動作）
const BOSS_IMAGE_DATA = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY2NjAwIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkYwMDAwIi8+CjxyZWN0IHg9IjU1IiB5PSIxMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkYwMDAwIi8+CjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI0ZGRkYwMCIvPgo8cmVjdCB4PSI1NyIgeT0iMTUiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNGRkZGMDAiLz4KPHN2Zz4K";

const FINAL_BOSS_IMAGE_DATA = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjODgwMEZGIi8+CjxyZWN0IHg9IjIwIiB5PSIxNSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRkYwMDg4Ii8+CjxyZWN0IHg9IjgwIiB5PSIxNSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRkYwMDg4Ii8+CjxyZWN0IHg9IjUwIiB5PSIzMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRkYwMDg4Ii8+CjxyZWN0IHg9IjI1IiB5PSIyMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRkZGRjAwIi8+CjxyZWN0IHg9Ijg1IiB5PSIyMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRkZGRjAwIi8+CjxyZWN0IHg9IjU1IiB5PSIzNSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRkZGRjAwIi8+Cjwvc3ZnPgo=";

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
        this.particles = [];
        
        this.score = 0;
        this.lives = 10;
        this.stage = 1;
        this.gameState = 'playing';
        
        this.boss = null;
        this.finalBoss = null;
        
        this.keys = {};
        this.gameStartTime = Date.now();
        this.lastEnemySpawn = Date.now();
        this.enemySpawnRate = 3000;
        
        // Base64埋め込み画像の読み込み（確実に動作）
        this.images = {};
        this.loadEmbeddedImages();
        
        this.setupEventListeners();
        this.gameLoop();
        
        console.log('🎯 Final version with embedded images loaded!');
    }
    
    loadEmbeddedImages() {
        // ボス画像
        this.images.boss = new Image();
        this.images.boss.onload = () => {
            console.log('✅ Boss image loaded from embedded data');
        };
        this.images.boss.onerror = () => {
            console.error('❌ Boss embedded image failed');
        };
        this.images.boss.src = BOSS_IMAGE_DATA;
        
        // ラスボス画像
        this.images.finalBoss = new Image();
        this.images.finalBoss.onload = () => {
            console.log('✅ Final boss image loaded from embedded data');
        };
        this.images.finalBoss.onerror = () => {
            console.error('❌ Final boss embedded image failed');
        };
        this.images.finalBoss.src = FINAL_BOSS_IMAGE_DATA;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' && this.gameState === 'gameOver') {
                this.restart();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    spawnEnemies() {
        // ボス出現（スコア200で）
        if (this.stage === 1 && this.score >= 200 && !this.boss) {
            this.boss = new Boss(this.width / 2, 100, this.images.boss);
            this.stage = 2;
            console.log('🔥 Boss spawned with embedded image!');
            return;
        }
        
        // ラスボス出現（スコア500で）
        if (this.stage === 2 && this.score >= 500 && !this.finalBoss) {
            this.finalBoss = new FinalBoss(this.width / 2, 100, this.images.finalBoss);
            this.stage = 3;
            console.log('💀 Final Boss spawned with embedded image!');
            return;
        }
        
        // 通常の敵
        if (this.stage <= 2 && (!this.boss || !this.boss.isDead) && 
            Date.now() - this.gameStartTime > 2000 && 
            Date.now() - this.lastEnemySpawn > this.enemySpawnRate) {
            this.enemies.push(new Enemy(Math.random() * (this.width - 40) + 20, -40));
            this.lastEnemySpawn = Date.now();
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.player.update(this.keys);
        
        // 弾の更新
        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => bullet.y > -10);
        
        // 敵の更新
        this.enemies.forEach(enemy => enemy.update());
        this.enemies = this.enemies.filter(enemy => enemy.y < this.height + 40);
        
        // 敵の弾の更新
        this.enemyBullets.forEach(bullet => bullet.update());
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.y < this.height + 10);
        
        // パーティクルの更新
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // ボスの更新
        if (this.boss) {
            this.boss.update();
            if (this.boss.canShoot()) {
                this.enemyBullets.push(...this.boss.shoot());
            }
        }
        
        // ラスボスの更新
        if (this.finalBoss) {
            this.finalBoss.update();
            if (this.finalBoss.canShoot()) {
                this.enemyBullets.push(...this.finalBoss.shoot());
            }
        }
        
        // プレイヤーの射撃
        if (this.keys['Space'] && this.player.canShoot()) {
            this.bullets.push(this.player.shoot());
        }
        
        // 敵の射撃
        this.enemies.forEach(enemy => {
            if (enemy.canShoot()) {
                this.enemyBullets.push(enemy.shoot());
            }
        });
        
        this.checkCollisions();
        this.spawnEnemies();
        this.updateUI();
    }
    
    checkCollisions() {
        // プレイヤーの弾 vs 敵
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    this.createExplosion(enemy.x, enemy.y);
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += 100;
                }
            });
            
            // プレイヤーの弾 vs ボス
            if (this.boss && this.isColliding(bullet, this.boss)) {
                this.bullets.splice(bulletIndex, 1);
                this.boss.takeDamage();
                this.createExplosion(bullet.x, bullet.y);
                if (this.boss.isDead) {
                    this.createExplosion(this.boss.x, this.boss.y, 20);
                    this.score += 2000;
                }
            }
            
            // プレイヤーの弾 vs ラスボス
            if (this.finalBoss && this.isColliding(bullet, this.finalBoss)) {
                this.bullets.splice(bulletIndex, 1);
                this.finalBoss.takeDamage();
                this.createExplosion(bullet.x, bullet.y);
                if (this.finalBoss.isDead) {
                    this.createExplosion(this.finalBoss.x, this.finalBoss.y, 30);
                    this.score += 5000;
                    this.gameState = 'victory';
                    document.getElementById('victory').style.display = 'block';
                }
            }
        });
        
        // 敵の弾 vs プレイヤー
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (this.isColliding(bullet, this.player)) {
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
                this.createExplosion(this.player.x, this.player.y);
                if (this.lives <= 0) {
                    this.gameState = 'gameOver';
                    document.getElementById('gameOver').style.display = 'block';
                }
            }
        });
        
        // 敵 vs プレイヤー
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(enemy, this.player)) {
                this.enemies.splice(enemyIndex, 1);
                this.lives--;
                this.createExplosion(this.player.x, this.player.y);
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
    
    createExplosion(x, y, particleCount = 10) {
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y));
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.player.render(this.ctx);
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        
        if (this.boss) {
            this.boss.render(this.ctx);
        }
        
        if (this.finalBoss) {
            this.finalBoss.render(this.ctx);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('stage').textContent = this.stage;
    }
    
    restart() {
        this.player = new Player(this.width / 2, this.height - 60);
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        this.boss = null;
        this.finalBoss = null;
        this.score = 0;
        this.lives = 10;
        this.stage = 1;
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.lastEnemySpawn = Date.now();
        
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('victory').style.display = 'none';
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
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 15, this.y - 10, 10, 15);
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
        return Date.now() - this.lastShot > this.shootCooldown && Math.random() < 0.005;
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

class Boss {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 60;
        this.speed = 2;
        this.direction = 1;
        this.health = 20;
        this.maxHealth = 20;
        this.lastShot = 0;
        this.shootCooldown = 1500;
        this.isDead = false;
        this.image = image;
    }
    
    update() {
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x >= 720) {
            this.direction *= -1;
        }
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.isDead = true;
        }
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shoot() {
        this.lastShot = Date.now();
        return [
            new Bullet(this.x + 20, this.y + this.height, 3, 'orange'),
            new Bullet(this.x + 40, this.y + this.height, 3, 'orange'),
            new Bullet(this.x + 60, this.y + this.height, 3, 'orange')
        ];
    }
    
    render(ctx) {
        // Base64埋め込み画像を確実に表示
        if (this.image && this.image.complete) {
            try {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                console.log('🎨 Boss image rendered successfully!');
            } catch (e) {
                console.warn('⚠️ Boss image render failed, using fallback');
                this.renderFallback(ctx);
            }
        } else {
            this.renderFallback(ctx);
        }
        
        // HPバー
        this.renderHealthBar(ctx);
    }
    
    renderFallback(ctx) {
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 10, this.y + 10, 15, 15);
        ctx.fillRect(this.x + 55, this.y + 10, 15, 15);
    }
    
    renderHealthBar(ctx) {
        const healthBarWidth = 60;
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 10, this.y - 15, healthBarWidth, 8);
        ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(this.x + 10, this.y - 15, healthBarWidth * healthPercentage, 8);
    }
}

class FinalBoss {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 80;
        this.speed = 1.5;
        this.direction = 1;
        this.health = 50;
        this.maxHealth = 50;
        this.lastShot = 0;
        this.shootCooldown = 1200;
        this.isDead = false;
        this.attackPattern = 0;
        this.image = image;
    }
    
    update() {
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x >= 680) {
            this.direction *= -1;
        }
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.isDead = true;
        }
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shoot() {
        this.lastShot = Date.now();
        const bullets = [];
        
        if (this.attackPattern === 0) {
            for (let i = 0; i < 5; i++) {
                bullets.push(new Bullet(this.x + 20 + i * 20, this.y + this.height, 2, 'purple'));
            }
        } else {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                bullets.push(new RadialBullet(centerX, centerY, Math.cos(angle) * 2, Math.sin(angle) * 2, 'purple'));
            }
        }
        
        this.attackPattern = (this.attackPattern + 1) % 2;
        return bullets;
    }
    
    render(ctx) {
        // Base64埋め込み画像を確実に表示
        if (this.image && this.image.complete) {
            try {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                console.log('🎨 Final boss image rendered successfully!');
            } catch (e) {
                console.warn('⚠️ Final boss image render failed, using fallback');
                this.renderFallback(ctx);
            }
        } else {
            this.renderFallback(ctx);
        }
        
        // HPバー
        this.renderHealthBar(ctx);
    }
    
    renderFallback(ctx) {
        ctx.fillStyle = '#8800ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ff0088';
        ctx.fillRect(this.x + 20, this.y + 15, 20, 20);
        ctx.fillRect(this.x + 80, this.y + 15, 20, 20);
        ctx.fillRect(this.x + 50, this.y + 30, 20, 20);
    }
    
    renderHealthBar(ctx) {
        const healthBarWidth = 100;
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 10, this.y - 20, healthBarWidth, 12);
        ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(this.x + 10, this.y - 20, healthBarWidth * healthPercentage, 12);
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

class RadialBullet {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 6;
        this.height = 6;
        this.color = color;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
        ctx.fillRect(this.x, this.y, 3, 3);
    }
}

// ゲーム開始
const game = new Game();
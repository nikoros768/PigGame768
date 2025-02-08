const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let pig;
let corn;
let stars = [];
let explosions = [];
let score = 0;
let gameSpeed = 150; // Стартовая скорость (чем выше, тем медленнее)

(function setup() {
    pig = new Pig();
    corn = new Corn();
    generateStars();
    gameInterval = setInterval(gameLoop, gameSpeed);
    window.addEventListener('keydown', (e) => pig.changeDirection(e));
})();

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pig.update();
    pig.draw();
    corn.draw();

    // Рисуем звезды
    stars.forEach(star => star.draw());

    // Рисуем анимации взрывов
    explosions.forEach((explosion, index) => {
        explosion.update();
        explosion.draw();
        if (explosion.alpha <= 0) {
            explosions.splice(index, 1); // Удаляем взрыв, когда анимация завершена
        }
    });

    // Проверяем столкновение с кукурузой
    if (pig.eat(corn)) {
        corn.randomize();
        score++;
        document.getElementById('score').textContent = "Очки: " + score;
        pig.length += 1; // Свин растет
    }

    // Проверяем столкновение с звездами
    stars.forEach((star, index) => {
        if (pig.eat(star)) {
            explosions.push(new Explosion(star.x, star.y));
            stars.splice(index, 1);
            score += 73;
            document.getElementById('score').textContent = "Очки: " + score;
        }
    });

    if (pig.checkCollision()) {
        alert("Game Over!");
        resetGame();
    }
}

function resetGame() {
    score = 0;
    document.getElementById('score').textContent = "Очки: " + score;
    pig = new Pig();
    corn = new Corn();
    generateStars();
    gameSpeed = 150; // Начальная скорость
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function generateStars() {
    stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(new Star());
    }
}

function Pig() {
    this.body = [{ x: 10, y: 10 }];
    this.length = 1;
    this.direction = 'right';

    this.update = function() {
        const head = { ...this.body[0] };

        if (this.direction === 'right') head.x++;
        if (this.direction === 'left') head.x--;
        if (this.direction === 'up') head.y--;
        if (this.direction === 'down') head.y++;

        this.body.unshift(head);
        if (this.body.length > this.length) this.body.pop();
    };

    this.draw = function() {
        this.body.forEach((segment, index) => {
            ctx.fillStyle = "#FF69B4"; // Розовый цвет свина
            ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);

            if (index === 0) {
                // Глазки
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(segment.x * scale + scale / 3, segment.y * scale + scale / 3, scale / 6, 0, Math.PI * 2);
                ctx.arc(segment.x * scale + 2 * scale / 3, segment.y * scale + scale / 3, scale / 6, 0, Math.PI * 2);
                ctx.fill();

                // Зрачки
                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.arc(segment.x * scale + scale / 3, segment.y * scale + scale / 3, scale / 12, 0, Math.PI * 2);
                ctx.arc(segment.x * scale + 2 * scale / 3, segment.y * scale + scale / 3, scale / 12, 0, Math.PI * 2);
                ctx.fill();

                // Ноздри
                ctx.fillStyle = "brown";
                ctx.beginPath();
                ctx.arc(segment.x * scale + scale / 3, segment.y * scale + 2 * scale / 3, scale / 12, 0, Math.PI * 2);
                ctx.arc(segment.x * scale + 2 * scale / 3, segment.y * scale + 2 * scale / 3, scale / 12, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    };

    this.changeDirection = function(event) {
        if (event.keyCode === 37 && this.direction !== 'right') this.direction = 'left';
        if (event.keyCode === 38 && this.direction !== 'down') this.direction = 'up';
        if (event.keyCode === 39 && this.direction !== 'left') this.direction = 'right';
        if (event.keyCode === 40 && this.direction !== 'up') this.direction = 'down';
    };

    this.eat = function(corn) {
        if (this.body[0].x === corn.x && this.body[0].y === corn.y) {
            return true;
        }
        return false;
    };

    this.checkCollision = function() {
        if (this.body[0].x < 0 || this.body[0].x >= columns || this.body[0].y < 0 || this.body[0].y >= rows) return true;
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === this.body[0].x && this.body[i].y === this.body[0].y) return true;
        }
        return false;
    };
}

function Corn() {
    this.x = Math.floor(Math.random() * columns);
    this.y = Math.floor(Math.random() * rows);

    this.randomize = function() {
        this.x = Math.floor(Math.random() * columns);
        this.y = Math.floor(Math.random() * rows);
    };

    this.draw = function() {
        ctx.fillStyle = "#FFD700"; // Желтая кукуруза
        ctx.beginPath();
        ctx.arc(this.x * scale + scale / 2, this.y * scale + scale / 2, scale / 3, 0, Math.PI * 2);
        ctx.fill();
    };
}

function Star() {
    this.x = Math.floor(Math.random() * columns);
    this.y = Math.floor(Math.random() * rows);

    this.draw = function() {
        ctx.fillStyle = "#FFFF00"; // Жёлтая звезда
        ctx.beginPath();
        ctx.arc(this.x * scale + scale / 2, this.y * scale + scale / 2, scale / 3, 0, Math.PI * 2);
        ctx.fill();
    };
}
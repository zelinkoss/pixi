const app = new PIXI.Application({
    width: 1920,
    height: 1080,
    transparent: true,
});

document.body.appendChild(app.view);

const backgroundTexture = PIXI.Texture.from('img/mario.png');
const backgroundSprite = new PIXI.Sprite(backgroundTexture);
backgroundSprite.width = app.renderer.width;
backgroundSprite.height = app.renderer.height;
app.stage.addChild(backgroundSprite);

const sprites = [];
const keys = new Set();

const speed = 5;
const jumpPower = 15; // Increased jump power for better jumping experience
const gravity = 1;

for (let i = 0; i < 5; i++) {
    const texture = PIXI.Texture.from('img/goat.jpg');
    const sprite = new PIXI.Sprite(texture);

    sprite.width = 50;
    sprite.height = 50;

    sprite.x = Math.random() * (app.renderer.width - sprite.width);
    sprite.y = Math.random() * (app.renderer.height - sprite.height);

    sprite.vx = 0;
    sprite.vy = 0;

    sprite.isJumping = false;

    sprite.interactive = true;

    sprite.on('click', () => {
        setSelectedSprite(sprite);
    });

    sprites.push(sprite);
    app.stage.addChild(sprite);
}

let selectedSprite = null;

window.addEventListener('keydown', (e) => {
    keys.add(e.key);

    if (selectedSprite) {
        if (keys.has('ArrowRight')) {
            selectedSprite.vx = speed;
        } else if (keys.has('ArrowLeft')) {
            selectedSprite.vx = -speed;
        }

        if (keys.has('ArrowUp') && !selectedSprite.isJumping) {
            selectedSprite.isJumping = true;
            selectedSprite.vy = -jumpPower;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys.delete(e.key);

    if (selectedSprite) {
        if (keys.size === 0) {
            selectedSprite.vx = 0;
        }
    }
});

function setSelectedSprite(clickedSprite) {
    if (selectedSprite) {
        selectedSprite.vx = 0;
    }

    selectedSprite = clickedSprite;
}

function update() {
    for (const sprite of sprites) {
        sprite.vy += gravity;

        sprite.x += sprite.vx;
        sprite.y += sprite.vy;

        for (const otherSprite of sprites) {
            if (sprite !== otherSprite) {
                if (isJumpingOnTop(sprite, otherSprite)) {
                    sprite.isJumping = false;
                    sprite.y = otherSprite.y - sprite.height;
                    sprite.vy = 0;
                } else if (isCollision(sprite, otherSprite)) {
                    sprite.x -= sprite.vx;
                    sprite.y -= sprite.vy;
                }
            }
        }

        sprite.x = Math.max(0, Math.min(sprite.x, app.renderer.width - sprite.width));
        sprite.y = Math.max(0, Math.min(sprite.y, app.renderer.height - sprite.height));

        if (sprite.y >= app.renderer.height - sprite.height) {
            sprite.isJumping = false;
            sprite.y = app.renderer.height - sprite.height;
            sprite.vy = 0;
        }
    }

    app.renderer.render(app.stage);

    requestAnimationFrame(update);
}

function isCollision(sprite1, sprite2) {
    return (
        sprite1.x < sprite2.x + sprite2.width &&
        sprite1.x + sprite1.width > sprite2.x &&
        sprite1.y < sprite2.y + sprite2.height &&
        sprite1.y + sprite1.height > sprite2.y
    );
}

function isJumpingOnTop(jumpingSprite, otherSprite) {
    return (
        jumpingSprite.x < otherSprite.x + otherSprite.width &&
        jumpingSprite.x + jumpingSprite.width > otherSprite.x &&
        jumpingSprite.y + jumpingSprite.height < otherSprite.y + otherSprite.height &&
        jumpingSprite.y + jumpingSprite.height + jumpingSprite.vy >= otherSprite.y
    );
}

window.addEventListener('resize', () => {
    app.renderer.resize(1920, 1080);
    backgroundSprite.width = app.renderer.width;
    backgroundSprite.height = app.renderer.height;
});

update();
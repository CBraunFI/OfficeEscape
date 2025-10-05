// Level-specific color palettes
const LEVEL_COLORS = {
    1: { // Cubicle Maze - Grey corporate tones
        DARKEST: '#1a1a1a',
        DARK: '#3d3d3d',
        MEDIUM: '#5a5a5a',
        LIGHT: '#8b8b8b',
        BEIGE: '#b0b0b0',
        LIGHTEST: '#e8e8e8',
        FLOOR_DARK: '#2a2a2a',
        FLOOR_LIGHT: '#d0d0d0',
        ACCENT: '#9a9a9a'
    },
    2: { // Corridor - Blue/Cyan office lights
        DARKEST: '#0a1a1a',
        DARK: '#1a3d3d',
        MEDIUM: '#2a5a5a',
        LIGHT: '#4a8b8b',
        BEIGE: '#6ac4c4',
        LIGHTEST: '#a8e8e8',
        FLOOR_DARK: '#152a2a',
        FLOOR_LIGHT: '#8ad4d4',
        ACCENT: '#5ab4b4'
    },
    3: { // Conference Room - Warm presentation room
        DARKEST: '#1a1010',
        DARK: '#3d2020',
        MEDIUM: '#5a3030',
        LIGHT: '#8b5555',
        BEIGE: '#c49090',
        LIGHTEST: '#e8c8c8',
        FLOOR_DARK: '#2a1a1a',
        FLOOR_LIGHT: '#d4b0b0',
        ACCENT: '#b47474'
    },
    4: { // Kitchen - Yellow/Green food service
        DARKEST: '#1a1a0a',
        DARK: '#3d3d1a',
        MEDIUM: '#5a5a2a',
        LIGHT: '#8b8b4a',
        BEIGE: '#c4c46a',
        LIGHTEST: '#e8e8a8',
        FLOOR_DARK: '#2a2a15',
        FLOOR_LIGHT: '#d4d48a',
        ACCENT: '#b4b45a'
    },
    5: { // Boss Office - Dark red/burgundy power
        DARKEST: '#1a0a0a',
        DARK: '#3d1a1a',
        MEDIUM: '#5a2a2a',
        LIGHT: '#8b4a4a',
        BEIGE: '#c47070',
        LIGHTEST: '#e8b8b8',
        FLOOR_DARK: '#2a1010',
        FLOOR_LIGHT: '#d49090',
        ACCENT: '#b45a5a'
    }
};

// Current active colors (will change per level)
let COLORS = LEVEL_COLORS[1];

// Game States
const GAME_STATE = {
    MENU: 'MENU',
    INTRO: 'INTRO',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    DIALOG: 'DIALOG',
    DEATH: 'DEATH',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    GAME_OVER: 'GAME_OVER'
};

// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GRAVITY: 0.6,
    PLAYER_SPEED: 4.5,
    PLAYER_JUMP_FORCE: 13,
    PLAYER_WIDTH: 24,
    PLAYER_HEIGHT: 32,
    ENEMY_WIDTH: 24,
    ENEMY_HEIGHT: 32,
    ITEM_SIZE: 16,
    PLATFORM_COLOR: COLORS.LIGHT,
    FPS: 60
};

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER_WIDTH;
        this.height = CONFIG.PLAYER_HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isDucking = false;
        this.facingRight = true;
        this.heldItem = null;
    }

    update(keys, platforms) {
        // Horizontal movement
        this.velocityX = 0;
        if (!this.isDucking) {
            if (keys['ArrowLeft']) {
                this.velocityX = -CONFIG.PLAYER_SPEED;
                this.facingRight = false;
            }
            if (keys['ArrowRight']) {
                this.velocityX = CONFIG.PLAYER_SPEED;
                this.facingRight = true;
            }
        }

        // Ducking
        this.isDucking = keys['ArrowDown'] && !this.isJumping;

        // Jumping
        if ((keys[' '] || keys['ArrowUp']) && !this.isJumping) {
            this.velocityY = -CONFIG.PLAYER_JUMP_FORCE;
            this.isJumping = true;
        }

        // Apply gravity
        this.velocityY += CONFIG.GRAVITY;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Platform collision
        this.isJumping = true; // Assume jumping until we detect ground
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    // Landing on platform
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isJumping = false;
                } else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
                    // Hit platform from below
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                } else if (this.velocityX > 0) {
                    // Hit from left
                    this.x = platform.x - this.width;
                } else if (this.velocityX < 0) {
                    // Hit from right
                    this.x = platform.x + platform.width;
                }
            }
        }

        // Keep player in bounds
        if (this.y > CONFIG.CANVAS_HEIGHT) {
            this.y = CONFIG.CANVAS_HEIGHT - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
        if (this.x < 0) this.x = 0;
    }

    checkCollision(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Shadow (cast on ground)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(screenX + this.width / 2, screenY + this.height, this.width / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.isDucking) {
            // Ducking - detailed crouching pose
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 2, screenY + this.height / 2, this.width - 4, this.height / 2 - 2);

            // Head (lowered)
            ctx.fillStyle = COLORS.BEIGE;
            ctx.fillRect(screenX + 4, screenY + this.height / 2 - 8, this.width - 8, 10);

            // Hair
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 4, screenY + this.height / 2 - 10, this.width - 8, 4);
        } else {
            // Shirt/Body
            ctx.fillStyle = COLORS.BEIGE;
            ctx.fillRect(screenX + 5, screenY + 12, this.width - 10, 12);

            // Pants
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 5, screenY + 24, this.width - 10, 8);

            // Head/Face
            ctx.fillStyle = COLORS.ACCENT;
            ctx.fillRect(screenX + 6, screenY + 2, this.width - 12, 11);

            // Hair
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX + 6, screenY, this.width - 12, 4);

            // Arms
            ctx.fillStyle = COLORS.BEIGE;
            if (this.facingRight) {
                ctx.fillRect(screenX + 1, screenY + 14, 4, 10);
                ctx.fillRect(screenX + this.width - 5, screenY + 14, 4, 10);
            } else {
                ctx.fillRect(screenX + this.width - 5, screenY + 14, 4, 10);
                ctx.fillRect(screenX + 1, screenY + 14, 4, 10);
            }

            // Legs
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 6, screenY + this.height - 8, 5, 8);
            ctx.fillRect(screenX + this.width - 11, screenY + this.height - 8, 5, 8);

            // Shoes
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX + 5, screenY + this.height - 3, 6, 3);
            ctx.fillRect(screenX + this.width - 11, screenY + this.height - 3, 6, 3);

            // Face details (eyes)
            ctx.fillStyle = COLORS.DARKEST;
            if (this.facingRight) {
                ctx.fillRect(screenX + this.width - 10, screenY + 6, 2, 3); // Eye
                ctx.fillRect(screenX + this.width - 14, screenY + 6, 1, 2); // Other eye (slight)
            } else {
                ctx.fillRect(screenX + 8, screenY + 6, 2, 3);
                ctx.fillRect(screenX + 12, screenY + 6, 1, 2);
            }

            // Tired expression (bags under eyes)
            ctx.fillStyle = COLORS.MEDIUM;
            if (this.facingRight) {
                ctx.fillRect(screenX + this.width - 10, screenY + 9, 2, 1);
            } else {
                ctx.fillRect(screenX + 8, screenY + 9, 2, 1);
            }
        }

        // Draw held item indicator (above head)
        if (this.heldItem) {
            ctx.fillStyle = COLORS.LIGHT_BROWN;
            const iconSize = 10;
            ctx.fillRect(screenX + this.width / 2 - iconSize / 2, screenY - 14, iconSize, iconSize);

            // Item type indicator
            ctx.fillStyle = COLORS.DARKEST;
            if (this.heldItem === 'coffee') {
                ctx.fillRect(screenX + this.width / 2 - 3, screenY - 12, 6, 6);
                ctx.fillRect(screenX + this.width / 2 + 3, screenY - 11, 2, 3); // handle
            } else if (this.heldItem === 'folder') {
                ctx.fillRect(screenX + this.width / 2 - 4, screenY - 13, 8, 7);
            }
        }
    }

    pickupItem(item) {
        if (!this.heldItem) {
            this.heldItem = item.type;
            return true;
        }
        return false;
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type, patrolStart, patrolEnd) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.ENEMY_WIDTH;
        this.height = CONFIG.ENEMY_HEIGHT;
        this.type = type; // 'boss', 'colleague', 'customer'
        this.patrolStart = patrolStart || x;
        this.patrolEnd = patrolEnd || x + 100;
        this.speed = this.getSpeed();
        this.direction = 1;
        this.dialog = this.getRandomDialog();
        this.dialogTimer = 0;
        this.active = true;
        this.hasShownDialog = false; // Track if dialog was shown
    }

    getSpeed() {
        switch (this.type) {
            case 'boss': return 0.5;
            case 'colleague': return 1.5;
            case 'customer': return 2.5;
            default: return 1;
        }
    }

    getRandomDialog() {
        const dialogs = {
            boss: [
                "We need to talk!",
                "Got a minute?",
                "Performance review time!",
                "Stay late today?",
                "About your TPS reports...",
                "Circle back on this?",
                "Let's touch base.",
                "Before you go...",
                "One more thing...",
                "This will be quick...",
                "Just to clarify...",
                "Team building Saturday!",
                "Synergy meeting at 4!",
                "KPIs are down.",
                "Quarterly goals?",
                "Strategic alignment needed.",
                "Stakeholder concerns...",
                "Revenue projections?",
                "Bandwidth issue here.",
                "Paradigm shift required!",
                "Core competencies lacking.",
                "Value proposition unclear.",
                "Low hanging fruit first.",
                "Think outside the box!",
                "Moving forward...",
                "Action items needed.",
                "Deliverables by Friday?",
                "ROI not looking good.",
                "Best practices review.",
                "Optimization required!",
                "Scalability concerns..."
            ],
            colleague: [
                "Quick check-in?",
                "Coffee break?",
                "Did you get my email?",
                "Got a sec?",
                "This will only take a minute...",
                "Sorry to bother you, but...",
                "Can you help me with...?",
                "Real quick question...",
                "Just wondering if...",
                "Do you know where...?",
                "Printer's jammed again...",
                "WiFi down for you too?",
                "Lunch plans?",
                "Meeting notes?",
                "Can you cover for me?",
                "Password reset help?",
                "Excel formula question...",
                "How do I...?",
                "Did you see the memo?",
                "Conference call at 2?",
                "Shared drive access?",
                "VPN not working...",
                "Client called...",
                "Budget spreadsheet?",
                "Time sheet reminder!",
                "Office supplies order?",
                "IT ticket number?",
                "Holiday schedule?",
                "Parking spot issue...",
                "Temperature okay?"
            ],
            customer: [
                "This is URGENT!",
                "I need this NOW!",
                "Can I speak to your manager?",
                "This is unacceptable!",
                "I want a refund!",
                "I've been waiting FOREVER!",
                "Let me speak to someone competent!",
                "Just one question...",
                "Why is this taking so long?",
                "I was promised...",
                "This is ridiculous!",
                "Your website said...",
                "I'm a loyal customer!",
                "I'll take my business elsewhere!",
                "Social media complaint incoming!",
                "Corporate will hear about this!",
                "I demand compensation!",
                "This is false advertising!",
                "The other company does it!",
                "I know my rights!",
                "Transfer me immediately!",
                "Supervisor. NOW.",
                "Twenty minutes on hold!",
                "Nobody told me that!",
                "This is discrimination!",
                "I'm calling my lawyer!",
                "One star review!",
                "Cancel my account!",
                "Never shopping here again!",
                "Worst service ever!"
            ]
        };
        const typeDialogs = dialogs[this.type] || dialogs.colleague;
        return typeDialogs[Math.floor(Math.random() * typeDialogs.length)];
    }

    update() {
        if (!this.active) return;

        // Patrol movement
        this.x += this.speed * this.direction;

        if (this.x <= this.patrolStart) {
            this.direction = 1;
            this.x = this.patrolStart;
        } else if (this.x >= this.patrolEnd) {
            this.direction = -1;
            this.x = this.patrolEnd;
        }

        this.dialogTimer++;
        if (this.dialogTimer > 300) {
            this.dialog = this.getRandomDialog();
            this.dialogTimer = 0;
        }
    }

    draw(ctx, camera) {
        if (!this.active) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(screenX + this.width / 2, screenY + this.height, this.width / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'boss') {
            // BOSS - Larger, more imposing figure with suit
            const bossWidth = this.width * 1.3;
            const bossHeight = this.height * 1.2;

            // Dark suit jacket
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX - 4, screenY + 14, bossWidth, 16);

            // White shirt underneath
            ctx.fillStyle = COLORS.LIGHTEST;
            ctx.fillRect(screenX + 4, screenY + 16, bossWidth - 16, 8);

            // Tie
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + bossWidth / 2 - 2, screenY + 16, 4, 10);

            // Pants
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX, screenY + 30, bossWidth - 8, 10);

            // Head - stern face
            ctx.fillStyle = COLORS.ACCENT;
            ctx.fillRect(screenX + 4, screenY + 2, bossWidth - 16, 13);

            // Slicked back hair
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX + 4, screenY, bossWidth - 16, 4);

            // Angry eyes
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX + 6, screenY + 7, 3, 2);
            ctx.fillRect(screenX + bossWidth - 17, screenY + 7, 3, 2);

            // Frown
            ctx.fillRect(screenX + 7, screenY + 12, bossWidth - 22, 1);

            // Briefcase in hand
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + bossWidth - 8, screenY + 20, 8, 10);
            ctx.fillStyle = COLORS.LIGHTEST;
            ctx.fillRect(screenX + bossWidth - 7, screenY + 21, 6, 1); // latch

        } else if (this.type === 'customer') {
            // CUSTOMER - Agitated, gesturing figure
            // Casual jacket
            ctx.fillStyle = COLORS.MEDIUM;
            ctx.fillRect(screenX + 4, screenY + 14, this.width - 8, 14);

            // Shirt
            ctx.fillStyle = COLORS.BEIGE;
            ctx.fillRect(screenX + 6, screenY + 16, this.width - 12, 8);

            // Pants
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 5, screenY + 28, this.width - 10, 8);

            // Head - stressed expression
            ctx.fillStyle = COLORS.ACCENT;
            ctx.fillRect(screenX + 6, screenY + 2, this.width - 12, 13);

            // Messy hair
            ctx.fillStyle = COLORS.MEDIUM;
            ctx.fillRect(screenX + 5, screenY, this.width - 10, 5);

            // Wide stressed eyes
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX + 7, screenY + 7, 3, 3);
            ctx.fillRect(screenX + this.width - 10, screenY + 7, 3, 3);

            // Arms gesturing (one up)
            ctx.fillStyle = COLORS.BEIGE;
            if (this.direction > 0) {
                ctx.fillRect(screenX + this.width - 6, screenY + 8, 4, 10); // arm raised
                ctx.fillRect(screenX + 2, screenY + 16, 4, 8);
            } else {
                ctx.fillRect(screenX + 2, screenY + 8, 4, 10);
                ctx.fillRect(screenX + this.width - 6, screenY + 16, 4, 8);
            }

        } else {
            // COLLEAGUE - Tired office worker with coffee
            // Casual shirt
            ctx.fillStyle = COLORS.LIGHT_BROWN;
            ctx.fillRect(screenX + 5, screenY + 14, this.width - 10, 12);

            // Pants
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 5, screenY + 26, this.width - 10, 8);

            // Head
            ctx.fillStyle = COLORS.ACCENT;
            ctx.fillRect(screenX + 6, screenY + 2, this.width - 12, 12);

            // Hair
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 6, screenY, this.width - 12, 4);

            // Tired eyes (half closed)
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX + 7, screenY + 8, 2, 1);
            ctx.fillRect(screenX + this.width - 9, screenY + 8, 2, 1);

            // Coffee cup in hand
            ctx.fillStyle = COLORS.BEIGE;
            if (this.direction > 0) {
                ctx.fillRect(screenX + this.width - 8, screenY + 18, 5, 6);
                ctx.fillStyle = COLORS.DARKEST;
                ctx.fillRect(screenX + this.width - 5, screenY + 20, 2, 2); // handle
            } else {
                ctx.fillRect(screenX + 3, screenY + 18, 5, 6);
                ctx.fillStyle = COLORS.DARKEST;
                ctx.fillRect(screenX + 3, screenY + 20, 2, 2);
            }

            // Arms
            ctx.fillStyle = COLORS.LIGHT_BROWN;
            ctx.fillRect(screenX + 2, screenY + 16, 3, 8);
            ctx.fillRect(screenX + this.width - 5, screenY + 16, 3, 8);
        }

        // Store dialog for later display (no speech bubbles anymore)
        if (screenX > -100 && screenX < CONFIG.CANVAS_WIDTH + 100) {
            // Dialog will be shown centrally on screen by Game class
        }
    }

    checkCollision(rect) {
        return this.active &&
               this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }
}

// Item Class
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.ITEM_SIZE;
        this.height = CONFIG.ITEM_SIZE;
        this.type = type; // 'coffee', 'folder', 'plant'
        this.active = true;
        this.thrown = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.respawnTimer = 0;
    }

    throw(direction, playerY) {
        this.thrown = true;
        this.velocityX = direction * 5;
        this.velocityY = -3;
        this.y = playerY;
    }

    update() {
        if (this.thrown) {
            this.velocityY += CONFIG.GRAVITY * 0.5;
            this.x += this.velocityX;
            this.y += this.velocityY;

            // Remove if out of bounds
            if (this.y > CONFIG.CANVAS_HEIGHT || this.x < -100 || this.x > 3000) {
                this.respawn();
            }
        } else if (!this.active) {
            this.respawnTimer++;
            if (this.respawnTimer > 600) { // 10 seconds at 60 FPS
                this.active = true;
                this.respawnTimer = 0;
            }
        }
    }

    respawn() {
        this.thrown = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.active = true;
        this.respawnTimer = 0;
    }

    draw(ctx, camera) {
        if (!this.active && !this.thrown) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Shadow for items
        if (!this.thrown) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(screenX + 2, screenY + this.height, this.width - 4, 2);
        }

        switch (this.type) {
            case 'coffee':
                // Coffee cup - detailed
                ctx.fillStyle = COLORS.LIGHTEST;
                ctx.fillRect(screenX + 4, screenY + 4, 8, 10);

                // Coffee inside
                ctx.fillStyle = COLORS.DARK_BROWN;
                ctx.fillRect(screenX + 5, screenY + 5, 6, 4);

                // Handle
                ctx.fillStyle = COLORS.BEIGE;
                ctx.fillRect(screenX + 12, screenY + 7, 3, 5);
                ctx.fillRect(screenX + 13, screenY + 8, 2, 3);

                // Cup rim
                ctx.fillStyle = COLORS.DARKEST;
                ctx.fillRect(screenX + 4, screenY + 4, 8, 1);
                break;

            case 'folder':
                // Folder - manila folder look
                ctx.fillStyle = COLORS.ACCENT;
                ctx.fillRect(screenX + 2, screenY + 4, 12, 10);

                // Folder tab
                ctx.fillRect(screenX + 8, screenY + 2, 4, 4);

                // Papers inside
                ctx.fillStyle = COLORS.LIGHTEST;
                ctx.fillRect(screenX + 3, screenY + 6, 10, 6);

                // Lines on paper
                ctx.fillStyle = COLORS.DARKEST;
                ctx.fillRect(screenX + 4, screenY + 8, 8, 1);
                ctx.fillRect(screenX + 4, screenY + 10, 8, 1);
                break;

            case 'plant':
                // Plant pot - office plant
                ctx.fillStyle = COLORS.DARK_BROWN;
                ctx.fillRect(screenX + 4, screenY + 10, 8, 6);

                // Leaves/foliage
                ctx.fillStyle = COLORS.MEDIUM;
                ctx.fillRect(screenX + 6, screenY + 4, 4, 8);
                ctx.fillRect(screenX + 4, screenY + 6, 8, 4);

                // Highlights on leaves
                ctx.fillStyle = COLORS.LIGHT_BROWN;
                ctx.fillRect(screenX + 7, screenY + 7, 2, 2);
                break;
        }
    }

    checkCollision(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height, type = 'desk') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        if (this.type === 'desk') {
            // Desk surface - wood grain look
            ctx.fillStyle = COLORS.LIGHT_BROWN;
            ctx.fillRect(screenX, screenY, this.width, this.height);

            // Wood grain detail
            ctx.fillStyle = COLORS.MEDIUM;
            for (let i = 0; i < this.width; i += 12) {
                ctx.fillRect(screenX + i, screenY + 1, 1, this.height - 2);
            }

            // Desk edge (darker)
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX, screenY, this.width, 2);
            ctx.fillRect(screenX, screenY + this.height - 2, this.width, 2);

            // Desk legs with shadow
            ctx.fillStyle = COLORS.DARK_BROWN;
            ctx.fillRect(screenX + 6, screenY + this.height, 6, 12);
            ctx.fillRect(screenX + this.width - 12, screenY + this.height, 6, 12);

            // Leg shadows
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(screenX + 12, screenY + this.height, 2, 12);
            ctx.fillRect(screenX + this.width - 6, screenY + this.height, 2, 12);

        } else if (this.type === 'cabinet') {
            // Filing cabinet - metal look
            ctx.fillStyle = COLORS.MEDIUM;
            ctx.fillRect(screenX, screenY, this.width, this.height);

            // Cabinet drawers
            ctx.fillStyle = COLORS.DARK_BROWN;
            const drawerHeight = this.height / 3;
            ctx.fillRect(screenX + 2, screenY + drawerHeight - 2, this.width - 4, 2);
            ctx.fillRect(screenX + 2, screenY + drawerHeight * 2 - 2, this.width - 4, 2);

            // Drawer handles
            ctx.fillStyle = COLORS.DARKEST;
            ctx.fillRect(screenX + this.width / 2 - 3, screenY + drawerHeight / 2 - 1, 6, 2);
            ctx.fillRect(screenX + this.width / 2 - 3, screenY + drawerHeight * 1.5 - 1, 6, 2);
            ctx.fillRect(screenX + this.width / 2 - 3, screenY + drawerHeight * 2.5 - 1, 6, 2);

            // Metal shine
            ctx.fillStyle = COLORS.LIGHTEST;
            ctx.fillRect(screenX + 4, screenY + 4, 2, this.height - 8);

        } else if (this.type === 'floor') {
            // Checkered floor pattern (like reference images)
            const tileSize = 20;
            for (let x = 0; x < this.width; x += tileSize) {
                for (let y = 0; y < this.height; y += tileSize) {
                    const isDark = ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2) === 0;
                    ctx.fillStyle = isDark ? COLORS.FLOOR_DARK : COLORS.FLOOR_LIGHT;
                    ctx.fillRect(screenX + x, screenY + y, tileSize, tileSize);
                }
            }

            // Grout lines
            ctx.fillStyle = COLORS.DARKEST;
            for (let x = 0; x < this.width; x += tileSize) {
                ctx.fillRect(screenX + x, screenY, 1, this.height);
            }
            for (let y = 0; y < this.height; y += tileSize) {
                ctx.fillRect(screenX, screenY + y, this.width, 1);
            }
        } else {
            // Default platform
            ctx.fillStyle = COLORS.LIGHT_BROWN;
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
    }
}

// Exit Class
class Exit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Door frame
        ctx.fillStyle = COLORS.DARK_BROWN;
        ctx.fillRect(screenX - 4, screenY - 4, this.width + 8, this.height + 4);

        // Door itself - wooden
        ctx.fillStyle = COLORS.MEDIUM;
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // Wood grain
        ctx.fillStyle = COLORS.DARK_BROWN;
        for (let i = 0; i < this.height; i += 8) {
            ctx.fillRect(screenX + 2, screenY + i, this.width - 4, 1);
        }

        // Door panels (recessed)
        ctx.fillStyle = COLORS.DARKEST;
        ctx.fillRect(screenX + 6, screenY + 8, this.width - 12, 18);
        ctx.fillRect(screenX + 6, screenY + 32, this.width - 12, 18);

        // Door handle
        ctx.fillStyle = COLORS.LIGHTEST;
        ctx.fillRect(screenX + this.width - 12, screenY + this.height / 2 - 2, 6, 4);

        // EXIT sign (illuminated)
        ctx.fillStyle = COLORS.LIGHTEST;
        ctx.fillRect(screenX + 4, screenY + 2, 32, 12);

        // EXIT text
        ctx.fillStyle = COLORS.DARKEST;
        ctx.font = 'bold 9px monospace';
        ctx.fillText('EXIT', screenX + 8, screenY + 11);

        // Light glow effect around sign
        ctx.fillStyle = 'rgba(232, 220, 200, 0.3)';
        ctx.fillRect(screenX + 2, screenY, 36, 16);
    }

    checkCollision(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }
}

// Camera Class
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    update(player, levelWidth) {
        // Follow player with some lead
        const targetX = player.x - CONFIG.CANVAS_WIDTH / 3;
        this.x = Math.max(0, Math.min(targetX, levelWidth - CONFIG.CANVAS_WIDTH));
    }
}

// Level Class
class Level {
    constructor(levelData, levelNum) {
        this.platforms = levelData.platforms.map(p => new Platform(p.x, p.y, p.width, p.height, p.type));
        this.enemies = levelData.enemies.map(e => new Enemy(e.x, e.y, e.type, e.patrolStart, e.patrolEnd));
        this.items = levelData.items.map(i => new Item(i.x, i.y, i.type));
        this.exit = new Exit(levelData.exit.x, levelData.exit.y);
        this.width = levelData.width;
        this.name = levelData.name;
        this.time = levelData.time;
        this.levelNum = levelNum || 1;
    }

    update() {
        this.enemies.forEach(enemy => enemy.update());
        this.items.forEach(item => item.update());
    }

    draw(ctx, camera) {
        // Level-specific background drawing
        this.drawBackground(ctx, camera);

        // Draw platforms (desks, cabinets, floor)
        this.platforms.forEach(platform => platform.draw(ctx, camera));

        // Draw level-specific decorations
        this.drawDecorations(ctx, camera);

        // Draw items
        this.items.forEach(item => item.draw(ctx, camera));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(ctx, camera));

        // Draw exit
        this.exit.draw(ctx, camera);

        // Atmospheric vignette effect
        const vignette = ctx.createRadialGradient(
            CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, CONFIG.CANVAS_HEIGHT * 0.3,
            CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, CONFIG.CANVAS_HEIGHT * 0.9
        );
        vignette.addColorStop(0, 'rgba(26, 26, 26, 0)');
        vignette.addColorStop(1, 'rgba(26, 26, 26, 0.5)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    drawBackground(ctx, camera) {
        // Base gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
        bgGradient.addColorStop(0, COLORS.DARKEST);
        bgGradient.addColorStop(0.3, COLORS.DARK);
        bgGradient.addColorStop(1, COLORS.MEDIUM);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        const bgOffset = camera.x * 0.3;

        switch(this.levelNum) {
            case 1: // Grey corporate corridor
                // Distant office cubicles
                ctx.fillStyle = COLORS.DARKEST;
                for (let i = 0; i < 10; i++) {
                    const x = (i * 200 - bgOffset) % (CONFIG.CANVAS_WIDTH + 200);
                    ctx.fillRect(x, 100, 70, 80);
                    // Cubicle dividers
                    ctx.fillStyle = COLORS.MEDIUM;
                    ctx.fillRect(x + 5, 100, 2, 80);
                    ctx.fillRect(x + 63, 100, 2, 80);
                    ctx.fillStyle = COLORS.DARKEST;
                }
                break;

            case 2: // Blue/Cyan office with monitors
                // Computer screens on distant walls
                for (let i = 0; i < 12; i++) {
                    const x = (i * 150 - bgOffset) % (CONFIG.CANVAS_WIDTH + 150);
                    // Monitor glow
                    ctx.fillStyle = COLORS.ACCENT;
                    ctx.fillRect(x, 120, 50, 40);
                    // Screen content
                    ctx.fillStyle = COLORS.LIGHTEST;
                    ctx.fillRect(x + 5, 125, 40, 30);
                }
                break;

            case 3: // Warm presentation room
                // Large projection screen
                ctx.fillStyle = COLORS.DARKEST;
                ctx.fillRect(100 - bgOffset * 0.5, 80, 250, 150);
                // Screen content glow
                ctx.fillStyle = COLORS.ACCENT;
                ctx.fillRect(110 - bgOffset * 0.5, 90, 230, 130);
                // Presentation chairs
                for (let i = 0; i < 5; i++) {
                    const x = (i * 180 - bgOffset) % (CONFIG.CANVAS_WIDTH + 180);
                    ctx.fillStyle = COLORS.DARK;
                    ctx.fillRect(x + 50, 400, 30, 40);
                }
                break;

            case 4: // Yellow/Green kitchen
                // Kitchen cabinets on walls
                ctx.fillStyle = COLORS.MEDIUM;
                for (let i = 0; i < 8; i++) {
                    const x = (i * 220 - bgOffset) % (CONFIG.CANVAS_WIDTH + 220);
                    ctx.fillRect(x, 90, 100, 60);
                    // Cabinet handles
                    ctx.fillStyle = COLORS.DARKEST;
                    ctx.fillRect(x + 45, 115, 10, 3);
                    ctx.fillStyle = COLORS.MEDIUM;
                }
                // Refrigerator
                ctx.fillStyle = COLORS.LIGHTEST;
                ctx.fillRect(50 - bgOffset * 0.5, 350, 80, 150);
                ctx.fillStyle = COLORS.DARKEST;
                ctx.fillRect(85 - bgOffset * 0.5, 410, 3, 30);
                break;

            case 5: // Dark red executive office
                // Bookshelves
                ctx.fillStyle = COLORS.DARKEST;
                for (let i = 0; i < 6; i++) {
                    const x = (i * 250 - bgOffset) % (CONFIG.CANVAS_WIDTH + 250);
                    ctx.fillRect(x, 100, 120, 180);
                    // Books
                    ctx.fillStyle = COLORS.ACCENT;
                    for (let j = 0; j < 4; j++) {
                        ctx.fillRect(x + 5, 110 + j * 40, 15, 35);
                        ctx.fillRect(x + 25, 110 + j * 40, 20, 35);
                        ctx.fillRect(x + 50, 110 + j * 40, 12, 35);
                        ctx.fillRect(x + 67, 110 + j * 40, 18, 35);
                        ctx.fillRect(x + 90, 110 + j * 40, 25, 35);
                    }
                    ctx.fillStyle = COLORS.DARKEST;
                }
                // Large desk in background
                ctx.fillStyle = COLORS.DARK;
                ctx.fillRect(300 - bgOffset * 0.4, 280, 180, 80);
                break;
        }

        // Office walls texture
        ctx.fillStyle = COLORS.BEIGE;
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 4) {
            ctx.fillRect(i, 0, 1, CONFIG.CANVAS_HEIGHT);
        }
        ctx.globalAlpha = 1.0;
    }

    drawDecorations(ctx, camera) {
        // Overhead lighting (ceiling lights)
        const lightColor = this.levelNum === 2 ? COLORS.ACCENT : COLORS.LIGHTEST;
        for (let i = 0; i < this.width; i += 200) {
            const screenX = i - camera.x;
            if (screenX > -100 && screenX < CONFIG.CANVAS_WIDTH + 100) {
                // Light fixture
                ctx.fillStyle = COLORS.DARKEST;
                ctx.fillRect(screenX + 40, 10, 40, 8);

                // Light glow (color depends on level)
                const rgba = this.levelNum === 2 ?
                    'rgba(106, 196, 196,' : // Cyan glow for level 2
                    this.levelNum === 3 ?
                    'rgba(196, 144, 144,' : // Warm glow for level 3
                    this.levelNum === 4 ?
                    'rgba(196, 196, 106,' : // Yellow glow for level 4
                    this.levelNum === 5 ?
                    'rgba(180, 90, 90,' : // Red glow for level 5
                    'rgba(232, 232, 232,'; // Default white-ish

                const lightGradient = ctx.createRadialGradient(screenX + 60, 50, 10, screenX + 60, 50, 150);
                lightGradient.addColorStop(0, rgba + ' 0.4)');
                lightGradient.addColorStop(0.5, rgba + ' 0.15)');
                lightGradient.addColorStop(1, rgba + ' 0)');
                ctx.fillStyle = lightGradient;
                ctx.beginPath();
                ctx.arc(screenX + 60, 50, 150, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Game Class
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set up responsive canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });

        this.keys = {};
        this.touchKeys = {}; // Separate object for touch inputs
        this.gameState = GAME_STATE.MENU;
        this.camera = new Camera();
        this.soundManager = new SoundManager();
        this.menuButtonHover = false;
        this.deathMessages = [
            "Not again...",
            "*Sigh*",
            "Why me?",
            "I need a vacation.",
            "Maybe tomorrow...",
            "This is fine.",
            "Deep breaths.",
            "Count to ten...",
            "Keep smiling.",
            "Almost had it."
        ];
        this.stateTimer = 0;
        this.currentMessage = "Here we go again.";
        this.wasJumping = false;
        this.currentDialog = null;
        this.dialogTimer = 0;
        this.currentLevel = 1;

        this.initLevel(1);
        this.setupControls();
        this.setupTouchControls();
        this.gameLoop();
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight - 200;

        // Maintain aspect ratio
        const aspectRatio = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
        let width = Math.min(CONFIG.CANVAS_WIDTH, maxWidth);
        let height = width / aspectRatio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        // Keep internal resolution constant for pixel-perfect rendering
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
    }

    initLevel(levelNum) {
        this.currentLevel = levelNum;

        // Apply level-specific color palette
        COLORS = LEVEL_COLORS[levelNum] || LEVEL_COLORS[1];

        let levelData;

        switch(levelNum) {
            case 1:
                levelData = this.getLevelData1();
                break;
            case 2:
                levelData = this.getLevelData2();
                break;
            case 3:
                levelData = this.getLevelData3();
                break;
            case 4:
                levelData = this.getLevelData4();
                break;
            case 5:
                levelData = this.getLevelData5();
                break;
            default:
                levelData = this.getLevelData1();
        }

        this.level = new Level(levelData, levelNum);
        this.player = new Player(100, 400);
        this.thrownItems = [];

        // Start level-specific music
        this.soundManager.startBackgroundMusic(levelNum);
    }

    getLevelData1() {
        const levelData = {
            name: "The Cubicle Maze",
            time: "8:47 AM",
            width: 2400,
            platforms: [
                // Ground
                { x: 0, y: 550, width: 2400, height: 50, type: 'floor' },

                // Starting area
                { x: 50, y: 480, width: 100, height: 20, type: 'desk' },

                // Section 1: Force jump over colleague on ground
                { x: 250, y: 500, width: 80, height: 20, type: 'desk' },

                // Section 2: Vertical cabinet wall - must climb and face enemy
                { x: 450, y: 490, width: 60, height: 60, type: 'cabinet' },
                { x: 450, y: 430, width: 60, height: 60, type: 'cabinet' },
                { x: 450, y: 370, width: 60, height: 60, type: 'cabinet' },
                { x: 550, y: 450, width: 80, height: 20, type: 'desk' },

                // Section 3: Narrow passage with enemy
                { x: 700, y: 480, width: 100, height: 20, type: 'desk' },
                { x: 850, y: 450, width: 80, height: 20, type: 'desk' },

                // Section 4: Gap forces player to path through enemy
                { x: 1050, y: 480, width: 80, height: 20, type: 'desk' },
                // Gap here - can't skip
                { x: 1300, y: 500, width: 100, height: 20, type: 'desk' },

                // Section 5: Boss area - unavoidable
                { x: 1500, y: 470, width: 80, height: 20, type: 'desk' },
                { x: 1650, y: 440, width: 80, height: 20, type: 'desk' },
                { x: 1800, y: 480, width: 100, height: 20, type: 'desk' },

                // Final approach - boss patrol blocks path
                { x: 2050, y: 500, width: 150, height: 20, type: 'desk' }
            ],
            enemies: [
                // Ground level - unavoidable
                { x: 350, y: 518, type: 'colleague', patrolStart: 280, patrolEnd: 420 },
                // On platform blocking path
                { x: 750, y: 448, type: 'colleague', patrolStart: 700, patrolEnd: 850 },
                // Ground patrol in gap area - must deal with
                { x: 1180, y: 518, type: 'colleague', patrolStart: 1100, patrolEnd: 1280 },
                // Boss patrols final area - completely unavoidable
                { x: 1950, y: 518, type: 'boss', patrolStart: 1850, patrolEnd: 2200 }
            ],
            items: [
                { x: 200, y: 470, type: 'coffee' },
                { x: 560, y: 420, type: 'coffee' },
                { x: 900, y: 420, type: 'folder' },
                { x: 1060, y: 450, type: 'coffee' },
                { x: 1510, y: 440, type: 'folder' },
                { x: 1810, y: 450, type: 'coffee' }
            ],
            exit: { x: 2280, y: 470 }
        };

        return levelData;
    }

    getLevelData2() {
        return {
            name: "The Corridor of Meetings",
            time: "10:23 AM",
            width: 3000,
            platforms: [
                { x: 0, y: 550, width: 3000, height: 50, type: 'floor' },
                { x: 50, y: 480, width: 100, height: 20, type: 'desk' },

                // Section 1: Stair-step up with ground enemy
                { x: 250, y: 500, width: 80, height: 20, type: 'desk' },
                { x: 380, y: 460, width: 80, height: 20, type: 'desk' },
                { x: 510, y: 420, width: 80, height: 20, type: 'desk' },

                // Section 2: Boss on ground - must deal with
                { x: 700, y: 490, width: 100, height: 20, type: 'desk' },
                { x: 850, y: 500, width: 80, height: 20, type: 'desk' },

                // Section 3: Vertical wall barrier
                { x: 1050, y: 490, width: 60, height: 60, type: 'cabinet' },
                { x: 1050, y: 430, width: 60, height: 60, type: 'cabinet' },
                { x: 1050, y: 370, width: 60, height: 60, type: 'cabinet' },
                { x: 1150, y: 450, width: 90, height: 20, type: 'desk' },

                // Section 4: Platform series with enemies blocking
                { x: 1300, y: 490, width: 80, height: 20, type: 'desk' },
                { x: 1450, y: 460, width: 80, height: 20, type: 'desk' },
                { x: 1600, y: 490, width: 80, height: 20, type: 'desk' },

                // Section 5: Double enemy gauntlet
                { x: 1800, y: 500, width: 100, height: 20, type: 'desk' },
                { x: 1950, y: 470, width: 80, height: 20, type: 'desk' },
                { x: 2100, y: 500, width: 100, height: 20, type: 'desk' },

                // Final section - customer rush
                { x: 2300, y: 480, width: 120, height: 20, type: 'desk' },
                { x: 2500, y: 500, width: 150, height: 20, type: 'desk' }
            ],
            enemies: [
                // Ground enemy at start
                { x: 350, y: 518, type: 'colleague', patrolStart: 250, patrolEnd: 480 },
                // Boss blocks middle ground path
                { x: 780, y: 518, type: 'boss', patrolStart: 700, patrolEnd: 950 },
                // Platform blocker
                { x: 1160, y: 418, type: 'colleague', patrolStart: 1150, patrolEnd: 1240 },
                // Ground patrol in platform area
                { x: 1400, y: 518, type: 'colleague', patrolStart: 1300, patrolEnd: 1650 },
                // Double threat area
                { x: 1810, y: 468, type: 'colleague', patrolStart: 1800, patrolEnd: 1900 },
                { x: 2020, y: 518, type: 'boss', patrolStart: 1950, patrolEnd: 2150 },
                // Fast customer at end
                { x: 2400, y: 448, type: 'customer', patrolStart: 2300, patrolEnd: 2650 }
            ],
            items: [
                { x: 260, y: 470, type: 'coffee' },
                { x: 520, y: 390, type: 'plant' },
                { x: 860, y: 470, type: 'coffee' },
                { x: 1160, y: 420, type: 'folder' },
                { x: 1460, y: 430, type: 'coffee' },
                { x: 1810, y: 470, type: 'folder' },
                { x: 2110, y: 470, type: 'coffee' },
                { x: 2310, y: 450, type: 'plant' }
            ],
            exit: { x: 2850, y: 470 }
        };
    }

    getLevelData3() {
        return {
            name: "Conference Room Hell",
            time: "2:15 PM",
            width: 2800,
            platforms: [
                { x: 0, y: 550, width: 2800, height: 50, type: 'floor' },
                { x: 50, y: 480, width: 100, height: 20, type: 'desk' },

                // Section 1: Boss presents on ground - must face
                { x: 200, y: 500, width: 80, height: 20, type: 'desk' },

                // Presentation screen blocks high path
                { x: 400, y: 350, width: 120, height: 80, type: 'cabinet' },
                { x: 400, y: 430, width: 120, height: 120, type: 'cabinet' },

                // Section 2: Long conference table - enemies patrol on it
                { x: 600, y: 450, width: 600, height: 30, type: 'desk' },
                { x: 1250, y: 450, width: 600, height: 30, type: 'desk' },

                // Must drop to ground between tables
                // Gap forces ground combat

                // Section 3: Chair maze after table
                { x: 1950, y: 490, width: 60, height: 20, type: 'desk' },
                { x: 2070, y: 460, width: 60, height: 20, type: 'desk' },
                { x: 2190, y: 490, width: 60, height: 20, type: 'desk' },

                // Final platform before exit
                { x: 2400, y: 500, width: 150, height: 20, type: 'desk' }
            ],
            enemies: [
                // Boss presents - blocks ground path
                { x: 300, y: 518, type: 'boss', patrolStart: 200, patrolEnd: 520 },
                // Colleagues on conference tables - must be dealt with
                { x: 750, y: 418, type: 'colleague', patrolStart: 650, patrolEnd: 1100 },
                { x: 1400, y: 418, type: 'colleague', patrolStart: 1300, patrolEnd: 1800 },
                // Ground enemy in gap - unavoidable
                { x: 1900, y: 518, type: 'colleague', patrolStart: 1850, patrolEnd: 1950 },
                // Customers in chair maze
                { x: 2000, y: 458, type: 'customer', patrolStart: 1950, patrolEnd: 2120 },
                { x: 2240, y: 518, type: 'customer', patrolStart: 2150, patrolEnd: 2400 }
            ],
            items: [
                { x: 210, y: 470, type: 'folder' },
                { x: 800, y: 420, type: 'coffee' },
                { x: 1100, y: 420, type: 'coffee' },
                { x: 1500, y: 420, type: 'folder' },
                { x: 2080, y: 430, type: 'coffee' },
                { x: 2410, y: 470, type: 'plant' }
            ],
            exit: { x: 2700, y: 470 }
        };
    }

    getLevelData4() {
        return {
            name: "The Kitchen Chaos",
            time: "12:37 PM",
            width: 2700,
            platforms: [
                { x: 0, y: 550, width: 2700, height: 50, type: 'floor' },
                { x: 50, y: 480, width: 100, height: 20, type: 'desk' },

                // Section 1: Ground path with enemy, or jump over fridge
                { x: 200, y: 500, width: 60, height: 20, type: 'desk' },
                { x: 320, y: 490, width: 80, height: 60, type: 'cabinet' }, // Fridge (single height)
                { x: 460, y: 470, width: 80, height: 20, type: 'desk' },

                // Section 2: Counter area with ground enemy
                { x: 600, y: 490, width: 100, height: 30, type: 'desk' },
                { x: 750, y: 500, width: 90, height: 20, type: 'desk' },

                // Section 3: Sink and microwave - can go around or over
                { x: 900, y: 500, width: 90, height: 20, type: 'desk' },
                { x: 1050, y: 480, width: 60, height: 40, type: 'cabinet' }, // Microwave
                { x: 1170, y: 500, width: 80, height: 20, type: 'desk' },

                // Section 4: Long dining table with enemy on top - must engage
                { x: 1300, y: 470, width: 500, height: 30, type: 'desk' },

                // Section 5: Counter maze forces platforming
                { x: 1850, y: 490, width: 80, height: 30, type: 'desk' },
                { x: 1980, y: 460, width: 80, height: 30, type: 'desk' },
                { x: 2110, y: 490, width: 80, height: 30, type: 'desk' },

                // Final area - boss blocks ground path
                { x: 2250, y: 500, width: 150, height: 20, type: 'desk' },
                { x: 2450, y: 480, width: 100, height: 20, type: 'desk' }
            ],
            enemies: [
                // Ground colleague before fridge - choose to fight or jump over
                { x: 250, y: 518, type: 'colleague', patrolStart: 200, patrolEnd: 400 },
                // Platform enemy on counter
                { x: 610, y: 458, type: 'colleague', patrolStart: 600, patrolEnd: 760 },
                // Ground enemy before table
                { x: 1220, y: 518, type: 'colleague', patrolStart: 1170, patrolEnd: 1290 },
                // On long table - completely unavoidable
                { x: 1450, y: 438, type: 'colleague', patrolStart: 1350, patrolEnd: 1750 },
                // Customer in platform maze
                { x: 1990, y: 428, type: 'customer', patrolStart: 1980, patrolEnd: 2120 },
                // Boss guards exit on ground - wide patrol
                { x: 2350, y: 518, type: 'boss', patrolStart: 2250, patrolEnd: 2550 }
            ],
            items: [
                { x: 210, y: 470, type: 'coffee' },
                { x: 470, y: 440, type: 'coffee' },
                { x: 760, y: 470, type: 'folder' },
                { x: 1060, y: 450, type: 'coffee' },
                { x: 1450, y: 440, type: 'coffee' },
                { x: 1650, y: 440, type: 'folder' },
                { x: 1990, y: 430, type: 'plant' },
                { x: 2460, y: 450, type: 'coffee' }
            ],
            exit: { x: 2600, y: 450 }
        };
    }

    getLevelData5() {
        return {
            name: "The Exit Strategy",
            time: "5:47 PM",
            width: 3200,
            platforms: [
                { x: 0, y: 550, width: 3200, height: 50, type: 'floor' },
                { x: 50, y: 480, width: 100, height: 20, type: 'desk' },

                // Section 1: Boss desk blocks path completely
                { x: 250, y: 500, width: 80, height: 20, type: 'desk' },
                { x: 380, y: 460, width: 150, height: 40, type: 'desk' }, // Luxury desk

                // Section 2: Bookshelf wall - must climb
                { x: 600, y: 470, width: 100, height: 80, type: 'cabinet' },
                { x: 600, y: 390, width: 100, height: 80, type: 'cabinet' },
                { x: 600, y: 310, width: 100, height: 80, type: 'cabinet' },
                { x: 750, y: 450, width: 80, height: 20, type: 'desk' },

                // Section 3: Ground boss area
                { x: 900, y: 490, width: 100, height: 30, type: 'desk' },
                { x: 1050, y: 500, width: 120, height: 20, type: 'desk' },

                // Section 4: Cabinet maze
                { x: 1250, y: 490, width: 100, height: 60, type: 'cabinet' },
                { x: 1250, y: 430, width: 100, height: 60, type: 'cabinet' },
                { x: 1400, y: 460, width: 80, height: 30, type: 'desk' },
                { x: 1550, y: 490, width: 100, height: 60, type: 'cabinet' },
                { x: 1700, y: 450, width: 90, height: 40, type: 'desk' },

                // Section 5: Executive gauntlet
                { x: 1850, y: 480, width: 120, height: 40, type: 'desk' },
                { x: 2050, y: 500, width: 100, height: 20, type: 'desk' },
                { x: 2220, y: 470, width: 100, height: 50, type: 'desk' },

                // Section 6: Final boss area - wide ground patrol
                { x: 2400, y: 490, width: 150, height: 30, type: 'desk' },
                { x: 2650, y: 500, width: 120, height: 20, type: 'desk' },
                { x: 2850, y: 480, width: 150, height: 40, type: 'desk' }
            ],
            enemies: [
                // First boss on platform - must engage
                { x: 390, y: 428, type: 'boss', patrolStart: 380, patrolEnd: 520 },
                // Ground colleague
                { x: 800, y: 518, type: 'colleague', patrolStart: 750, patrolEnd: 890 },
                // Second boss on ground - unavoidable
                { x: 1100, y: 518, type: 'boss', patrolStart: 1000, patrolEnd: 1230 },
                // Platform customer
                { x: 1410, y: 428, type: 'customer', patrolStart: 1400, patrolEnd: 1480 },
                // Ground colleague in maze
                { x: 1750, y: 518, type: 'colleague', patrolStart: 1700, patrolEnd: 1850 },
                // Third boss on platform
                { x: 1860, y: 448, type: 'boss', patrolStart: 1850, patrolEnd: 1970 },
                // Customer before final boss
                { x: 2230, y: 438, type: 'customer', patrolStart: 2220, patrolEnd: 2350 },
                // FINAL BOSS - guards exit, very wide patrol
                { x: 2700, y: 518, type: 'boss', patrolStart: 2550, patrolEnd: 3000 }
            ],
            items: [
                { x: 260, y: 470, type: 'folder' },
                { x: 610, y: 280, type: 'plant' },
                { x: 760, y: 420, type: 'coffee' },
                { x: 1060, y: 470, type: 'folder' },
                { x: 1410, y: 430, type: 'coffee' },
                { x: 1710, y: 420, type: 'plant' },
                { x: 1860, y: 450, type: 'folder' },
                { x: 2230, y: 440, type: 'coffee' },
                { x: 2660, y: 470, type: 'plant' }
            ],
            exit: { x: 3050, y: 450 }
        };
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // ESC to return to menu
            if (e.key === 'Escape') {
                if (this.gameState !== GAME_STATE.MENU) {
                    this.gameState = GAME_STATE.MENU;
                    this.stateTimer = 0;
                    this.soundManager.stopBackgroundMusic();
                }
            }

            // Throw item
            if (e.key === 'x' || e.key === 'X') {
                if (this.player.heldItem && this.gameState === GAME_STATE.PLAYING) {
                    const item = new Item(
                        this.player.x + (this.player.facingRight ? this.player.width : 0),
                        this.player.y + this.player.height / 2,
                        this.player.heldItem
                    );
                    item.throw(this.player.facingRight ? 1 : -1, this.player.y + this.player.height / 2);
                    this.thrownItems.push(item);
                    this.player.heldItem = null;
                    this.soundManager.playThrow();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Mouse controls for menu
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === GAME_STATE.MENU) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const buttonWidth = 200;
                const buttonHeight = 60;
                const buttonX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
                const buttonY = 220;

                this.menuButtonHover = mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                                       mouseY >= buttonY && mouseY <= buttonY + buttonHeight;

                // Check if hovering over copyright link
                const linkY = CONFIG.CANVAS_HEIGHT - 20;
                const linkX = CONFIG.CANVAS_WIDTH / 2 - 20;
                const linkWidth = 60;
                const linkHeight = 15;
                const linkHover = mouseX >= linkX && mouseX <= linkX + linkWidth &&
                                  mouseY >= linkY - linkHeight && mouseY <= linkY + 5;

                // Change cursor on hover
                this.canvas.style.cursor = (this.menuButtonHover || linkHover) ? 'pointer' : 'default';
            }
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === GAME_STATE.MENU) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const buttonWidth = 200;
                const buttonHeight = 60;
                const buttonX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
                const buttonY = 220;

                // Check Play button click
                if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                    mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
                    // Start game
                    this.gameState = GAME_STATE.INTRO;
                    this.stateTimer = 0;
                    this.currentMessage = "Here we go again.";
                    this.soundManager.startBackgroundMusic(1);
                }

                // Check copyright link click
                const linkY = CONFIG.CANVAS_HEIGHT - 20;
                const linkX = CONFIG.CANVAS_WIDTH / 2 - 20;
                const linkWidth = 60;
                const linkHeight = 15;
                if (mouseX >= linkX && mouseX <= linkX + linkWidth &&
                    mouseY >= linkY - linkHeight && mouseY <= linkY + 5) {
                    window.open('https://www.ctnb.eu', '_blank');
                }
            }
        });
    }

    setupTouchControls() {
        const touchLeft = document.getElementById('touchLeft');
        const touchRight = document.getElementById('touchRight');
        const touchJump = document.getElementById('touchJump');
        const touchThrow = document.getElementById('touchThrow');
        const touchStart = document.getElementById('touchStart');

        // Prevent default touch behaviors
        [touchLeft, touchRight, touchJump, touchThrow, touchStart].forEach(btn => {
            if (btn) {
                btn.addEventListener('touchstart', (e) => e.preventDefault());
                btn.addEventListener('touchend', (e) => e.preventDefault());
                btn.addEventListener('touchmove', (e) => e.preventDefault());
            }
        });

        // Left button
        if (touchLeft) {
            touchLeft.addEventListener('touchstart', () => {
                this.touchKeys['ArrowLeft'] = true;
            });
            touchLeft.addEventListener('touchend', () => {
                this.touchKeys['ArrowLeft'] = false;
            });
        }

        // Right button
        if (touchRight) {
            touchRight.addEventListener('touchstart', () => {
                this.touchKeys['ArrowRight'] = true;
            });
            touchRight.addEventListener('touchend', () => {
                this.touchKeys['ArrowRight'] = false;
            });
        }

        // Jump button
        if (touchJump) {
            touchJump.addEventListener('touchstart', () => {
                this.touchKeys[' '] = true;
            });
            touchJump.addEventListener('touchend', () => {
                this.touchKeys[' '] = false;
            });
        }

        // Throw button
        if (touchThrow) {
            touchThrow.addEventListener('touchstart', () => {
                if (this.player && this.player.heldItem && this.gameState === GAME_STATE.PLAYING) {
                    const item = new Item(
                        this.player.x + (this.player.facingRight ? this.player.width : 0),
                        this.player.y + this.player.height / 2,
                        this.player.heldItem
                    );
                    item.throw(this.player.facingRight ? 1 : -1, this.player.y + this.player.height / 2);
                    this.thrownItems.push(item);
                    this.player.heldItem = null;
                    this.soundManager.playThrow();
                }
            });
        }

        // Start button (for menu)
        if (touchStart) {
            touchStart.addEventListener('touchstart', () => {
                if (this.gameState === GAME_STATE.MENU) {
                    this.gameState = GAME_STATE.INTRO;
                    this.stateTimer = 0;
                    this.currentLevel = 1;
                    this.initLevel(1);
                    this.soundManager.startBackgroundMusic(1);
                }
            });
        }
    }

    update() {
        this.stateTimer++;

        switch (this.gameState) {
            case GAME_STATE.MENU:
                // Menu is handled by mouse events
                break;

            case GAME_STATE.INTRO:
                if (this.stateTimer > 180) { // 3 seconds
                    this.gameState = GAME_STATE.PLAYING;
                    this.stateTimer = 0;
                }
                break;

            case GAME_STATE.PLAYING:
                // Play jump sound
                if (this.player.isJumping && !this.wasJumping) {
                    this.soundManager.playJump();
                }
                this.wasJumping = this.player.isJumping;

                // Merge keyboard and touch inputs
                const combinedKeys = {...this.keys, ...this.touchKeys};
                this.player.update(combinedKeys, this.level.platforms);
                this.level.update();
                this.camera.update(this.player, this.level.width);

                // Update thrown items
                this.thrownItems = this.thrownItems.filter(item => {
                    item.update();

                    // Check collision with enemies
                    for (let enemy of this.level.enemies) {
                        if (item.thrown && enemy.checkCollision(item)) {
                            enemy.active = false;
                            this.soundManager.playHit();
                            return false; // Remove item
                        }
                    }

                    return item.y < CONFIG.CANVAS_HEIGHT + 100;
                });

                // Check item pickup
                for (let item of this.level.items) {
                    if (item.active && !item.thrown && this.player.checkCollision(item)) {
                        if (this.player.pickupItem(item)) {
                            item.active = false;
                            this.soundManager.playPickup();
                        }
                    }
                }

                // Check if enemies enter screen from right and show dialog
                const screenRightEdge = this.camera.x + CONFIG.CANVAS_WIDTH;
                const triggerZone = screenRightEdge - 100; // Zone near right edge

                for (let enemy of this.level.enemies) {
                    // Check if enemy just entered visible area from right
                    if (enemy.active && !enemy.hasShownDialog && enemy.x < screenRightEdge && enemy.x > triggerZone) {
                        this.currentDialog = enemy.dialog;
                        this.dialogTimer = 180; // Show for 3 seconds (60 FPS * 3)
                        enemy.hasShownDialog = true;
                    }

                    // Check collision
                    if (enemy.checkCollision(this.player)) {
                        this.gameState = GAME_STATE.DEATH;
                        this.stateTimer = 0;
                        this.currentMessage = this.deathMessages[Math.floor(Math.random() * this.deathMessages.length)];
                        this.soundManager.playDeath();
                    }
                }

                // Fade out dialog over time
                if (this.dialogTimer > 0) {
                    this.dialogTimer--;
                    if (this.dialogTimer === 0) {
                        this.currentDialog = null;
                    }
                }

                // Check exit
                if (this.level.exit.checkCollision(this.player)) {
                    this.gameState = GAME_STATE.LEVEL_COMPLETE;
                    this.stateTimer = 0;
                    this.soundManager.playLevelComplete();
                }
                break;

            case GAME_STATE.DEATH:
                if (this.stateTimer > 120) { // 2 seconds
                    this.resetLevel();
                }
                break;

            case GAME_STATE.LEVEL_COMPLETE:
                // After 3 seconds, go to next level or game over
                if (this.stateTimer > 180) {
                    if (this.currentLevel < 5) {
                        this.currentLevel++;
                        this.initLevel(this.currentLevel);
                        this.gameState = GAME_STATE.INTRO;
                        this.stateTimer = 0;
                        this.currentMessage = "Here we go again.";
                    } else {
                        // Final level complete - show ending
                        this.gameState = GAME_STATE.GAME_OVER;
                        this.stateTimer = 0;
                    }
                }
                break;

            case GAME_STATE.GAME_OVER:
                // Show final message
                break;
        }
    }

    resetLevel() {
        this.initLevel(this.currentLevel);
        this.gameState = GAME_STATE.INTRO;
        this.stateTimer = 0;
        this.currentMessage = "Here we go again.";
        this.currentDialog = null;
        this.dialogTimer = 0;
    }

    draw() {
        // Update touch button visibility based on game state
        const touchStart = document.getElementById('touchStart');
        const touchLeft = document.getElementById('touchLeft');
        const touchRight = document.getElementById('touchRight');
        const touchJump = document.getElementById('touchJump');
        const touchThrow = document.getElementById('touchThrow');

        if (this.gameState === GAME_STATE.MENU) {
            // Show START button, hide game controls
            if (touchStart) touchStart.classList.add('visible');
            if (touchLeft) touchLeft.style.display = 'none';
            if (touchRight) touchRight.style.display = 'none';
            if (touchJump) touchJump.style.display = 'none';
            if (touchThrow) touchThrow.style.display = 'none';
        } else {
            // Hide START button, show game controls
            if (touchStart) touchStart.classList.remove('visible');
            if (touchLeft) touchLeft.style.display = 'flex';
            if (touchRight) touchRight.style.display = 'flex';
            if (touchJump) touchJump.style.display = 'flex';
            if (touchThrow) touchThrow.style.display = 'flex';
        }

        // Clear canvas
        this.ctx.fillStyle = COLORS.LIGHTEST;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        if (this.gameState === GAME_STATE.MENU) {
            // Main Menu
            this.ctx.fillStyle = COLORS.DARKEST;
            this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

            // Title
            this.ctx.fillStyle = COLORS.LIGHTEST;
            this.ctx.font = 'bold 64px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Text shadow for title
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 4;
            this.ctx.shadowOffsetY = 4;

            this.ctx.fillText('OFFICE ESCAPE', CONFIG.CANVAS_WIDTH / 2, 120);

            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // Play Button
            const buttonWidth = 200;
            const buttonHeight = 60;
            const buttonX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
            const buttonY = 220;

            // Button background
            this.ctx.fillStyle = this.menuButtonHover ? COLORS.LIGHT : COLORS.MEDIUM;
            this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

            // Button border
            this.ctx.strokeStyle = COLORS.LIGHTEST;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

            // Button text
            this.ctx.fillStyle = COLORS.DARKEST;
            this.ctx.font = 'bold 32px monospace';
            this.ctx.fillText('PLAY', CONFIG.CANVAS_WIDTH / 2, buttonY + buttonHeight / 2);

            // Mission text - ironic
            this.ctx.fillStyle = COLORS.BEIGE;
            this.ctx.font = '18px monospace';
            this.ctx.textAlign = 'center';

            const missionY = 420;
            const lineHeight = 28;

            this.ctx.fillText('Your mission:', CONFIG.CANVAS_WIDTH / 2, missionY);
            this.ctx.fillStyle = COLORS.LIGHT;
            this.ctx.font = 'italic 16px monospace';
            this.ctx.fillText('Escape the office without getting trapped', CONFIG.CANVAS_WIDTH / 2, missionY + lineHeight);
            this.ctx.fillText('in pointless conversations about synergy,', CONFIG.CANVAS_WIDTH / 2, missionY + lineHeight * 2);
            this.ctx.fillText('KPIs, and "quick check-ins."', CONFIG.CANVAS_WIDTH / 2, missionY + lineHeight * 3);

            this.ctx.fillStyle = COLORS.ACCENT;
            this.ctx.font = 'italic 14px monospace';
            this.ctx.fillText('(Spoiler: They\'re never quick.)', CONFIG.CANVAS_WIDTH / 2, missionY + lineHeight * 4 + 10);

            // Copyright footer
            this.ctx.fillStyle = COLORS.LIGHT;
            this.ctx.font = '12px monospace';
            this.ctx.fillText('© ', CONFIG.CANVAS_WIDTH / 2 - 35, CONFIG.CANVAS_HEIGHT - 20);

            // Clickable link text
            this.ctx.fillStyle = COLORS.ACCENT;
            this.ctx.fillText('ctnb.eu', CONFIG.CANVAS_WIDTH / 2 + 5, CONFIG.CANVAS_HEIGHT - 20);

        } else if (this.gameState === GAME_STATE.PLAYING) {
            // Draw game
            this.level.draw(this.ctx, this.camera);
            this.player.draw(this.ctx, this.camera);

            // Draw thrown items
            this.thrownItems.forEach(item => item.draw(this.ctx, this.camera));

            // Draw dialog in upper half of screen - VERY LARGE with high contrast
            if (this.currentDialog) {
                const dialogText = `"${this.currentDialog}"`;

                // Measure text to ensure it fits
                this.ctx.font = 'bold 48px monospace';
                let textWidth = this.ctx.measureText(dialogText).width;

                // Scale down font if text is too wide
                let fontSize = 48;
                const maxWidth = CONFIG.CANVAS_WIDTH - 100; // Padding on sides
                while (textWidth > maxWidth && fontSize > 20) {
                    fontSize -= 2;
                    this.ctx.font = `bold ${fontSize}px monospace`;
                    textWidth = this.ctx.measureText(dialogText).width;
                }

                // Draw semi-transparent dark background for readability
                const yPosition = CONFIG.CANVAS_HEIGHT / 4;
                const padding = 20;
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, yPosition - fontSize / 2 - padding, CONFIG.CANVAS_WIDTH, fontSize + padding * 2);

                // Style with high contrast for readability
                this.ctx.fillStyle = '#FFFFFF'; // Pure white for maximum contrast
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';

                // Strong dark shadow for readability on any background
                this.ctx.shadowColor = 'rgba(0, 0, 0, 1.0)';
                this.ctx.shadowBlur = 25;
                this.ctx.shadowOffsetX = 5;
                this.ctx.shadowOffsetY = 5;

                this.ctx.fillText(dialogText, CONFIG.CANVAS_WIDTH / 2, yPosition);

                // Reset shadow
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }

        } else if (this.gameState === GAME_STATE.INTRO || this.gameState === GAME_STATE.DEATH) {
            // Draw background
            this.ctx.fillStyle = COLORS.DARKEST;
            this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

            // Draw message
            this.ctx.fillStyle = COLORS.LIGHTEST;
            this.ctx.font = 'bold 36px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.currentMessage, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);

            if (this.gameState === GAME_STATE.INTRO && this.stateTimer > 120) {
                this.ctx.font = '20px monospace';
                this.ctx.fillText(`Level ${this.currentLevel}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 50);
                this.ctx.fillText(this.level.name, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 80);
                this.ctx.fillText(this.level.time, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 110);
            }
        } else if (this.gameState === GAME_STATE.LEVEL_COMPLETE) {
            this.ctx.fillStyle = COLORS.DARKEST;
            this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

            this.ctx.fillStyle = COLORS.LIGHTEST;
            this.ctx.font = 'bold 48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LEVEL COMPLETE!', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);

            this.ctx.font = '24px monospace';
            if (this.currentLevel < 5) {
                this.ctx.fillText('One down...', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 60);
            } else {
                this.ctx.fillText('Almost out...', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 60);
            }
        } else if (this.gameState === GAME_STATE.GAME_OVER) {
            this.ctx.fillStyle = COLORS.DARKEST;
            this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

            this.ctx.fillStyle = COLORS.LIGHTEST;
            this.ctx.font = 'bold 60px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('FREEDOM!', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 40);

            this.ctx.font = '20px monospace';
            this.ctx.fillStyle = COLORS.MEDIUM;
            this.ctx.fillText('See you tomorrow.', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 40);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
});

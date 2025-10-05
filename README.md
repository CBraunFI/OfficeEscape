# Office Escape

A cinematic 2D platformer with Film Noir aesthetics, where a burned-out office employee navigates through shadowy corridors and tries to reach the exit without getting caught in endless conversations with the boss, colleagues, and customers.

## Game Concept

Experience the absurd reality of office life as a dramatic platformer with cinematic lighting, atmospheric shadows, and darkly humorous dialogue. Inspired by classic film noir and office horror aesthetics.

## Features

### Core Mechanics
- **Movement**: Arrow keys (← / →)
- **Jump**: Spacebar or ↑ (variable height based on button hold)
- **Duck**: ↓ (static, no movement)
- **Throw Item**: X key

### Level 1: The Cubicle Maze
- Navigate through an open office
- Avoid 3-4 colleagues and 1 boss
- Collect and throw coffee mugs and folders to eliminate enemies
- Reach the EXIT door to complete the level

### Enemy Types
- **Boss**: Slow, commanding presence with dialogs like "We need to talk!" and "Performance review time!"
- **Colleagues**: Medium speed with phrases like "Quick check-in?" and "Did you get my email?"
- **Customers**: Fast, erratic movement with urgent demands

### Items
- **Coffee Mug**: Most common, medium throw range
- **Folder**: Medium frequency, large hitbox
- **Plant**: Rare, long range with arc

### Visual Style - Film Noir Aesthetic
- **Cinematic Office Color Palette**:
  - `#1a1a1a` - Deep shadows and darkness
  - `#3d3020` - Dark office tones
  - `#5a4a3a` - Medium browns
  - `#8b7355` - Light wood/desk tones
  - `#c4b5a0` - Wall/light surfaces
  - `#e8dcc8` - Highlights and lights
  - `#2a2420` / `#d4c4b0` - Checkered floor tiles

- **Atmospheric Effects**:
  - Dramatic overhead lighting with radial gradients
  - Long character shadows cast on checkered floors
  - Dark vignette effect for cinematic framing
  - Parallax background layers with distant windows
  - Film grain texture overlay

- **Character Details**:
  - Detailed pixel sprites with clothing textures
  - Boss in dark suit with briefcase
  - Colleagues with coffee cups and tired expressions
  - Customers with stressed, gesturing poses
  - Protagonist with visible exhaustion

- **Environment**:
  - Wood-grain desks with visible legs and shadows
  - Metal filing cabinets with drawer details
  - Checkered floor pattern (inspired by reference images)
  - Detailed exit door with illuminated sign
  - Office items with realistic materials (coffee, folders, plants)

- Side-scrolling camera with smooth follow

### Sound & Music
- **Background Music**: Dark, atmospheric Film Noir soundtrack with:
  - Haunting minor chord progression (A minor)
  - Melancholic melody line
  - Ambient pad for atmospheric depth
  - Looping bass line for tension

- **Sound Effects**:
  - Jump, throw, hit, pickup sounds
  - Death sound when caught by enemy
  - Victory jingle on level complete
  - All generated using Web Audio API oscillators

### Dialog System
- **No Speech Bubbles**: Enemy dialogs appear as **VERY LARGE, centered text** on screen
- **Cinematic Presentation**:
  - 64px bold monospace font in bright color (#e8dcc8)
  - Positioned in upper quarter of screen
  - Semi-transparent dark overlay on top portion
  - Dramatic shadow effect (30px blur, offset)
  - Smooth fade-in animation
- **Entry Trigger**: Dialogs appear when enemies enter from the right side of screen
- **Display Duration**: 3 seconds per dialog
- **Examples**: "We need to talk!", "Quick check-in?", "This is URGENT!"

## How to Play

1. Open `index.html` in a modern web browser
2. Wait for the intro message "Here we go again."
3. Navigate to the exit while avoiding enemies
4. Pick up items by walking into them
5. Throw items at enemies to eliminate them
6. If caught by an enemy, the level resets

### Death Messages (random on reset)
- "Not again..."
- "*Sigh*"
- "Why me?"
- "I need a vacation."
- "Maybe tomorrow..."
- And more!

## Technical Implementation

- **Platform**: HTML5 Canvas
- **Framework**: Vanilla JavaScript
- **Physics**: Custom gravity and box collision system
- **Audio**: Web Audio API with oscillator-based sound effects

### Project Structure
```
Office_Escape/
├── index.html          # Main game page
├── game.js            # Game engine and logic
├── sounds.js          # Sound effects manager
├── Office_Escape_Spec.txt  # Complete game specification
└── README.md          # This file
```

## Game States

- **INTRO**: Shows "Here we go again." and level info
- **PLAYING**: Active gameplay
- **DEATH**: Shows death message and resets level
- **LEVEL_COMPLETE**: Victory screen

## Development Status

### MVP Complete ✅
- Player movement, jumping, ducking
- Enemy AI with patrol patterns
- Item throwing mechanics
- Level 1 fully playable
- Dialog system with speech bubbles
- Scrolling camera
- Game Boy color palette
- Basic sound effects

### Future Plans
- Levels 2-5 implementation
- More enemy types (Intern, HR)
- Additional items (Stapler, Keyboard)
- Power-ups system
- Statistics and achievements
- Level editor

## Credits

Based on the complete game design specification in `Office_Escape_Spec.txt`

Developed using HTML5, Canvas API, and Web Audio API

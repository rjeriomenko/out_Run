//This will handle all frame game logic, including updating and rendering the map between every frame
//This will update the map as more entities are created or destroyed
//This will allow the user to change maps
//When an entity is created, it will be given an absolute pos and (optionally) be given a subclass with subclass properties and added to the current map
//When an entity is destroyed, it will be removed from the current map
console.log("game.js started loading");
import Map from './map.js';
import Render from './render.js';
import Camera from './camera.js';
import Player from './entities/player.js';
import FrameQueue from './frame-queue.js';
import EventHandler from './event-handler.js';

export default class Game {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.eventHandler = new EventHandler(this); // create evenHandler, which will load main menu map with main menu "player"
        this.frameQueue = new FrameQueue;
        this.frameTimer = setInterval(() => { this.update() }, (1000/60)); // update every frame at 60 frames per second -- Can be replaced with window.requestAnimationFrame()
        this.addEventListeners()
    };

    loadMap(playerName, playerColor, playerAbility, seed = "mainmenu", player = "mainmenu") {
        if (this.frameQueue) { this.frameQueue.clearQueue() }
        this.map = new Map(seed);
        this.player = new Player(this.map, player, playerName, playerColor, playerAbility);
        this.camera = new Camera(this.ctx, this.canvas, this.map, this.player);
        this.map.addPlayerAndCamera(this.player, this.camera);
    };

    addEventListeners() {
        window.addEventListener('keydown', (e) => { this.eventHandler.moveKey(e) }, false); // allow eventHandler to handle kebyoard input
        window.addEventListener('keyup', (e) => { this.eventHandler.removeKey(e) }, false); // make repeat player movement browser-agnostic
        this.addMainMenuListeners();
        this.addPauseMenuListeners();
    }

    addMainMenuListeners() {
        let mainmenu = document.querySelector('.')

    }

    addPauseMenuListeners() {

    }

    newPauseFrameTimer() {
        this.frameTimer = setInterval(() => { this.updateWhilePaused() }, (1000 / 60));
    }

    updateWhilePaused() {
        this.frameQueue.frameQueueExecute();
        this.drawFrame(this.ctx, this.canvas, this.map);
    }

    restoreFrameQueueAndFrameTimer(restoreQueue) {
        this.frameQueue = new FrameQueue(restoreQueue);
        this.frameTimer = setInterval(() => { this.update() }, (1000 / 60));
    }

    update() {
        this.logicStep(); // update camera, all positions, statuses, etc
        this.drawFrame(this.ctx, this.canvas, this.map); // draw everything on the map
        console.log("frame passed");
    };

    spawnEnemies() {
        this.map.entitySpawner.spawnEnemies();
    }

    activateAbilities() {
        for(const ability in this.player.abilities) {
            let abt = this.player.abilities[ability]
            this.frameQueue.push(() => { abt.activate() });
        };
    }
    
    moveEnemies() {
        for(const entity in this.map.entities) {
            let ent = this.map.entities[entity];
            if(ent.enemyType) {
                this.frameQueue.push(() => { ent.move() });
            };
        };
    };
    
    moveProjectiles() {
        for (const entity in this.map.entities) {
            let ent = this.map.entities[entity];
            if (ent.projectileType) {
                this.frameQueue.push(() => { ent.move() });
            };
        };
    }

    applyProjectileDamage() { // iterates through player and enemy projectiles. All close range attacks are also projectiles
        for (const entity in this.map.entities) {
            let ent = this.map.entities[entity];
            if (ent.projectileType) {
                this.frameQueue.push(() => { ent.doDamage() });
            };
        };
    };

    applyEnemyCollision() {
        for (const entity in this.map.entities) {
            let ent = this.map.entities[entity];
            if (ent.enemyType) {
                this.frameQueue.push(() => { ent.playerCollision() });
            };
        };
    };

    applyDeath() {
        for (const entity in this.map.entities) {
            let ent = this.map.entities[entity];
            if (typeof ent.health === "number" && ent.health <= 0) {
                this.frameQueue.push(() => { ent.onDeath() });
            };
        };
    };

    inflictDamage() {
        this.applyProjectileDamage();
        this.applyEnemyCollision();
        this.applyDeath();
    };

    logicStep() {
        this.spawnEnemies();
        this.activateAbilities();
        this.moveEnemies();
        this.moveProjectiles();
        this.inflictDamage();
        this.frameQueue.frameQueueExecute();
        this.camera.followEntity(); // update camera to new follow coordinates
    };

    drawFrame() {
        new Render(this.ctx, this.canvas, this.map, this.camera);
    };
}


console.log("game.js finished loading");
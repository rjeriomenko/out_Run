console.log("event-handler.js started loading");
import KeyboardWords from './keyboard-words.json';

export default class EventHandler {
    constructor(game) {
        this.game = game;
        this.events = [];
        this.triggerEvent();
    };

    triggerEvent(event = "mainmenu") {
        switch(event) {
            case "mainmenu":
                this.mainMenu()
                break;
            case "pause":
                this.pause()
                break;
            case "play":
                this.loadMap("test");
                break;
            case "enter":
                //Enter logic
                break;
            case "instructions":
                //Instructions logic
                break;
            case "gameover":
                //GameOver logic
                break;
        };
    };

    addEventListeners() {
        window.addEventListener('keydown', (e) => { this.moveKey(e) }, false); // allow eventHandler to handle kebyoard input
        window.addEventListener('keyup', (e) => { this.removeKey(e) }, false); // make repeat player movement browser-agnostic
        this.addMainMenuListeners();
        this.addPauseMenuListeners();
    }

    addMainMenuListeners() {
        let mainMenu = document.querySelector("#main-menu-list");
        mainMenu.addEventListener('click', (e) => { this.triggerEvent(e.target.dataset.trigger) });
    }

    addPauseMenuListeners() {
        let pauseMenu = document.querySelector("#pause-menu-list");
        pauseMenu.addEventListener('click', (e) => { this.triggerEvent(e.target.dataset.trigger) });
    }

    addEvent(event) {
        this.events.push(event);
    }

    emptyEvents() {
        return this.events.length === 0;
    }

    clearEvent(event) {
        let eventIndex = this.events.indexOf(event);
        if(eventIndex > -1) {
            this.events.splice(eventIndex);
        };
    };

    clearEvents() {
        this.events = [];
    }
    
    checkEvent(event) {
        return this.events.includes(event);
    }

    showNode(node) {
        let Node = document.querySelector(node);
        Node.style.visibility = "visible"
    }

    hideNode(node) {
        let Node = document.querySelector(node);
        Node.style.visibility = "hidden"
    }

    showViewBorder() {
        let view = document.querySelector("#view");
        view.style.border = "double 6px rgb(150, 150, 150)";
    }

    hideViewBorder() {
        let view = document.querySelector("#view");
        view.style.border = "none";

    }
    
    loadMap(map = "test") { //LIKELY TO CHANGE TO LOAD MAP EVENT
        if (this.checkEvent("pause")) {
            this.pause()
        }
        this.clearEvents();
        this.game.loadMap("John", "orange", "missile", map, "default");
        this.hideNode(".main-menu");
        this.hideNode(".pause-menu");
        this.showViewBorder();
    }
    
    mainMenu() {
        // this.game.frameQueue.clearQueue()
        if (this.checkEvent("pause")) {
            this.pause()
        }
        this.clearEvents();
        this.game.loadMap("menuplayer", "pink", "mainmenuability");
        this.game.camera.followNewEntity(this.game.map.entities[1]);
        this.addEvent("mainmenu");
        this.showNode(".main-menu");
        this.hideViewBorder();
    };

    restoreFrameQueueAndFrameTimer() {
        clearInterval(this.game.frameTimer);
        this.game.restoreFrameQueueAndFrameTimer([this.storedQueue, this.storedEveryQueue]);
    };

    storeFrameQueueAndFrameTimer() {
        clearInterval(this.game.frameTimer);
        this.storedQueue = this.game.frameQueue.queue;
        this.storedEveryQueue = this.game.frameQueue.everyQueue;
        this.game.frameQueue.clearQueue();
    };
    
    pause() { // clears setInterval and pauses the game
        if (this.checkEvent("pause")) {
            this.restoreFrameQueueAndFrameTimer();
            this.clearEvent("pause");
            this.hideNode(".pause-menu");

        } else if (this.emptyEvents()) {
            this.storeFrameQueueAndFrameTimer();
            this.game.newPauseFrameTimer(); // allows for setInterval to resume without updating the game
            this.addEvent("pause");
            this.showNode(".pause-menu");
        }
    }

    move(direction) {
        if (this.emptyEvents()) {
            this.game.player.move(direction);
        };
    };

    moveKey(e) {
        let k = e.key;
        switch (k) {
            case "ArrowUp":
            case "w":
                if (!e.repeat) {
                    this.game.frameQueue.everyQueuePush(`${KeyboardWords[k]}`, () => { this.move([0, -1]) });
                }
                break;
            case "ArrowRight":
            case "d":
                if (!e.repeat) {
                    this.game.frameQueue.everyQueuePush(`${KeyboardWords[k]}`, () => { this.move([1, 0]) });
                }
                break;
            case "ArrowDown":
            case "s":
                if (!e.repeat) {
                    this.game.frameQueue.everyQueuePush(`${KeyboardWords[k]}`, () => { this.move([0, 1]) });
                }
                break;
            case "ArrowLeft":
            case "a":
                if (!e.repeat) {
                    this.game.frameQueue.everyQueuePush(`${KeyboardWords[k]}`, () => { this.move([-1, 0]) });
                }
                break;
            case "Escape":
            case "p":
                if (!e.repeat) {
                    this.game.frameQueue.push(() => { this.triggerEvent("pause") });
                }
                break;
            case "Enter":
            case " ":
                if (!e.repeat) {
                    this.game.frameQueue.push(() => { this.triggerEvent("play") });
                }
                break;
        }
    }

    removeKey(e) {
        let k = e.key;
        this.game.frameQueue.everyQueueDel(`${KeyboardWords[k]}`);
    };
}
console.log("event-handler.js finished loading");
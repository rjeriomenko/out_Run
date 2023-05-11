console.log("missile.js started loading");
import Ability from './ability.js';
import Explosion from '../entities/explosion.js';

export default class AttackExplosion extends Ability {
    constructor(player) {
        super(player);
        this.duration = 6;
        this.explosionCount = 0;
        this.dimension = [70, 70]
    }

    updateStats() {
        this.damage = this.entity.damage / 15;
        if (this.entity.id === "player") {
            this.friendly = true;
        } else {
            this.friendly = false;
        }
    }

    randomSign() {
        if (Math.random() > 0.5) {
            return -1;
        } else {
            return 1;
        };
    };

    offsetFireCoords(fireCoords) {
        let offsetX = fireCoords[0] + (Math.random() * 5 * this.randomSign());
        let offsetY = fireCoords[1] + (Math.random() * 5 * this.randomSign());

        return [offsetX, offsetY];
    }

    activate(sourceEntity, targetEntity) {
        this.updateStats();
        this.explosionCount++;
        let offsetFireCoords = this.offsetFireCoords(sourceEntity.findEntityCenterCoords(targetEntity))
        let explosionProperties = {
            "damage": this.damage,
            "friendly": this.friendly,
            "duration": this.duration,
            "absolutepositionx": offsetFireCoords[0],
            "absolutepositiony": offsetFireCoords[1],
            "dimension": [this.dimension[0], this.dimension[1]]
        }
        
        let explosion = new Explosion(`${sourceEntity.name}-explosion${this.explosionCount}`, explosionProperties);

        this.entity.map.addEntity(explosion);
    }
}
console.log("missile.js finished loading");
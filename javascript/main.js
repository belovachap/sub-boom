var gamejs = require('gamejs');

var DISPLAY_WIDTH = 640;
var DISPLAY_HEIGHT = 480;

// Destroyer object
// Inherits from gamejs.sprite.Sprite
var Destroyer = function(rect) {
    // call superconstructor
    Destroyer.superConstructor.apply(this, arguments);
    this.speed = 50;
    this.rect = new gamejs.Rect(rect);
    return this;
};
gamejs.utils.objects.extend(Destroyer, gamejs.sprite.Sprite);

Destroyer.prototype.draw = function(surface) {
    gamejs.draw.rect(surface, '#000', this.rect, 0);
}

// Submarine object
// Inherits from gamejs.sprite.Sprite
var Submarine = function(rect, speed) {
    // call superconstructor
    Submarine.superConstructor.apply(this, arguments);
    this.speed = speed;
    this.rect = new gamejs.Rect(rect);
    return this;
};
gamejs.utils.objects.extend(Submarine, gamejs.sprite.Sprite);

Submarine.prototype.draw = function(surface) {
    gamejs.draw.rect(surface, '#F00', this.rect, 0);
}

Submarine.prototype.update = function(sDuration) {
    x_delta = this.speed * sDuration;
    this.rect.moveIp(x_delta, 0);
    
    // Determine if the submarine has gone off the screen
    if (this.speed > 0) {
        // Check if the left side of the submarine is beyond DISPLAY_WIDTH
        if (this.rect.left >= DISPLAY_WIDTH) {
            this.rect.right = 0;
        }   
    } else {
        // Check if the right side of the submarine is beyond 0
        if (this.rect.right <= 0) {
            this.rect.left = DISPLAY_WIDTH;
        }   
    }
}

// High level game objects
var destroyer = new Destroyer(new gamejs.Rect([50, 50], [100, 20]));

var subs = []
subs.push(new Submarine(new gamejs.Rect([100, 100], [50, 20]), -20));
subs.push(new Submarine(new gamejs.Rect([0, 200], [50, 20]), 20));
subs.push(new Submarine(new gamejs.Rect([400, 150], [50, 20]), 50));

// Event handling
function handle_events(msDuration) {
        // Get the last events...
        sDuration = msDuration / 1000;
        gamejs.event.get().forEach(function(event) {
            if (event.type === gamejs.event.KEY_DOWN) {
                if (event.key === gamejs.event.K_LEFT) {
                    destroyer.rect.moveIp(-1 * destroyer.speed * sDuration, 0);
                } else if (event.key === gamejs.event.K_RIGHT) {
                    destroyer.rect.moveIp(destroyer.speed * sDuration, 0);
                }
            }
        });
    }

function main() {

    var display = gamejs.display.setMode([DISPLAY_WIDTH, DISPLAY_HEIGHT]);
    
    var tick = function(msDuration) {
        // game loop
        display.clear();
        handle_events(msDuration);
        for (sub in subs) {
            subs[sub].update(msDuration / 1000);
            subs[sub].draw(display);
        }
        
        destroyer.draw(display);
        return;
    };
    gamejs.time.fpsCallback(tick, this, 30);

}


gamejs.ready(main);

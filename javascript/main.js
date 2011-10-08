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

// Missle object
// Inherits from gamejs.sprite.Sprite
var Missle = function(rect, direction) {
    // @param(direction) a array of two that represents speed vector 
    // call superconstructor
    Missle.superConstructor.apply(this, arguments);
    this.speed = 50;
    this.direction = direction;
    this.rect = new gamejs.Rect(rect);
    return this;
};
gamejs.utils.objects.extend(Missle, gamejs.sprite.Sprite);

Missle.prototype.draw = function(surface) {
    gamejs.draw.rect(surface, '#0F0', this.rect, 0);
}

Missle.prototype.update = function(sDuration) {
    v_delta = gamejs.utils.vectors.multiply(this.direction, sDuration);
    this.rect.moveIp(v_delta[0], v_delta[1]);
}

// Explosion object
// Inherits from gamejs.sprite.Sprite
var Explosion = function(center, min_radius, max_radius, duration) {
    // @param(center) a point represented as an array
    // @param(min_radius) starting radius of explosion 
    // @param(max_radius) end radius of explosion 
    // @param(duration) seconds to transition from min_radius to max_radius 
    // call superconstructor
    Explosion.superConstructor.apply(this, arguments);
    this.center = center;
    this.min_radius = min_radius;
    this.max_radius = max_radius;
    this.duration = duration;
    this.rgba_color = "rgba(255, 153, 51, 1)";
    this.radius = min_radius;
    this.elapsed_time = 0;
    return this;
}
gamejs.utils.objects.extend(Explosion, gamejs.sprite.Sprite);

Explosion.prototype.draw = function(surface) { 
    gamejs.draw.circle(surface, this.rgba_color, this.center, this.radius);
};

Explosion.prototype.update = function(sDuration) {
    this.elapsed_time += sDuration;
    var tween = Math.min((this.elapsed_time / this.duration), 1);
    var alpha = 1 - tween;

    this.radius = this.min_radius * (1 - tween) + this.max_radius * tween;
    this.rgba_color = "rgba(255, 153, 51, " + alpha + ")";
};

Explosion.prototype.finished = function() {
    // @(returns) A boolean indicating if the explosion has run its course
    return (this.elapsed_time >= this.duration);
};

// High level game objects
var destroyer = new Destroyer(new gamejs.Rect([50, 50], [100, 20]));

var subs = new gamejs.sprite.Group();
subs.add(new Submarine(new gamejs.Rect([100, 100], [50, 20]), -20));
subs.add(new Submarine(new gamejs.Rect([0, 200], [50, 20]), 20));
subs.add(new Submarine(new gamejs.Rect([400, 150], [50, 20]), 50));

var missles = new gamejs.sprite.Group();
missles.add(new Missle(new gamejs.Rect([400, 400], [10, 10]), [-20, -20]));

var explosions = new gamejs.sprite.Group();
explosions.add(new Explosion([200, 200], 10, 100, 5));
explosions.add(new Explosion([300, 200], 10, 50, 2));

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
        
        // Draw the background
        display.clear();
        gamejs.draw.rect(display, "rgba(0,0, 255, .1)", new gamejs.Rect([0, 70], [DISPLAY_WIDTH, DISPLAY_HEIGHT]));
        
        handle_events(msDuration);

        var sDuration = msDuration / 1000;

        // Update explosions. Check for collision with subs, missles and destroyer.
        // TODO: collision detection
        explosions.update(sDuration);
        var finished_explosions = [];
        explosions.forEach(function(explosion) {
            if (explosion.finished()) {
                finished_explosions.push(explosion);
            }
        });
        explosions.remove(finished_explosions);

        subs.update(sDuration);
        subs.draw(display);

        missles.update(sDuration);

        // Check for missles that have hit the surface of the water
        var hit_surface = []; 
        missles.forEach(function(missle) {
            // Determine if missle has hit the surface.
            if (missle.rect.top <= 70) {
                 hit_surface.push(missle);
            }
        });

        // Create explosions for these surfaced missles
        // TODO

        // Remove exploded missles
        missles.remove(hit_surface);

        missles.draw(display);

        destroyer.draw(display);

        // Is this the best place to be drawing the explosions?
        // Might need to think about this some more; we do pick up more explosions
        // in the mid-section of the code...
        explosions.draw(display);
        return;
    };
    gamejs.time.fpsCallback(tick, this, 30);

}


gamejs.ready(main);

var gamejs = require('gamejs');

var DISPLAY_DEBUG = true;
var DISPLAY_DEBUG_COLOR = "#ff0000";
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
    this.last_missile_time = 0;
    this.reload_time = 10 + Math.random() * 5;
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

    // Handle missile firing
    this.last_missile_time += sDuration;
    if (this.last_missile_time >= this.reload_time) {
        this.fire_missile();
    }
}

Submarine.prototype.fire_missile = function () {
    this.last_missile_time = 0;
    var x_direction = (Math.random() - .5) * 40;
    missles.add(new Missle(new gamejs.Rect(this.rect.center, [10, 10]), [x_direction , -40]));
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

// Bomb object
// Inherits from gamejs.sprite.Sprite
var Bomb = function(center, drop_time) {
    // call superconstructor
    Bomb.superConstructor.apply(this, arguments);
    this.speed = 20;
    this.drop_time = drop_time;
    this.elapsed_time = 0;
    this.center = center;
    return this;
};
gamejs.utils.objects.extend(Bomb, gamejs.sprite.Sprite);

Bomb.prototype.draw = function(surface) {
    gamejs.draw.circle(surface, '#000', this.center, 10, 0);
}

Bomb.prototype.update = function(sDuration) {
    this.elapsed_time += sDuration;

    y_delta = this.speed * sDuration;
    this.center[1] += y_delta;
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
    this.set_radius(min_radius);
    this.elapsed_time = 0;
    //console.info('new explosion:', this);
    return this;
}
gamejs.utils.objects.extend(Explosion, gamejs.sprite.Sprite);

Explosion.prototype.set_radius = function(r) {
    // Set the new radius
    this.radius = r;

    // Update the bounding rect
    var left = this.center[0] - this.radius;
    var top = this.center[1] - this.radius;
    var width = 2 * this.radius;
    var height = width;
    this.rect = new gamejs.Rect(left, top, width, height);

}

Explosion.prototype.draw = function(surface) { 
    gamejs.draw.circle(surface, this.rgba_color, this.center, this.radius);
    
    if (DISPLAY_DEBUG) {
        gamejs.draw.rect(surface, DISPLAY_DEBUG_COLOR, this.rect, 2);
    }
};

Explosion.prototype.update = function(sDuration) {
    this.elapsed_time += sDuration;
    var tween = Math.min((this.elapsed_time / this.duration), 1);
    var alpha = 1 - tween;

    this.set_radius(this.min_radius * (1 - tween) + this.max_radius * tween);
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

var bombs = new gamejs.sprite.Group();

var explosions = new gamejs.sprite.Group();

// Event handling
var handle_events = (function() {
    var space_bar_down = false;
    var space_bar_down_time;

    return function (msDuration) {
        // Get the last events...
        sDuration = msDuration / 1000;
        gamejs.event.get().forEach(function(event) {
            if (event.type === gamejs.event.KEY_DOWN) {
                if (event.key === gamejs.event.K_LEFT) {
                    destroyer.rect.moveIp(-1 * destroyer.speed * sDuration, 0);
                } 
                else if (event.key === gamejs.event.K_RIGHT) {
                    destroyer.rect.moveIp(destroyer.speed * sDuration, 0);
                }
		else if (event.key === gamejs.event.K_SPACE && !space_bar_down) {
                    space_bar_down = true;
                    space_bar_down_time = new Date();
                }
            }
            else if (event.type === gamejs.event.KEY_UP) {
                if (event.key === gamejs.event.K_SPACE && space_bar_down) {
                    var now = new Date();
                    var depth_time = 1 + (now.getTime() - space_bar_down_time.getTime()) / 1000;
                    bombs.add(new Bomb(destroyer.rect.center, depth_time)); 

                    space_bar_down = false;
                }
            }
        });
    }
})();

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

        // Get explosions that are close to subs
        var dead_subs = [];
        gamejs.sprite.groupCollide(subs, explosions).forEach(function (collision) {
            var hit_sub = collision.a;
            var hit_explosion = collision.b;
            // Do processing here!
            // TODO better collision detection
            console.info('sub: ', hit_sub, 'explosion: ', hit_explosion);
            // Remove the sub from the sub list
            dead_subs.push(hit_sub);
            // Replace it with an explosion
            explosions.add(new Explosion(hit_sub.rect.center, 10, 30, 1));
        });
        subs.remove(dead_subs);

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
            // Determine if missle has hit the surface, create explosion if it has.
            if (missle.rect.top <= 70) {
                 hit_surface.push(missle);
                 explosions.add(new Explosion(missle.rect.center, 10, 30, 1));
            }
        });


        var remove_bombs = [];
        bombs.forEach(function(bomb) {
            if (bomb.elapsed_time > bomb.drop_time) {
               remove_bombs.push(bomb);
               explosions.add(new Explosion(bomb.center, 10, 50, 2)); 
            }
        });

        bombs.remove(remove_bombs);

        bombs.update(sDuration);
        bombs.draw(display);

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

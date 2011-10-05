var gamejs = require('gamejs');

// $gamejs.preload([]);

gamejs.ready(function() {

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

    var display = gamejs.display.setMode([600, 480]);

    var Ship = function(rect) {
        // call superconstructor
        Ship.superConstructor.apply(this, arguments);
        this.speed = 50;
        this.rect = new gamejs.Rect(rect);
        return this;
    };
    
    // inherit (actually: set prototype)
    gamejs.utils.objects.extend(Ship, gamejs.sprite.Sprite);
    
    Ship.prototype.draw = function(surface) {
        gamejs.draw.rect(surface, '#000', this.rect, 0);
    }
    
    var destroyer = new Ship(new gamejs.Rect([50, 50], [100, 20]));
    
    
    
    function tick(msDuration) {
        // game loop
        display.clear();
        handle_events(msDuration);
        destroyer.draw(display);
        return;
    };
    gamejs.time.fpsCallback(tick, this, 30);
});

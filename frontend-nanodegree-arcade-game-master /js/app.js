// Enemies our player must avoid
var Enemy = function(VALUE_x, VALUE_y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.VALUE_y = VALUE_y;
    this.VALUE_x = VALUE_x;
    this.speed = speed;
	this.sprite = 'images/enemy-bug.png';
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.VALUE_x += dt * this.speed;
    if (this.VALUE_x >= 500) {
        this.VALUE_x = 0;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.VALUE_x, this.VALUE_y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(VALUE_x, VALUE_y, speed) {
    this.VALUE_y = VALUE_y;
    this.VALUE_x = VALUE_x;
    this.speed = speed;
    this.sprite = 'images/char-boy.png';
};

Player.prototype.update = function(anEnemy) {
    player.checkCollision();
};

// Draw the player on the screen, required method for game and display score
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.VALUE_x, this.VALUE_y);
    ScoreLevel(score, Level);

};

Player.prototype.handleInput = function(keyPress) {
    var allowedMoves = {
        left: function(){
            this.VALUE_x -= 100;
        }.bind(this),
        right: function() {
            this.VALUE_x += 100;
        }.bind(this),
        up: function() {
            this.VALUE_y -= 85;
        }.bind(this),
        down: function() {
            this.VALUE_y += 85;
        }.bind(this)
    };
    return allowedMoves[keyPress]();
};

// ScoreLevel is function to display player's score
var ScoreLevel = function(aScore, aLevel) {
    var canvas = document.getElementsByTagName('canvas');
    var firstCanvasTag = canvas[0];

    // add player score and level to div element created
    scoreLevelDiv.innerHTML = 'Score: ' + aScore 
    + ' / ' + 'Level: ' + aLevel;
    document.body.insertBefore(scoreLevelDiv, firstCanvasTag[0]);
};

// CheckCollision between enemy & player
Player.prototype.checkCollision = function() {
    
    for (var i=0; i< allEnemies.length; i++){
    if (
        this.VALUE_y + 130 >= allEnemies[i].VALUE_y + 90
        && this.VALUE_x + 30 <= allEnemies[i].VALUE_x + 88
        && this.VALUE_y + 75 <= allEnemies[i].VALUE_y + 135
        && this.VALUE_x + 75 >= allEnemies[i].VALUE_x + 11)

    {
        this.VALUE_x = 200;
        this.VALUE_y = 385;
    }

    if (this.VALUE_y + 63 <= 0) {        
        this.VALUE_x = 200;
        this.VALUE_y = 385;
        

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 500, 170);
        increaseDifficulty(score);
        Level += 1;
        score += 1;
        
        
    }
}

    if (this.VALUE_y > 385 ) {
        this.VALUE_y = 385;
    }
    if (this.VALUE_x > 400) {
        this.VALUE_x = 400;
    }
    if (this.VALUE_x < 2.5) {
        this.VALUE_x = 2.5;
    }
};

// Increase number of enemies on screen based on player's score
var increaseDifficulty = function(Enemies) {
    allEnemies.length = 0; // remove all previous enemies on canvas

    for (var i = 0; i <= Enemies; i++) {
        var enemy = new Enemy(0, 185 + 50 * Math.random(), 255 * Math.random());
        
        allEnemies.push(enemy);
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
// Enemy randomly placed vertically within section of canvas
// Declare new score and game Level variables to store score and level

var enemy1 = new Enemy(-100,60);
var enemy2 = new Enemy(-600,60);
var enemy3 = new Enemy(-165,140);
var enemy4 = new Enemy(-500,140);
var enemy5 = new Enemy(-200,220);
var enemy6 = new Enemy(-400,220);
var enemy7 = new Enemy(-300,60);
var enemy8 = new Enemy(-300,140);
var player1 = new Player(200,400);

var allEnemies = [enemy1,enemy2,enemy3,enemy4,enemy5,enemy6,enemy7,enemy8];
var player = player1;


var player = new Player(200, 383, 50);
var enemy = new Enemy(0, 184 + 50 * Math.random(), 255 * Math.random());
var score = 0;
var Level = 1;
var scoreLevelDiv = document.createElement('div');

allEnemies.push(enemy);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function Block(game)
{
    this.val = 8;

    this.dom = document.createElement("div");
    this.dom.className = "pulse block block-" + this.val;

    var blocks = game.dom.getElementsByClassName("blocks")[0];
    blocks.appendChild(this.dom);
    this.dom.innerHTML = this.val;

    this.x = 0;
    this.y = 0;

    this.game = game;
}

Block.prototype.setPos = function(x, y)
{
    this.x = x;
    this.y = y;

    this.dom.style.left = x*(50+5*2) + "px";
    this.dom.style.top = y*(50+5*2) + "px";
}

Block.prototype.getX = function() { return this.x; }
Block.prototype.getY = function() { return this.y; }

Block.prototype.destroy = function()
{
    this.dom.parentNode.removeChild(this.dom);
    this.game.blocks.splice(this.game.blocks.indexOf(this), 1);
}

Block.prototype.setVal = function(val)
{
    this.val = val;
    this.dom.innerHTML = val;
    this.dom.textContent = val;
    this.dom.className = "pulse block block-" + val;
}

Block.prototype.getVal = function()
{
    return this.val;
}

Block.prototype.unpulse = function()
{
    this.dom.className = "block block-" + this.val;
}

module.exports = Block;

},{}],2:[function(require,module,exports){

Block = require("./block.js")

function Game()
{
    console.log("Game initialized...");
    this.dom = document.getElementById("game")
    this.score = 0;
    this.enabled = true;

    this.blocks = [];
    this.moved = 0;

    // for (var x = 0; x < 8; x++)
    //     for (var y = 0; y < 8; y++)
    //     {
    //         if (x+y == 14) return;
    //         var block = new Block(this);
    //         block.setPos(x, y);
    //         block.setVal((x+1)*(y+1));
    //         this.blocks.push(block);
    //     }

    this.reset();

}

Game.prototype.addScore = function(score)
{
    this.score += score;

    var eles = this.dom.getElementsByClassName("scorenum");
    for (i in eles)
    {
        var scoreDom = eles[i];
        scoreDom.innerHTML = this.score;
    }
}

Game.prototype.gameover = function()
{
    var gameover = this.dom.getElementsByClassName("gameover")[0];
    gameover.style.display = "";
    gameover.style.opacity = "1";
}

Game.prototype.reset = function()
{
    var gameover = this.dom.getElementsByClassName("gameover")[0];
    gameover.style.display = "none";
    gameover.style.opacity = "0";

    // reset score
    this.score = 0;
    var eles = this.dom.getElementsByClassName("scorenum");
    for (i in eles)
    {
        var scoreDom = eles[i];
        scoreDom.innerHTML = this.score;
    }

    this.moved = 0;
    this.enabled = true;

    var clone = this.blocks.slice()
    for (i in clone)
    {
        clone[i].destroy();
    }

    // spawn in a circle, for some reason idk
    var block = new Block(this);
    block.setPos(3, 2);
    this.blocks.push(block);

    var block = new Block(this);
    block.setPos(4, 2);
    this.blocks.push(block);

    var block = new Block(this);
    block.setPos(3, 5);
    this.blocks.push(block);

    var block = new Block(this);
    block.setPos(4, 5);
    this.blocks.push(block);

    var block = new Block(this);
    block.setPos(2, 3);
    this.blocks.push(block);

    var block = new Block(this);
    block.setPos(2, 4);
    this.blocks.push(block);

    var block = new Block(this);
    block.setPos(5, 3);
    this.blocks.push(block);

    var block = new Block(this);
    block.setPos(5, 4);
    this.blocks.push(block);
}

Game.prototype.getScore = function()
{
    return this.score;
}

Game.prototype.getBlocksAt = function(x, y)
{
    var blocks = [];
    for (i in this.blocks)
    {
        var block = this.blocks[i];
        if (block.getX() == x && block.getY() == y)
            blocks.push(block);
    }
    return blocks;
}

// randomly spawn a block in an array of points
Game.prototype.randomSpawn = function(pointArrays)
{
    if (this.blocks.length == 8*8) return;
    if (pointArrays.length == 0) return; // can't spawn if there are no points!

    var randi = Math.floor(Math.random()*pointArrays.length);
    var point = pointArrays[randi];

    var block = new Block(this);
    block.setPos(point.x, point.y);
    this.blocks.push(block);
}

// Perform a line trace from an origin to a goal.
Game.prototype.trace = function(block, xOrigin, yOrigin, xGoal, yGoal)
{
    var xDelta = xGoal - xOrigin;
    var yDelta = yGoal - yOrigin;

    // check for the sign (-/+) of delta
    var xSign = xDelta > 0 ? 1 : (xDelta < 0 ? -1 : 0)
    var ySign = yDelta > 0 ? 1 : (yDelta < 0 ? -1 : 0)

    var xFinal = xOrigin, yFinal = yOrigin;

    // ugly code, but this will allow us to do a `for i` loop
    // from intervals such as 1..9 or 9..1,
    // and 1..1 will give us a single loop.
    for (var xTrace = xOrigin + xSign; (xSign == 0 ? xTrace == xOrigin : (xGoal - xTrace)*xSign >= 0); xTrace += (xSign == 0 ? 1 : xSign))
    {
        for (var yTrace = yOrigin + ySign; (ySign == 0 ? yTrace == yOrigin : (yGoal - yTrace)*ySign >= 0); yTrace += (ySign == 0 ? 1 : ySign))
        {
            var blocksTrace = this.getBlocksAt(xTrace, yTrace);
            if (blocksTrace.length > 0)
            {
                // if there is a block we can merge into
                // ala, it isn't already merged into (length == 1)
                // and it has the same value as us, then merge into that position!
                if (block.getVal() < 256 // alteration to the game.
                    && blocksTrace.length == 1
                    && blocksTrace[0].getVal() == block.getVal())
                { xFinal = xTrace, yFinal = yTrace; }
                // we break the loop if we hit any blocks in the trace.
                return { x: xFinal, y: yFinal };
            }
            xFinal = xTrace, yFinal = yTrace;
        }
    }

    return { x: xFinal, y: yFinal };
}

Game.prototype.moveUp = function()
{
    if (!this.enabled) { return; }

    for (var y = 0; y < 8; y++)
    {
        for (var x = 0; x < 8; x++)
        {
            var blocks = this.getBlocksAt(x, y);
            if (blocks.length > 0 && blocks[0].getVal() < 256)
            {
                var hitPos = this.trace(blocks[0], x, y, x, 0);

                if (hitPos.x != x || hitPos.y != y) this.moved++;

                for (i in blocks)
                {
                    var block = blocks[i];
                    block.setPos(hitPos.x, hitPos.y);
                }
            }
        }
    }
    
    var _this = this;
    this.enabled = false;
    setTimeout(function() {
        _this.enabled = true;
        _this.finalSweep();
    }, 150);
}

Game.prototype.moveDown = function()
{
    if (!this.enabled) { return; }

    for (var y = 7; y >= 0; y--)
    {
        for (var x = 0; x < 8; x++)
        {
            var blocks = this.getBlocksAt(x, y);
            if (blocks.length > 0 && blocks[0].getVal() < 256)
            {
                var hitPos = this.trace(blocks[0], x, y, x, 7);

                if (hitPos.x != x || hitPos.y != y) this.moved++;

                for (i in blocks)
                {
                    var block = blocks[i];
                    block.setPos(hitPos.x, hitPos.y);
                }
            }
        }
    }

    var _this = this;
    this.enabled = false;
    setTimeout(function() {
        _this.enabled = true;
        _this.finalSweep();
    }, 150);
}

Game.prototype.moveLeft = function()
{
    if (!this.enabled) { return; }
    
    for (var x = 0; x < 8; x++)
    {
        for (var y = 0; y < 8; y++)
        {
            var blocks = this.getBlocksAt(x, y);
            if (blocks.length > 0 && blocks[0].getVal() < 256)
            {
                var hitPos = this.trace(blocks[0], x, y, 0, y);

                if (hitPos.x != x || hitPos.y != y) this.moved++;

                for (i in blocks)
                {
                    var block = blocks[i];
                    block.setPos(hitPos.x, hitPos.y);
                }
            }
        }
    }

    var _this = this;
    this.enabled = false;
    setTimeout(function() {
        _this.enabled = true;
        _this.finalSweep();
    }, 150);
}

Game.prototype.moveRight = function()
{
    if (!this.enabled) { return; }
    
    for (var x = 7; x >= 0; x--)
    {
        for (var y = 0; y < 8; y++)
        {
            var blocks = this.getBlocksAt(x, y);
            if (blocks.length > 0 && blocks[0].getVal() < 256)
            {
                var hitPos = this.trace(blocks[0], x, y, 7, y);

                if (hitPos.x != x || hitPos.y != y) this.moved++;

                for (i in blocks)
                {
                    var block = blocks[i];
                    block.setPos(hitPos.x, hitPos.y);
                }
            }
        }
    }

    var _this = this;
    this.enabled = false;
    setTimeout(function() {
        _this.enabled = true;
        _this.finalSweep();
    }, 150);
}

// legacy function
Game.prototype.getFreeSpaces = function()
{
    var freeSpots = [];
    for (var x = 0; x < 8; x++)
    {
        for (var y = 0; y < 8; y++)
        {
            var blocks = this.getBlocksAt(x, y);
            if (blocks.length == 0) freeSpots.push({x: x, y: y});
        }
    }
}

Game.prototype.hasNeighbors = function(x, y)
{
    var block = this.getBlocksAt(x, y)[0];

    if (!block) return true;
    if (block.getVal() == 256) return false;

    var block1 = this.getBlocksAt(x+1, y)[0];
    var block2 = this.getBlocksAt(x-1, y)[0];
    var block3 = this.getBlocksAt(x, y+1)[0];
    var block4 = this.getBlocksAt(x, y-1)[0];

    return (block1 ? block1.getVal() == block.getVal() : false)
        || (block2 ? block2.getVal() == block.getVal() : false)
        || (block3 ? block3.getVal() == block.getVal() : false)
        || (block4 ? block4.getVal() == block.getVal() : false);
}

Game.prototype.isGameOver = function()
{
    for (var x = 0; x < 8; x++)
    {
        for (var y = 0; y < 8; y++)
        {
            if (this.hasNeighbors(x, y)) {
                return false;
            }
        }
    }
    return true;
}

// do a final sweep of the board to clean things up
// and undo merging animations
Game.prototype.finalSweep = function()
{
    for (i in this.blocks) {
        this.blocks[i].unpulse();
    }

    var freeSpots = [];
    for (var x = 0; x < 8; x++)
    {
        for (var y = 0; y < 8; y++)
        {
            var blocks = this.getBlocksAt(x, y);
            if (blocks.length == 0) freeSpots.push({x: x, y: y});
            if (blocks.length > 1)
            {
                for (i in blocks) {
                    var block = blocks[i];
                    if (i == 0)
                    {
                        block.setVal(block.getVal()*2);
                        if (block.getVal() == 256) this.addScore(1);
                    }
                    else
                    {
                        block.destroy();
                    }
                }
            }
        }
    }

    if (this.moved > 0)
        this.randomSpawn(freeSpots);

    if (this.blocks.length == 8*8 || freeSpots.length == 0)
    {
        if (this.isGameOver())
        {
            this.gameover();
        }
    }

    this.moved = 0;
}

module.exports = Game;

},{"./block.js":1}],3:[function(require,module,exports){

Game = require("./game")

var game = new Game();

document.onkeydown = function(e)
{
    switch(e.keyCode)
    {
        // up
        case 38: // arrow
        case 87: // w
        case 73: // i
        game.moveUp();
        e.preventDefault();
        break;
        // down
        case 40: // arrow
        case 83: // s
        case 75: // k
        game.moveDown();
        e.preventDefault();
        break;
        // left
        case 37: // arrow
        case 65: // a
        case 74: // j
        game.moveLeft();
        e.preventDefault();
        break;
        // right
        case 39: // arrow
        case 68: // d
        case 76: // l
        game.moveRight();
        e.preventDefault();
        break;
    }
}

game.dom.getElementsByClassName("retry")[0].onclick = function(e)
{
    game.reset();
    e.preventDefault();
}

},{"./game":2}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvaGVuL0RvY3VtZW50cy9XZWJkZXYvNDA5Ni9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2hlbi9Eb2N1bWVudHMvV2ViZGV2LzQwOTYvc3JjL2Jsb2NrLmpzIiwiL1VzZXJzL2hlbi9Eb2N1bWVudHMvV2ViZGV2LzQwOTYvc3JjL2dhbWUuanMiLCIvVXNlcnMvaGVuL0RvY3VtZW50cy9XZWJkZXYvNDA5Ni9zcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuZnVuY3Rpb24gQmxvY2soZ2FtZSlcbntcbiAgICB0aGlzLnZhbCA9IDg7XG5cbiAgICB0aGlzLmRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGhpcy5kb20uY2xhc3NOYW1lID0gXCJwdWxzZSBibG9jayBibG9jay1cIiArIHRoaXMudmFsO1xuXG4gICAgdmFyIGJsb2NrcyA9IGdhbWUuZG9tLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJibG9ja3NcIilbMF07XG4gICAgYmxvY2tzLmFwcGVuZENoaWxkKHRoaXMuZG9tKTtcbiAgICB0aGlzLmRvbS5pbm5lckhUTUwgPSB0aGlzLnZhbDtcblxuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcblxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG59XG5cbkJsb2NrLnByb3RvdHlwZS5zZXRQb3MgPSBmdW5jdGlvbih4LCB5KVxue1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcblxuICAgIHRoaXMuZG9tLnN0eWxlLmxlZnQgPSB4Kig1MCs1KjIpICsgXCJweFwiO1xuICAgIHRoaXMuZG9tLnN0eWxlLnRvcCA9IHkqKDUwKzUqMikgKyBcInB4XCI7XG59XG5cbkJsb2NrLnByb3RvdHlwZS5nZXRYID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLng7IH1cbkJsb2NrLnByb3RvdHlwZS5nZXRZID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnk7IH1cblxuQmxvY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpXG57XG4gICAgdGhpcy5kb20ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmRvbSk7XG4gICAgdGhpcy5nYW1lLmJsb2Nrcy5zcGxpY2UodGhpcy5nYW1lLmJsb2Nrcy5pbmRleE9mKHRoaXMpLCAxKTtcbn1cblxuQmxvY2sucHJvdG90eXBlLnNldFZhbCA9IGZ1bmN0aW9uKHZhbClcbntcbiAgICB0aGlzLnZhbCA9IHZhbDtcbiAgICB0aGlzLmRvbS5pbm5lckhUTUwgPSB2YWw7XG4gICAgdGhpcy5kb20udGV4dENvbnRlbnQgPSB2YWw7XG4gICAgdGhpcy5kb20uY2xhc3NOYW1lID0gXCJwdWxzZSBibG9jayBibG9jay1cIiArIHZhbDtcbn1cblxuQmxvY2sucHJvdG90eXBlLmdldFZhbCA9IGZ1bmN0aW9uKClcbntcbiAgICByZXR1cm4gdGhpcy52YWw7XG59XG5cbkJsb2NrLnByb3RvdHlwZS51bnB1bHNlID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMuZG9tLmNsYXNzTmFtZSA9IFwiYmxvY2sgYmxvY2stXCIgKyB0aGlzLnZhbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jaztcbiIsIlxuQmxvY2sgPSByZXF1aXJlKFwiLi9ibG9jay5qc1wiKVxuXG5mdW5jdGlvbiBHYW1lKClcbntcbiAgICBjb25zb2xlLmxvZyhcIkdhbWUgaW5pdGlhbGl6ZWQuLi5cIik7XG4gICAgdGhpcy5kb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVcIilcbiAgICB0aGlzLnNjb3JlID0gMDtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgICB0aGlzLm1vdmVkID0gMDtcblxuICAgIC8vIGZvciAodmFyIHggPSAwOyB4IDwgODsgeCsrKVxuICAgIC8vICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDg7IHkrKylcbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgICAgaWYgKHgreSA9PSAxNCkgcmV0dXJuO1xuICAgIC8vICAgICAgICAgdmFyIGJsb2NrID0gbmV3IEJsb2NrKHRoaXMpO1xuICAgIC8vICAgICAgICAgYmxvY2suc2V0UG9zKHgsIHkpO1xuICAgIC8vICAgICAgICAgYmxvY2suc2V0VmFsKCh4KzEpKih5KzEpKTtcbiAgICAvLyAgICAgICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xuICAgIC8vICAgICB9XG5cbiAgICB0aGlzLnJlc2V0KCk7XG5cbn1cblxuR2FtZS5wcm90b3R5cGUuYWRkU2NvcmUgPSBmdW5jdGlvbihzY29yZSlcbntcbiAgICB0aGlzLnNjb3JlICs9IHNjb3JlO1xuXG4gICAgdmFyIGVsZXMgPSB0aGlzLmRvbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2NvcmVudW1cIik7XG4gICAgZm9yIChpIGluIGVsZXMpXG4gICAge1xuICAgICAgICB2YXIgc2NvcmVEb20gPSBlbGVzW2ldO1xuICAgICAgICBzY29yZURvbS5pbm5lckhUTUwgPSB0aGlzLnNjb3JlO1xuICAgIH1cbn1cblxuR2FtZS5wcm90b3R5cGUuZ2FtZW92ZXIgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGdhbWVvdmVyID0gdGhpcy5kb20uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImdhbWVvdmVyXCIpWzBdO1xuICAgIGdhbWVvdmVyLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIGdhbWVvdmVyLnN0eWxlLm9wYWNpdHkgPSBcIjFcIjtcbn1cblxuR2FtZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGdhbWVvdmVyID0gdGhpcy5kb20uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImdhbWVvdmVyXCIpWzBdO1xuICAgIGdhbWVvdmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBnYW1lb3Zlci5zdHlsZS5vcGFjaXR5ID0gXCIwXCI7XG5cbiAgICAvLyByZXNldCBzY29yZVxuICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIHZhciBlbGVzID0gdGhpcy5kb20uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNjb3JlbnVtXCIpO1xuICAgIGZvciAoaSBpbiBlbGVzKVxuICAgIHtcbiAgICAgICAgdmFyIHNjb3JlRG9tID0gZWxlc1tpXTtcbiAgICAgICAgc2NvcmVEb20uaW5uZXJIVE1MID0gdGhpcy5zY29yZTtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmVkID0gMDtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgdmFyIGNsb25lID0gdGhpcy5ibG9ja3Muc2xpY2UoKVxuICAgIGZvciAoaSBpbiBjbG9uZSlcbiAgICB7XG4gICAgICAgIGNsb25lW2ldLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICAvLyBzcGF3biBpbiBhIGNpcmNsZSwgZm9yIHNvbWUgcmVhc29uIGlka1xuICAgIHZhciBibG9jayA9IG5ldyBCbG9jayh0aGlzKTtcbiAgICBibG9jay5zZXRQb3MoMywgMik7XG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG5cbiAgICB2YXIgYmxvY2sgPSBuZXcgQmxvY2sodGhpcyk7XG4gICAgYmxvY2suc2V0UG9zKDQsIDIpO1xuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2NrKHRoaXMpO1xuICAgIGJsb2NrLnNldFBvcygzLCA1KTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcblxuICAgIHZhciBibG9jayA9IG5ldyBCbG9jayh0aGlzKTtcbiAgICBibG9jay5zZXRQb3MoNCwgNSk7XG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG5cbiAgICB2YXIgYmxvY2sgPSBuZXcgQmxvY2sodGhpcyk7XG4gICAgYmxvY2suc2V0UG9zKDIsIDMpO1xuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2NrKHRoaXMpO1xuICAgIGJsb2NrLnNldFBvcygyLCA0KTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcblxuICAgIHZhciBibG9jayA9IG5ldyBCbG9jayh0aGlzKTtcbiAgICBibG9jay5zZXRQb3MoNSwgMyk7XG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG5cbiAgICB2YXIgYmxvY2sgPSBuZXcgQmxvY2sodGhpcyk7XG4gICAgYmxvY2suc2V0UG9zKDUsIDQpO1xuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xufVxuXG5HYW1lLnByb3RvdHlwZS5nZXRTY29yZSA9IGZ1bmN0aW9uKClcbntcbiAgICByZXR1cm4gdGhpcy5zY29yZTtcbn1cblxuR2FtZS5wcm90b3R5cGUuZ2V0QmxvY2tzQXQgPSBmdW5jdGlvbih4LCB5KVxue1xuICAgIHZhciBibG9ja3MgPSBbXTtcbiAgICBmb3IgKGkgaW4gdGhpcy5ibG9ja3MpXG4gICAge1xuICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmJsb2Nrc1tpXTtcbiAgICAgICAgaWYgKGJsb2NrLmdldFgoKSA9PSB4ICYmIGJsb2NrLmdldFkoKSA9PSB5KVxuICAgICAgICAgICAgYmxvY2tzLnB1c2goYmxvY2spO1xuICAgIH1cbiAgICByZXR1cm4gYmxvY2tzO1xufVxuXG4vLyByYW5kb21seSBzcGF3biBhIGJsb2NrIGluIGFuIGFycmF5IG9mIHBvaW50c1xuR2FtZS5wcm90b3R5cGUucmFuZG9tU3Bhd24gPSBmdW5jdGlvbihwb2ludEFycmF5cylcbntcbiAgICBpZiAodGhpcy5ibG9ja3MubGVuZ3RoID09IDgqOCkgcmV0dXJuO1xuICAgIGlmIChwb2ludEFycmF5cy5sZW5ndGggPT0gMCkgcmV0dXJuOyAvLyBjYW4ndCBzcGF3biBpZiB0aGVyZSBhcmUgbm8gcG9pbnRzIVxuXG4gICAgdmFyIHJhbmRpID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBvaW50QXJyYXlzLmxlbmd0aCk7XG4gICAgdmFyIHBvaW50ID0gcG9pbnRBcnJheXNbcmFuZGldO1xuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2NrKHRoaXMpO1xuICAgIGJsb2NrLnNldFBvcyhwb2ludC54LCBwb2ludC55KTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcbn1cblxuLy8gUGVyZm9ybSBhIGxpbmUgdHJhY2UgZnJvbSBhbiBvcmlnaW4gdG8gYSBnb2FsLlxuR2FtZS5wcm90b3R5cGUudHJhY2UgPSBmdW5jdGlvbihibG9jaywgeE9yaWdpbiwgeU9yaWdpbiwgeEdvYWwsIHlHb2FsKVxue1xuICAgIHZhciB4RGVsdGEgPSB4R29hbCAtIHhPcmlnaW47XG4gICAgdmFyIHlEZWx0YSA9IHlHb2FsIC0geU9yaWdpbjtcblxuICAgIC8vIGNoZWNrIGZvciB0aGUgc2lnbiAoLS8rKSBvZiBkZWx0YVxuICAgIHZhciB4U2lnbiA9IHhEZWx0YSA+IDAgPyAxIDogKHhEZWx0YSA8IDAgPyAtMSA6IDApXG4gICAgdmFyIHlTaWduID0geURlbHRhID4gMCA/IDEgOiAoeURlbHRhIDwgMCA/IC0xIDogMClcblxuICAgIHZhciB4RmluYWwgPSB4T3JpZ2luLCB5RmluYWwgPSB5T3JpZ2luO1xuXG4gICAgLy8gdWdseSBjb2RlLCBidXQgdGhpcyB3aWxsIGFsbG93IHVzIHRvIGRvIGEgYGZvciBpYCBsb29wXG4gICAgLy8gZnJvbSBpbnRlcnZhbHMgc3VjaCBhcyAxLi45IG9yIDkuLjEsXG4gICAgLy8gYW5kIDEuLjEgd2lsbCBnaXZlIHVzIGEgc2luZ2xlIGxvb3AuXG4gICAgZm9yICh2YXIgeFRyYWNlID0geE9yaWdpbiArIHhTaWduOyAoeFNpZ24gPT0gMCA/IHhUcmFjZSA9PSB4T3JpZ2luIDogKHhHb2FsIC0geFRyYWNlKSp4U2lnbiA+PSAwKTsgeFRyYWNlICs9ICh4U2lnbiA9PSAwID8gMSA6IHhTaWduKSlcbiAgICB7XG4gICAgICAgIGZvciAodmFyIHlUcmFjZSA9IHlPcmlnaW4gKyB5U2lnbjsgKHlTaWduID09IDAgPyB5VHJhY2UgPT0geU9yaWdpbiA6ICh5R29hbCAtIHlUcmFjZSkqeVNpZ24gPj0gMCk7IHlUcmFjZSArPSAoeVNpZ24gPT0gMCA/IDEgOiB5U2lnbikpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBibG9ja3NUcmFjZSA9IHRoaXMuZ2V0QmxvY2tzQXQoeFRyYWNlLCB5VHJhY2UpO1xuICAgICAgICAgICAgaWYgKGJsb2Nrc1RyYWNlLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBibG9jayB3ZSBjYW4gbWVyZ2UgaW50b1xuICAgICAgICAgICAgICAgIC8vIGFsYSwgaXQgaXNuJ3QgYWxyZWFkeSBtZXJnZWQgaW50byAobGVuZ3RoID09IDEpXG4gICAgICAgICAgICAgICAgLy8gYW5kIGl0IGhhcyB0aGUgc2FtZSB2YWx1ZSBhcyB1cywgdGhlbiBtZXJnZSBpbnRvIHRoYXQgcG9zaXRpb24hXG4gICAgICAgICAgICAgICAgaWYgKGJsb2NrLmdldFZhbCgpIDwgMjU2IC8vIGFsdGVyYXRpb24gdG8gdGhlIGdhbWUuXG4gICAgICAgICAgICAgICAgICAgICYmIGJsb2Nrc1RyYWNlLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgICAgICYmIGJsb2Nrc1RyYWNlWzBdLmdldFZhbCgpID09IGJsb2NrLmdldFZhbCgpKVxuICAgICAgICAgICAgICAgIHsgeEZpbmFsID0geFRyYWNlLCB5RmluYWwgPSB5VHJhY2U7IH1cbiAgICAgICAgICAgICAgICAvLyB3ZSBicmVhayB0aGUgbG9vcCBpZiB3ZSBoaXQgYW55IGJsb2NrcyBpbiB0aGUgdHJhY2UuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgeDogeEZpbmFsLCB5OiB5RmluYWwgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhGaW5hbCA9IHhUcmFjZSwgeUZpbmFsID0geVRyYWNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeDogeEZpbmFsLCB5OiB5RmluYWwgfTtcbn1cblxuR2FtZS5wcm90b3R5cGUubW92ZVVwID0gZnVuY3Rpb24oKVxue1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7IHJldHVybjsgfVxuXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCA4OyB5KyspXG4gICAge1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDg7IHgrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJsb2NrcyA9IHRoaXMuZ2V0QmxvY2tzQXQoeCwgeSk7XG4gICAgICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA+IDAgJiYgYmxvY2tzWzBdLmdldFZhbCgpIDwgMjU2KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBoaXRQb3MgPSB0aGlzLnRyYWNlKGJsb2Nrc1swXSwgeCwgeSwgeCwgMCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaGl0UG9zLnggIT0geCB8fCBoaXRQb3MueSAhPSB5KSB0aGlzLm1vdmVkKys7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgaW4gYmxvY2tzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gYmxvY2tzW2ldO1xuICAgICAgICAgICAgICAgICAgICBibG9jay5zZXRQb3MoaGl0UG9zLngsIGhpdFBvcy55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgX3RoaXMuZmluYWxTd2VlcCgpO1xuICAgIH0sIDE1MCk7XG59XG5cbkdhbWUucHJvdG90eXBlLm1vdmVEb3duID0gZnVuY3Rpb24oKVxue1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7IHJldHVybjsgfVxuXG4gICAgZm9yICh2YXIgeSA9IDc7IHkgPj0gMDsgeS0tKVxuICAgIHtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA4OyB4KyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBibG9ja3MgPSB0aGlzLmdldEJsb2Nrc0F0KHgsIHkpO1xuICAgICAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPiAwICYmIGJsb2Nrc1swXS5nZXRWYWwoKSA8IDI1NilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgaGl0UG9zID0gdGhpcy50cmFjZShibG9ja3NbMF0sIHgsIHksIHgsIDcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGhpdFBvcy54ICE9IHggfHwgaGl0UG9zLnkgIT0geSkgdGhpcy5tb3ZlZCsrO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpIGluIGJsb2NrcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suc2V0UG9zKGhpdFBvcy54LCBoaXRQb3MueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgX3RoaXMuZmluYWxTd2VlcCgpO1xuICAgIH0sIDE1MCk7XG59XG5cbkdhbWUucHJvdG90eXBlLm1vdmVMZWZ0ID0gZnVuY3Rpb24oKVxue1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7IHJldHVybjsgfVxuICAgIFxuICAgIGZvciAodmFyIHggPSAwOyB4IDwgODsgeCsrKVxuICAgIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCA4OyB5KyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBibG9ja3MgPSB0aGlzLmdldEJsb2Nrc0F0KHgsIHkpO1xuICAgICAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPiAwICYmIGJsb2Nrc1swXS5nZXRWYWwoKSA8IDI1NilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgaGl0UG9zID0gdGhpcy50cmFjZShibG9ja3NbMF0sIHgsIHksIDAsIHkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGhpdFBvcy54ICE9IHggfHwgaGl0UG9zLnkgIT0geSkgdGhpcy5tb3ZlZCsrO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpIGluIGJsb2NrcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suc2V0UG9zKGhpdFBvcy54LCBoaXRQb3MueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgX3RoaXMuZmluYWxTd2VlcCgpO1xuICAgIH0sIDE1MCk7XG59XG5cbkdhbWUucHJvdG90eXBlLm1vdmVSaWdodCA9IGZ1bmN0aW9uKClcbntcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICBcbiAgICBmb3IgKHZhciB4ID0gNzsgeCA+PSAwOyB4LS0pXG4gICAge1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDg7IHkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJsb2NrcyA9IHRoaXMuZ2V0QmxvY2tzQXQoeCwgeSk7XG4gICAgICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA+IDAgJiYgYmxvY2tzWzBdLmdldFZhbCgpIDwgMjU2KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBoaXRQb3MgPSB0aGlzLnRyYWNlKGJsb2Nrc1swXSwgeCwgeSwgNywgeSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaGl0UG9zLnggIT0geCB8fCBoaXRQb3MueSAhPSB5KSB0aGlzLm1vdmVkKys7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgaW4gYmxvY2tzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gYmxvY2tzW2ldO1xuICAgICAgICAgICAgICAgICAgICBibG9jay5zZXRQb3MoaGl0UG9zLngsIGhpdFBvcy55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICBfdGhpcy5maW5hbFN3ZWVwKCk7XG4gICAgfSwgMTUwKTtcbn1cblxuLy8gbGVnYWN5IGZ1bmN0aW9uXG5HYW1lLnByb3RvdHlwZS5nZXRGcmVlU3BhY2VzID0gZnVuY3Rpb24oKVxue1xuICAgIHZhciBmcmVlU3BvdHMgPSBbXTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDg7IHgrKylcbiAgICB7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgODsgeSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmxvY2tzID0gdGhpcy5nZXRCbG9ja3NBdCh4LCB5KTtcbiAgICAgICAgICAgIGlmIChibG9ja3MubGVuZ3RoID09IDApIGZyZWVTcG90cy5wdXNoKHt4OiB4LCB5OiB5fSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkdhbWUucHJvdG90eXBlLmhhc05laWdoYm9ycyA9IGZ1bmN0aW9uKHgsIHkpXG57XG4gICAgdmFyIGJsb2NrID0gdGhpcy5nZXRCbG9ja3NBdCh4LCB5KVswXTtcblxuICAgIGlmICghYmxvY2spIHJldHVybiB0cnVlO1xuICAgIGlmIChibG9jay5nZXRWYWwoKSA9PSAyNTYpIHJldHVybiBmYWxzZTtcblxuICAgIHZhciBibG9jazEgPSB0aGlzLmdldEJsb2Nrc0F0KHgrMSwgeSlbMF07XG4gICAgdmFyIGJsb2NrMiA9IHRoaXMuZ2V0QmxvY2tzQXQoeC0xLCB5KVswXTtcbiAgICB2YXIgYmxvY2szID0gdGhpcy5nZXRCbG9ja3NBdCh4LCB5KzEpWzBdO1xuICAgIHZhciBibG9jazQgPSB0aGlzLmdldEJsb2Nrc0F0KHgsIHktMSlbMF07XG5cbiAgICByZXR1cm4gKGJsb2NrMSA/IGJsb2NrMS5nZXRWYWwoKSA9PSBibG9jay5nZXRWYWwoKSA6IGZhbHNlKVxuICAgICAgICB8fCAoYmxvY2syID8gYmxvY2syLmdldFZhbCgpID09IGJsb2NrLmdldFZhbCgpIDogZmFsc2UpXG4gICAgICAgIHx8IChibG9jazMgPyBibG9jazMuZ2V0VmFsKCkgPT0gYmxvY2suZ2V0VmFsKCkgOiBmYWxzZSlcbiAgICAgICAgfHwgKGJsb2NrNCA/IGJsb2NrNC5nZXRWYWwoKSA9PSBibG9jay5nZXRWYWwoKSA6IGZhbHNlKTtcbn1cblxuR2FtZS5wcm90b3R5cGUuaXNHYW1lT3ZlciA9IGZ1bmN0aW9uKClcbntcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDg7IHgrKylcbiAgICB7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgODsgeSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNOZWlnaGJvcnMoeCwgeSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8vIGRvIGEgZmluYWwgc3dlZXAgb2YgdGhlIGJvYXJkIHRvIGNsZWFuIHRoaW5ncyB1cFxuLy8gYW5kIHVuZG8gbWVyZ2luZyBhbmltYXRpb25zXG5HYW1lLnByb3RvdHlwZS5maW5hbFN3ZWVwID0gZnVuY3Rpb24oKVxue1xuICAgIGZvciAoaSBpbiB0aGlzLmJsb2Nrcykge1xuICAgICAgICB0aGlzLmJsb2Nrc1tpXS51bnB1bHNlKCk7XG4gICAgfVxuXG4gICAgdmFyIGZyZWVTcG90cyA9IFtdO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgODsgeCsrKVxuICAgIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCA4OyB5KyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBibG9ja3MgPSB0aGlzLmdldEJsb2Nrc0F0KHgsIHkpO1xuICAgICAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPT0gMCkgZnJlZVNwb3RzLnB1c2goe3g6IHgsIHk6IHl9KTtcbiAgICAgICAgICAgIGlmIChibG9ja3MubGVuZ3RoID4gMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmb3IgKGkgaW4gYmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2suc2V0VmFsKGJsb2NrLmdldFZhbCgpKjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2NrLmdldFZhbCgpID09IDI1NikgdGhpcy5hZGRTY29yZSgxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm1vdmVkID4gMClcbiAgICAgICAgdGhpcy5yYW5kb21TcGF3bihmcmVlU3BvdHMpO1xuXG4gICAgaWYgKHRoaXMuYmxvY2tzLmxlbmd0aCA9PSA4KjggfHwgZnJlZVNwb3RzLmxlbmd0aCA9PSAwKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuaXNHYW1lT3ZlcigpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmdhbWVvdmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1vdmVkID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xuIiwiXG5HYW1lID0gcmVxdWlyZShcIi4vZ2FtZVwiKVxuXG52YXIgZ2FtZSA9IG5ldyBHYW1lKCk7XG5cbmRvY3VtZW50Lm9ua2V5ZG93biA9IGZ1bmN0aW9uKGUpXG57XG4gICAgc3dpdGNoKGUua2V5Q29kZSlcbiAgICB7XG4gICAgICAgIC8vIHVwXG4gICAgICAgIGNhc2UgMzg6IC8vIGFycm93XG4gICAgICAgIGNhc2UgODc6IC8vIHdcbiAgICAgICAgY2FzZSA3MzogLy8gaVxuICAgICAgICBnYW1lLm1vdmVVcCgpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBkb3duXG4gICAgICAgIGNhc2UgNDA6IC8vIGFycm93XG4gICAgICAgIGNhc2UgODM6IC8vIHNcbiAgICAgICAgY2FzZSA3NTogLy8ga1xuICAgICAgICBnYW1lLm1vdmVEb3duKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIGxlZnRcbiAgICAgICAgY2FzZSAzNzogLy8gYXJyb3dcbiAgICAgICAgY2FzZSA2NTogLy8gYVxuICAgICAgICBjYXNlIDc0OiAvLyBqXG4gICAgICAgIGdhbWUubW92ZUxlZnQoKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgICAgLy8gcmlnaHRcbiAgICAgICAgY2FzZSAzOTogLy8gYXJyb3dcbiAgICAgICAgY2FzZSA2ODogLy8gZFxuICAgICAgICBjYXNlIDc2OiAvLyBsXG4gICAgICAgIGdhbWUubW92ZVJpZ2h0KCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG5nYW1lLmRvbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicmV0cnlcIilbMF0ub25jbGljayA9IGZ1bmN0aW9uKGUpXG57XG4gICAgZ2FtZS5yZXNldCgpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbn1cbiJdfQ==

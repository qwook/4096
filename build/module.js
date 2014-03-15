(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function Block(game)
{
    this.val = 8;

    this.dom = document.createElement("div");
    this.dom.className = "pulse block block-" + this.val;

    var blocks = game.dom.getElementsByClassName("blocks")[0];
    blocks.appendChild(this.dom);
    this.dom.innerText = this.val;

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
    this.dom.innerText = val;
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
        scoreDom.innerText = this.score;
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
        scoreDom.innerText = this.score;
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
            console.log(x, y);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvaGVuL0RvY3VtZW50cy9XZWJkZXYvNDA5Ni9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2hlbi9Eb2N1bWVudHMvV2ViZGV2LzQwOTYvc3JjL2Jsb2NrLmpzIiwiL1VzZXJzL2hlbi9Eb2N1bWVudHMvV2ViZGV2LzQwOTYvc3JjL2dhbWUuanMiLCIvVXNlcnMvaGVuL0RvY3VtZW50cy9XZWJkZXYvNDA5Ni9zcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmZ1bmN0aW9uIEJsb2NrKGdhbWUpXG57XG4gICAgdGhpcy52YWwgPSA4O1xuXG4gICAgdGhpcy5kb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRoaXMuZG9tLmNsYXNzTmFtZSA9IFwicHVsc2UgYmxvY2sgYmxvY2stXCIgKyB0aGlzLnZhbDtcblxuICAgIHZhciBibG9ja3MgPSBnYW1lLmRvbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiYmxvY2tzXCIpWzBdO1xuICAgIGJsb2Nrcy5hcHBlbmRDaGlsZCh0aGlzLmRvbSk7XG4gICAgdGhpcy5kb20uaW5uZXJUZXh0ID0gdGhpcy52YWw7XG5cbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG5cbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xufVxuXG5CbG9jay5wcm90b3R5cGUuc2V0UG9zID0gZnVuY3Rpb24oeCwgeSlcbntcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG5cbiAgICB0aGlzLmRvbS5zdHlsZS5sZWZ0ID0geCooNTArNSoyKSArIFwicHhcIjtcbiAgICB0aGlzLmRvbS5zdHlsZS50b3AgPSB5Kig1MCs1KjIpICsgXCJweFwiO1xufVxuXG5CbG9jay5wcm90b3R5cGUuZ2V0WCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy54OyB9XG5CbG9jay5wcm90b3R5cGUuZ2V0WSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy55OyB9XG5cbkJsb2NrLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMuZG9tLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5kb20pO1xuICAgIHRoaXMuZ2FtZS5ibG9ja3Muc3BsaWNlKHRoaXMuZ2FtZS5ibG9ja3MuaW5kZXhPZih0aGlzKSwgMSk7XG59XG5cbkJsb2NrLnByb3RvdHlwZS5zZXRWYWwgPSBmdW5jdGlvbih2YWwpXG57XG4gICAgdGhpcy52YWwgPSB2YWw7XG4gICAgdGhpcy5kb20uaW5uZXJUZXh0ID0gdmFsO1xuICAgIHRoaXMuZG9tLmNsYXNzTmFtZSA9IFwicHVsc2UgYmxvY2sgYmxvY2stXCIgKyB2YWw7XG59XG5cbkJsb2NrLnByb3RvdHlwZS5nZXRWYWwgPSBmdW5jdGlvbigpXG57XG4gICAgcmV0dXJuIHRoaXMudmFsO1xufVxuXG5CbG9jay5wcm90b3R5cGUudW5wdWxzZSA9IGZ1bmN0aW9uKClcbntcbiAgICB0aGlzLmRvbS5jbGFzc05hbWUgPSBcImJsb2NrIGJsb2NrLVwiICsgdGhpcy52YWw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2s7XG4iLCJcbkJsb2NrID0gcmVxdWlyZShcIi4vYmxvY2suanNcIilcblxuZnVuY3Rpb24gR2FtZSgpXG57XG4gICAgY29uc29sZS5sb2coXCJHYW1lIGluaXRpYWxpemVkLi4uXCIpO1xuICAgIHRoaXMuZG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lXCIpXG4gICAgdGhpcy5zY29yZSA9IDA7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIHRoaXMuYmxvY2tzID0gW107XG4gICAgdGhpcy5tb3ZlZCA9IDA7XG5cbiAgICAvLyBmb3IgKHZhciB4ID0gMDsgeCA8IDg7IHgrKylcbiAgICAvLyAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCA4OyB5KyspXG4gICAgLy8gICAgIHtcbiAgICAvLyAgICAgICAgIGlmICh4K3kgPT0gMTQpIHJldHVybjtcbiAgICAvLyAgICAgICAgIHZhciBibG9jayA9IG5ldyBCbG9jayh0aGlzKTtcbiAgICAvLyAgICAgICAgIGJsb2NrLnNldFBvcyh4LCB5KTtcbiAgICAvLyAgICAgICAgIGJsb2NrLnNldFZhbCgoeCsxKSooeSsxKSk7XG4gICAgLy8gICAgICAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcbiAgICAvLyAgICAgfVxuXG4gICAgdGhpcy5yZXNldCgpO1xuXG59XG5cbkdhbWUucHJvdG90eXBlLmFkZFNjb3JlID0gZnVuY3Rpb24oc2NvcmUpXG57XG4gICAgdGhpcy5zY29yZSArPSBzY29yZTtcblxuICAgIHZhciBlbGVzID0gdGhpcy5kb20uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNjb3JlbnVtXCIpO1xuICAgIGZvciAoaSBpbiBlbGVzKVxuICAgIHtcbiAgICAgICAgdmFyIHNjb3JlRG9tID0gZWxlc1tpXTtcbiAgICAgICAgc2NvcmVEb20uaW5uZXJUZXh0ID0gdGhpcy5zY29yZTtcbiAgICB9XG59XG5cbkdhbWUucHJvdG90eXBlLmdhbWVvdmVyID0gZnVuY3Rpb24oKVxue1xuICAgIHZhciBnYW1lb3ZlciA9IHRoaXMuZG9tLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJnYW1lb3ZlclwiKVswXTtcbiAgICBnYW1lb3Zlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICBnYW1lb3Zlci5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG59XG5cbkdhbWUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKVxue1xuICAgIHZhciBnYW1lb3ZlciA9IHRoaXMuZG9tLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJnYW1lb3ZlclwiKVswXTtcbiAgICBnYW1lb3Zlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgZ2FtZW92ZXIuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuXG4gICAgLy8gcmVzZXQgc2NvcmVcbiAgICB0aGlzLnNjb3JlID0gMDtcbiAgICB2YXIgZWxlcyA9IHRoaXMuZG9tLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzY29yZW51bVwiKTtcbiAgICBmb3IgKGkgaW4gZWxlcylcbiAgICB7XG4gICAgICAgIHZhciBzY29yZURvbSA9IGVsZXNbaV07XG4gICAgICAgIHNjb3JlRG9tLmlubmVyVGV4dCA9IHRoaXMuc2NvcmU7XG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlZCA9IDA7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIHZhciBjbG9uZSA9IHRoaXMuYmxvY2tzLnNsaWNlKClcbiAgICBmb3IgKGkgaW4gY2xvbmUpXG4gICAge1xuICAgICAgICBjbG9uZVtpXS5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLy8gc3Bhd24gaW4gYSBjaXJjbGUsIGZvciBzb21lIHJlYXNvbiBpZGtcbiAgICB2YXIgYmxvY2sgPSBuZXcgQmxvY2sodGhpcyk7XG4gICAgYmxvY2suc2V0UG9zKDMsIDIpO1xuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2NrKHRoaXMpO1xuICAgIGJsb2NrLnNldFBvcyg0LCAyKTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcblxuICAgIHZhciBibG9jayA9IG5ldyBCbG9jayh0aGlzKTtcbiAgICBibG9jay5zZXRQb3MoMywgNSk7XG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG5cbiAgICB2YXIgYmxvY2sgPSBuZXcgQmxvY2sodGhpcyk7XG4gICAgYmxvY2suc2V0UG9zKDQsIDUpO1xuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2NrKHRoaXMpO1xuICAgIGJsb2NrLnNldFBvcygyLCAzKTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcblxuICAgIHZhciBibG9jayA9IG5ldyBCbG9jayh0aGlzKTtcbiAgICBibG9jay5zZXRQb3MoMiwgNCk7XG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG5cbiAgICB2YXIgYmxvY2sgPSBuZXcgQmxvY2sodGhpcyk7XG4gICAgYmxvY2suc2V0UG9zKDUsIDMpO1xuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2NrKHRoaXMpO1xuICAgIGJsb2NrLnNldFBvcyg1LCA0KTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcbn1cblxuR2FtZS5wcm90b3R5cGUuZ2V0U2NvcmUgPSBmdW5jdGlvbigpXG57XG4gICAgcmV0dXJuIHRoaXMuc2NvcmU7XG59XG5cbkdhbWUucHJvdG90eXBlLmdldEJsb2Nrc0F0ID0gZnVuY3Rpb24oeCwgeSlcbntcbiAgICB2YXIgYmxvY2tzID0gW107XG4gICAgZm9yIChpIGluIHRoaXMuYmxvY2tzKVxuICAgIHtcbiAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5ibG9ja3NbaV07XG4gICAgICAgIGlmIChibG9jay5nZXRYKCkgPT0geCAmJiBibG9jay5nZXRZKCkgPT0geSlcbiAgICAgICAgICAgIGJsb2Nrcy5wdXNoKGJsb2NrKTtcbiAgICB9XG4gICAgcmV0dXJuIGJsb2Nrcztcbn1cblxuLy8gcmFuZG9tbHkgc3Bhd24gYSBibG9jayBpbiBhbiBhcnJheSBvZiBwb2ludHNcbkdhbWUucHJvdG90eXBlLnJhbmRvbVNwYXduID0gZnVuY3Rpb24ocG9pbnRBcnJheXMpXG57XG4gICAgaWYgKHRoaXMuYmxvY2tzLmxlbmd0aCA9PSA4KjgpIHJldHVybjtcbiAgICBpZiAocG9pbnRBcnJheXMubGVuZ3RoID09IDApIHJldHVybjsgLy8gY2FuJ3Qgc3Bhd24gaWYgdGhlcmUgYXJlIG5vIHBvaW50cyFcblxuICAgIHZhciByYW5kaSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpwb2ludEFycmF5cy5sZW5ndGgpO1xuICAgIHZhciBwb2ludCA9IHBvaW50QXJyYXlzW3JhbmRpXTtcblxuICAgIHZhciBibG9jayA9IG5ldyBCbG9jayh0aGlzKTtcbiAgICBibG9jay5zZXRQb3MocG9pbnQueCwgcG9pbnQueSk7XG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG59XG5cbi8vIFBlcmZvcm0gYSBsaW5lIHRyYWNlIGZyb20gYW4gb3JpZ2luIHRvIGEgZ29hbC5cbkdhbWUucHJvdG90eXBlLnRyYWNlID0gZnVuY3Rpb24oYmxvY2ssIHhPcmlnaW4sIHlPcmlnaW4sIHhHb2FsLCB5R29hbClcbntcbiAgICB2YXIgeERlbHRhID0geEdvYWwgLSB4T3JpZ2luO1xuICAgIHZhciB5RGVsdGEgPSB5R29hbCAtIHlPcmlnaW47XG5cbiAgICAvLyBjaGVjayBmb3IgdGhlIHNpZ24gKC0vKykgb2YgZGVsdGFcbiAgICB2YXIgeFNpZ24gPSB4RGVsdGEgPiAwID8gMSA6ICh4RGVsdGEgPCAwID8gLTEgOiAwKVxuICAgIHZhciB5U2lnbiA9IHlEZWx0YSA+IDAgPyAxIDogKHlEZWx0YSA8IDAgPyAtMSA6IDApXG5cbiAgICB2YXIgeEZpbmFsID0geE9yaWdpbiwgeUZpbmFsID0geU9yaWdpbjtcblxuICAgIC8vIHVnbHkgY29kZSwgYnV0IHRoaXMgd2lsbCBhbGxvdyB1cyB0byBkbyBhIGBmb3IgaWAgbG9vcFxuICAgIC8vIGZyb20gaW50ZXJ2YWxzIHN1Y2ggYXMgMS4uOSBvciA5Li4xLFxuICAgIC8vIGFuZCAxLi4xIHdpbGwgZ2l2ZSB1cyBhIHNpbmdsZSBsb29wLlxuICAgIGZvciAodmFyIHhUcmFjZSA9IHhPcmlnaW4gKyB4U2lnbjsgKHhTaWduID09IDAgPyB4VHJhY2UgPT0geE9yaWdpbiA6ICh4R29hbCAtIHhUcmFjZSkqeFNpZ24gPj0gMCk7IHhUcmFjZSArPSAoeFNpZ24gPT0gMCA/IDEgOiB4U2lnbikpXG4gICAge1xuICAgICAgICBmb3IgKHZhciB5VHJhY2UgPSB5T3JpZ2luICsgeVNpZ247ICh5U2lnbiA9PSAwID8geVRyYWNlID09IHlPcmlnaW4gOiAoeUdvYWwgLSB5VHJhY2UpKnlTaWduID49IDApOyB5VHJhY2UgKz0gKHlTaWduID09IDAgPyAxIDogeVNpZ24pKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmxvY2tzVHJhY2UgPSB0aGlzLmdldEJsb2Nrc0F0KHhUcmFjZSwgeVRyYWNlKTtcbiAgICAgICAgICAgIGlmIChibG9ja3NUcmFjZS5sZW5ndGggPiAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgYmxvY2sgd2UgY2FuIG1lcmdlIGludG9cbiAgICAgICAgICAgICAgICAvLyBhbGEsIGl0IGlzbid0IGFscmVhZHkgbWVyZ2VkIGludG8gKGxlbmd0aCA9PSAxKVxuICAgICAgICAgICAgICAgIC8vIGFuZCBpdCBoYXMgdGhlIHNhbWUgdmFsdWUgYXMgdXMsIHRoZW4gbWVyZ2UgaW50byB0aGF0IHBvc2l0aW9uIVxuICAgICAgICAgICAgICAgIGlmIChibG9jay5nZXRWYWwoKSA8IDI1NiAvLyBhbHRlcmF0aW9uIHRvIHRoZSBnYW1lLlxuICAgICAgICAgICAgICAgICAgICAmJiBibG9ja3NUcmFjZS5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICAgICAgICAmJiBibG9ja3NUcmFjZVswXS5nZXRWYWwoKSA9PSBibG9jay5nZXRWYWwoKSlcbiAgICAgICAgICAgICAgICB7IHhGaW5hbCA9IHhUcmFjZSwgeUZpbmFsID0geVRyYWNlOyB9XG4gICAgICAgICAgICAgICAgLy8gd2UgYnJlYWsgdGhlIGxvb3AgaWYgd2UgaGl0IGFueSBibG9ja3MgaW4gdGhlIHRyYWNlLlxuICAgICAgICAgICAgICAgIHJldHVybiB7IHg6IHhGaW5hbCwgeTogeUZpbmFsIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB4RmluYWwgPSB4VHJhY2UsIHlGaW5hbCA9IHlUcmFjZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IHg6IHhGaW5hbCwgeTogeUZpbmFsIH07XG59XG5cbkdhbWUucHJvdG90eXBlLm1vdmVVcCA9IGZ1bmN0aW9uKClcbntcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgeyByZXR1cm47IH1cblxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgODsgeSsrKVxuICAgIHtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA4OyB4KyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBibG9ja3MgPSB0aGlzLmdldEJsb2Nrc0F0KHgsIHkpO1xuICAgICAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPiAwICYmIGJsb2Nrc1swXS5nZXRWYWwoKSA8IDI1NilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgaGl0UG9zID0gdGhpcy50cmFjZShibG9ja3NbMF0sIHgsIHksIHgsIDApO1xuXG4gICAgICAgICAgICAgICAgaWYgKGhpdFBvcy54ICE9IHggfHwgaGl0UG9zLnkgIT0geSkgdGhpcy5tb3ZlZCsrO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpIGluIGJsb2NrcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suc2V0UG9zKGhpdFBvcy54LCBoaXRQb3MueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIF90aGlzLmZpbmFsU3dlZXAoKTtcbiAgICB9LCAxNTApO1xufVxuXG5HYW1lLnByb3RvdHlwZS5tb3ZlRG93biA9IGZ1bmN0aW9uKClcbntcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgeyByZXR1cm47IH1cblxuICAgIGZvciAodmFyIHkgPSA3OyB5ID49IDA7IHktLSlcbiAgICB7XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgODsgeCsrKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmxvY2tzID0gdGhpcy5nZXRCbG9ja3NBdCh4LCB5KTtcbiAgICAgICAgICAgIGlmIChibG9ja3MubGVuZ3RoID4gMCAmJiBibG9ja3NbMF0uZ2V0VmFsKCkgPCAyNTYpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGhpdFBvcyA9IHRoaXMudHJhY2UoYmxvY2tzWzBdLCB4LCB5LCB4LCA3KTtcblxuICAgICAgICAgICAgICAgIGlmIChoaXRQb3MueCAhPSB4IHx8IGhpdFBvcy55ICE9IHkpIHRoaXMubW92ZWQrKztcblxuICAgICAgICAgICAgICAgIGZvciAoaSBpbiBibG9ja3MpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLnNldFBvcyhoaXRQb3MueCwgaGl0UG9zLnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIF90aGlzLmZpbmFsU3dlZXAoKTtcbiAgICB9LCAxNTApO1xufVxuXG5HYW1lLnByb3RvdHlwZS5tb3ZlTGVmdCA9IGZ1bmN0aW9uKClcbntcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICBcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDg7IHgrKylcbiAgICB7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgODsgeSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmxvY2tzID0gdGhpcy5nZXRCbG9ja3NBdCh4LCB5KTtcbiAgICAgICAgICAgIGlmIChibG9ja3MubGVuZ3RoID4gMCAmJiBibG9ja3NbMF0uZ2V0VmFsKCkgPCAyNTYpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGhpdFBvcyA9IHRoaXMudHJhY2UoYmxvY2tzWzBdLCB4LCB5LCAwLCB5KTtcblxuICAgICAgICAgICAgICAgIGlmIChoaXRQb3MueCAhPSB4IHx8IGhpdFBvcy55ICE9IHkpIHRoaXMubW92ZWQrKztcblxuICAgICAgICAgICAgICAgIGZvciAoaSBpbiBibG9ja3MpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLnNldFBvcyhoaXRQb3MueCwgaGl0UG9zLnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIF90aGlzLmZpbmFsU3dlZXAoKTtcbiAgICB9LCAxNTApO1xufVxuXG5HYW1lLnByb3RvdHlwZS5tb3ZlUmlnaHQgPSBmdW5jdGlvbigpXG57XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9XG4gICAgXG4gICAgZm9yICh2YXIgeCA9IDc7IHggPj0gMDsgeC0tKVxuICAgIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCA4OyB5KyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBibG9ja3MgPSB0aGlzLmdldEJsb2Nrc0F0KHgsIHkpO1xuICAgICAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPiAwICYmIGJsb2Nrc1swXS5nZXRWYWwoKSA8IDI1NilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgaGl0UG9zID0gdGhpcy50cmFjZShibG9ja3NbMF0sIHgsIHksIDcsIHkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGhpdFBvcy54ICE9IHggfHwgaGl0UG9zLnkgIT0geSkgdGhpcy5tb3ZlZCsrO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpIGluIGJsb2NrcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suc2V0UG9zKGhpdFBvcy54LCBoaXRQb3MueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgX3RoaXMuZmluYWxTd2VlcCgpO1xuICAgIH0sIDE1MCk7XG59XG5cbi8vIGxlZ2FjeSBmdW5jdGlvblxuR2FtZS5wcm90b3R5cGUuZ2V0RnJlZVNwYWNlcyA9IGZ1bmN0aW9uKClcbntcbiAgICB2YXIgZnJlZVNwb3RzID0gW107XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCA4OyB4KyspXG4gICAge1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDg7IHkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJsb2NrcyA9IHRoaXMuZ2V0QmxvY2tzQXQoeCwgeSk7XG4gICAgICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA9PSAwKSBmcmVlU3BvdHMucHVzaCh7eDogeCwgeTogeX0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5HYW1lLnByb3RvdHlwZS5oYXNOZWlnaGJvcnMgPSBmdW5jdGlvbih4LCB5KVxue1xuICAgIHZhciBibG9jayA9IHRoaXMuZ2V0QmxvY2tzQXQoeCwgeSlbMF07XG5cbiAgICBpZiAoIWJsb2NrKSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciBibG9jazEgPSB0aGlzLmdldEJsb2Nrc0F0KHgrMSwgeSlbMF07XG4gICAgdmFyIGJsb2NrMiA9IHRoaXMuZ2V0QmxvY2tzQXQoeC0xLCB5KVswXTtcbiAgICB2YXIgYmxvY2szID0gdGhpcy5nZXRCbG9ja3NBdCh4LCB5KzEpWzBdO1xuICAgIHZhciBibG9jazQgPSB0aGlzLmdldEJsb2Nrc0F0KHgsIHktMSlbMF07XG5cbiAgICByZXR1cm4gKGJsb2NrMSA/IGJsb2NrMS5nZXRWYWwoKSA9PSBibG9jay5nZXRWYWwoKSA6IGZhbHNlKVxuICAgICAgICB8fCAoYmxvY2syID8gYmxvY2syLmdldFZhbCgpID09IGJsb2NrLmdldFZhbCgpIDogZmFsc2UpXG4gICAgICAgIHx8IChibG9jazMgPyBibG9jazMuZ2V0VmFsKCkgPT0gYmxvY2suZ2V0VmFsKCkgOiBmYWxzZSlcbiAgICAgICAgfHwgKGJsb2NrNCA/IGJsb2NrNC5nZXRWYWwoKSA9PSBibG9jay5nZXRWYWwoKSA6IGZhbHNlKTtcbn1cblxuR2FtZS5wcm90b3R5cGUuaXNHYW1lT3ZlciA9IGZ1bmN0aW9uKClcbntcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDg7IHgrKylcbiAgICB7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgODsgeSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh4LCB5KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc05laWdoYm9ycyh4LCB5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gZG8gYSBmaW5hbCBzd2VlcCBvZiB0aGUgYm9hcmQgdG8gY2xlYW4gdGhpbmdzIHVwXG4vLyBhbmQgdW5kbyBtZXJnaW5nIGFuaW1hdGlvbnNcbkdhbWUucHJvdG90eXBlLmZpbmFsU3dlZXAgPSBmdW5jdGlvbigpXG57XG4gICAgZm9yIChpIGluIHRoaXMuYmxvY2tzKSB7XG4gICAgICAgIHRoaXMuYmxvY2tzW2ldLnVucHVsc2UoKTtcbiAgICB9XG5cbiAgICB2YXIgZnJlZVNwb3RzID0gW107XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCA4OyB4KyspXG4gICAge1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDg7IHkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJsb2NrcyA9IHRoaXMuZ2V0QmxvY2tzQXQoeCwgeSk7XG4gICAgICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA9PSAwKSBmcmVlU3BvdHMucHVzaCh7eDogeCwgeTogeX0pO1xuICAgICAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPiAxKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvciAoaSBpbiBibG9ja3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gYmxvY2tzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PSAwKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jay5zZXRWYWwoYmxvY2suZ2V0VmFsKCkqMik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmxvY2suZ2V0VmFsKCkgPT0gMjU2KSB0aGlzLmFkZFNjb3JlKDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2suZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW92ZWQgPiAwKVxuICAgICAgICB0aGlzLnJhbmRvbVNwYXduKGZyZWVTcG90cyk7XG5cbiAgICBpZiAodGhpcy5ibG9ja3MubGVuZ3RoID09IDgqOCB8fCBmcmVlU3BvdHMubGVuZ3RoID09IDApXG4gICAge1xuICAgICAgICBpZiAodGhpcy5pc0dhbWVPdmVyKCkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZW92ZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubW92ZWQgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XG4iLCJcbkdhbWUgPSByZXF1aXJlKFwiLi9nYW1lXCIpXG5cbnZhciBnYW1lID0gbmV3IEdhbWUoKTtcblxuZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24oZSlcbntcbiAgICBzd2l0Y2goZS5rZXlDb2RlKVxuICAgIHtcbiAgICAgICAgLy8gdXBcbiAgICAgICAgY2FzZSAzODogLy8gYXJyb3dcbiAgICAgICAgY2FzZSA4NzogLy8gd1xuICAgICAgICBjYXNlIDczOiAvLyBpXG4gICAgICAgIGdhbWUubW92ZVVwKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIGRvd25cbiAgICAgICAgY2FzZSA0MDogLy8gYXJyb3dcbiAgICAgICAgY2FzZSA4MzogLy8gc1xuICAgICAgICBjYXNlIDc1OiAvLyBrXG4gICAgICAgIGdhbWUubW92ZURvd24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgICAgLy8gbGVmdFxuICAgICAgICBjYXNlIDM3OiAvLyBhcnJvd1xuICAgICAgICBjYXNlIDY1OiAvLyBhXG4gICAgICAgIGNhc2UgNzQ6IC8vIGpcbiAgICAgICAgZ2FtZS5tb3ZlTGVmdCgpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgICAvLyByaWdodFxuICAgICAgICBjYXNlIDM5OiAvLyBhcnJvd1xuICAgICAgICBjYXNlIDY4OiAvLyBkXG4gICAgICAgIGNhc2UgNzY6IC8vIGxcbiAgICAgICAgZ2FtZS5tb3ZlUmlnaHQoKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG59XG5cbmdhbWUuZG9tLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJyZXRyeVwiKVswXS5vbmNsaWNrID0gZnVuY3Rpb24oZSlcbntcbiAgICBnYW1lLnJlc2V0KCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuIl19

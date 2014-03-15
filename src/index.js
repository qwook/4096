
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

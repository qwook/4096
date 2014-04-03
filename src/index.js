
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

// credits to original 2048. this is something that I probably could have figured out but didn't have the time to.
if (window.navigator.msPointerEnabled) {
//Internet Explorer 10 style
this.eventTouchstart    = "MSPointerDown";
this.eventTouchmove     = "MSPointerMove";
this.eventTouchend      = "MSPointerUp";
} else {
this.eventTouchstart    = "touchstart";
this.eventTouchmove     = "touchmove";
this.eventTouchend      = "touchend";
}

game.dom.addEventListener(this.eventTouchstart, function (event)
{
    console.log("HI!")

    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches > 1) {
        return; // Ignore if touching with more than 1 finger
    }

    if (window.navigator.msPointerEnabled)
    {
        touchStartClientX = event.pageX;
        touchStartClientY = event.pageY;
    }
    else
    {
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();

});

game.dom.addEventListener(this.eventTouchmove, function (event)
{
    event.preventDefault();
});

game.dom.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches > 0)
    {
        return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled)
    {
        touchEndClientX = event.pageX;
        touchEndClientY = event.pageY;
    }
    else
    {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10)
    {
        // (right : left) : (down : up)
        absDx > absDy ? (dx > 0 ? game.moveRight() : game.moveLeft()) : (dy > 0 ? game.moveDown() : game.moveUp())
    }
});

game.dom.getElementsByClassName("retry")[0].onclick = function(e)
{
    game.reset();
    e.preventDefault();
}

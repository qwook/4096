
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

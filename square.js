function Square(radius)
{
  this.centerX = 0;
  this.centerY = 0;
  this.radius = radius;
  this.angle = 0;
  this.angleSpeed = 0.001;
  this.pointAngles = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2];
}

Square.prototype = {
  animate: function(t) {
    var canvas = $("canvas");
    var ctx = canvas.getContext("2d");
    var points = this.calculatePoints();
    var rect = this.findEnclosingRectangle(points);
    ctx.clearRect(rect[0][0], rect[0][1], rect[1][0] - rect[0][0], rect[1][1] - rect[0][1]);
    this.updateAngle(t);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    this.draw(ctx, points);
  },

  calculatePoints: function() {
    var points = [];
    for (var i = 0; i < this.pointAngles.length; ++i)
      points.push(this.toCartesian(this.angle + this.pointAngles[i]));
    points.push(points[0]);
    return points;
  },

  draw: function(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (i = 1; i < points.length; ++i)
      ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    ctx.closePath();
  },

  findEnclosingRectangle: function(points) {
    var minX = 1e10, minY = 1e10, maxX = -1e10, maxY = -1e10;
    for (var i = 0; i < points.length; ++i) {
      var pointX = points[i][0], pointY = points[i][1];
      minX = Math.min(minX, pointX);
      maxX = Math.max(maxX, pointX);
      minY = Math.min(minY, pointY);
      maxY = Math.max(maxY, pointY);
    }
    return [[minX - 2, minY - 2], [maxX + 2, maxY + 2]];
  },

  setCenter: function(centerX, centerY) {
    this.centerX = centerX;
    this.centerY = centerY;
  },

  toCartesian: function(angle) {
    return [this.centerX + this.radius * Math.cos(angle),
            this.centerY + this.radius * Math.sin(angle)];
  },

  updateAngle: function(t) {
    this.angle += this.angleSpeed * t;
    while (this.angle > Math.PI * 2)
      this.angle -= Math.PI * 2;
  }
};

var square = new Square(100);
var t0 = Date.now();

function step() {
  var t1 = Date.now();
  square.animate(t1 - t0);
  t0 = t1;
  webkitRequestAnimationFrame(step);
}

function renderCanvas()
{
  var canvas = $("canvas");
  var ctx = canvas.getContext("2d");

  square.setCenter(canvas.width / 2, canvas.height / 2);

  ctx.lineWidth = 1;
  ctx.strokeStyle="#000";
  var border = 3;
  ctx.strokeRect(border, border, canvas.width - border * 2, canvas.height - border * 2);
}

function updateCanvasSize()
{
  var canvas = $("canvas");
  canvas.height = document.body.clientHeight;
  canvas.width = document.body.clientWidth;
  renderCanvas();
}

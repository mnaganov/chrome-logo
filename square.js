function World()
{
  this.objects = [];
}

World.prototype = {
  addObject: function(object) {
    this.objects.push(object);
  },

  animate: function(canvas, t) {
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < this.objects.length; ++i) {
      this.objects[i].animate(canvas, t);
    }
  }
};

function Border(margin)
{
  this.margin = margin;
}

Border.prototype = {
  animate: function(canvas, t) {
    var context = canvas.getContext("2d");
    context.lineWidth = 1;
    context.strokeStyle="#000";
    var m = this.margin;
    context.strokeRect(m, m, canvas.width - m * 2, canvas.height - m * 2);
  }
};

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
  animate: function(canvas, t) {
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    var points = this.calculatePoints();
    this.updateAngle(t);
    var context = canvas.getContext("2d");
    context.lineWidth = 1;
    context.strokeStyle = "#000";
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (i = 1; i < points.length; ++i)
      context.lineTo(points[i][0], points[i][1]);
    context.stroke();
    context.closePath();
  },

  calculatePoints: function() {
    var points = [];
    for (var i = 0; i < this.pointAngles.length; ++i)
      points.push(this.toCartesian(this.angle + this.pointAngles[i]));
    points.push(points[0]);
    return points;
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

var world = new World();
world.addObject(new Square(100));
world.addObject(new Border(3));
var t0 = Date.now();

function step() {
  var t1 = Date.now();
  world.animate($("canvas"), t1 - t0);
  t0 = t1;
  webkitRequestAnimationFrame(step);
}

function updateCanvasSize()
{
  var canvas = $("canvas");
  canvas.height = document.body.clientHeight;
  canvas.width = document.body.clientWidth;
}

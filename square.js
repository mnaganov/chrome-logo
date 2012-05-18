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
  this.pointAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
}

Square.prototype = {
  animate: function(canvas, t) {
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.updateAngle(t);
    var points = this.calculatePoints(this.angle);
    points.push(points[0]);
    var context = canvas.getContext("2d");
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (i = 1; i < points.length; ++i)
      context.lineTo(points[i][0], points[i][1]);
    context.closePath();
    context.lineWidth = 1;
    context.strokeStyle = "#000";
    context.stroke();
    var grd = context.createLinearGradient(points[0][0], points[0][1], points[3][0], points[3][1]);
    grd.addColorStop(0, "#8ED6FF");
    grd.addColorStop(1, "#004CB3");
    context.fillStyle = grd;
    context.fill();
  },

  boundaryRect: function(points) {
    var minX = 1e10, minY = 1e10, maxX = -1e10, maxY = -1e10;
    for (var i = 0; i < points.length; ++i) {
      var point = points[i];
      minX = Math.min(minX, point[0]);
      maxX = Math.max(maxX, point[0]);
      minY = Math.min(minY, point[1]);
      maxY = Math.max(maxY, point[1]);
    }
    return [[minX, minY], [maxX, maxY]];
  },

  calculatePoints: function(angle) {
    var points = [];
    for (var i = 0; i < this.pointAngles.length; ++i)
      points.push(this.toCartesian(this.radius, angle + this.pointAngles[i]));
    return points;
  },

  isPointInside: function(x, y) {
    // Quick rough check.
    if (!this.isPointInsideRect(x, y, this.boundaryRect(this.calculatePoints(this.angle))))
      return false;

    // Precise check.
    x = x - this.centerX;
    y = this.centerY - y;
    var p = this.toCartesian(Math.sqrt(x * x + y * y), Math.atan2(y, x) + this.angle);
    return this.isPointInsideRect(p[0], p[1], this.boundaryRect(this.calculatePoints(0)));
  },

  isPointInsideRect: function(x, y, rect) {
    return x >= rect[0][0] && y >= rect[0][1] && x <= rect[1][0] && y <= rect[1][1];
  },

  radiusFromCenter: function(x, y) {
    x = x - this.centerX;
    y = this.centerY - y;
    return Math.sqrt(x * x + y * y);
  },

  toCartesian: function(radius, angle) {
    return [this.centerX + radius * Math.cos(angle),
            this.centerY + radius * Math.sin(angle)];
  },

  updateAngle: function(t) {
    this.angle += this.angleSpeed * t;
    while (this.angle > Math.PI * 2)
      this.angle -= Math.PI * 2;
  }
};

function Points(n, square)
{
  this.n = n;
  this.square = square;
  this.points = null;
  this.width = null;
  this.height = null;
}

Points.prototype = {
  animate: function(canvas, t) {
    if (!this.points || canvas.width != this.width || canvas.height != this.height)
      this.generatePoints(canvas.width, canvas.height);
    var context = canvas.getContext("2d");
    context.lineWidth = 1;
    for (var i = 0; i < this.points.length; ++i) {
      var x = this.points[i][0];
      var y = this.points[i][1];
      context.strokeStyle = this.square.isPointInside(x, y) ? "#f00" : "#00f";
      context.strokeRect(x, y, 1, 1);
    }
  },

  generatePoints: function(width, height) {
    this.width = width;
    this.height = height;
    this.points = new Array(this.n);
    for (var i = 0; i < this.n; ++i)
      this.points[i] = [Math.round(Math.random() * width),
                        Math.round(Math.random() * height)];
  }
};

function Handler()
{
  this.fingerDown = false;
  this.fingerX = null;
  this.fingerY = null;
  this.secondFingerDown = false;
  this.secondFingerX = null;
  this.secondFingerY = null;
}

Handler.prototype = {
  onTouchStart: function(event) {
    this.fingerDown = true;
    var finger = event.targetTouches[0];
    this.fingerX = finger.pageX;
    this.fingerY = finger.pageY;
  },

  onTouchMove: function(event) {
    var finger = event.targetTouches[0];
    this.fingerX = finger.pageX;
    this.fingerY = finger.pageY;
    if (event.touches.length > 1) {
      this.secondFingerDown = true;
      finger = event.targetTouches[1];
      this.secondFingerX = finger.pageX;
      this.secondFingerY = finger.pageY;
    }
    event.preventDefault();
  },

  onTouchEnd: function(event) {
    this.fingerDown = false;
    this.secondFingerDown = false;
  }
};

function Controller(square, handler)
{
  this.square = square;
  this.initialSpeed = square.angleSpeed;
  this.reducedSpeed = this.initialSpeed / 10;
  this.handler = handler;
}

Controller.prototype = {
  update: function() {
    if (this.handler.fingerDown) {
      if (this.square.isPointInside(this.handler.fingerX, this.handler.fingerY))
        this.square.angleSpeed = this.reducedSpeed;
      if (this.handler.secondFingerDown &&
          (this.square.isPointInside(this.handler.fingerX, this.handler.fingerY) ||
           this.square.isPointInside(this.handler.secondFingerX, this.handler.secondFingerY))) {
        var radius = Math.max(
          this.square.radiusFromCenter(this.handler.fingerX, this.handler.fingerY),
          this.square.radiusFromCenter(this.handler.secondFingerX, this.handler.secondFingerY));
        this.square.radius = radius;
      }
    } else
      this.square.angleSpeed = this.initialSpeed;
  }
};

function listen() {
  var element = $("canvas");
  element.addEventListener('touchstart', handler.onTouchStart.bind(handler));
  element.addEventListener('touchmove', handler.onTouchMove.bind(handler));
  element.addEventListener('touchend', handler.onTouchEnd.bind(handler));
}

function step() {
  var t1 = Date.now();
  world.animate($("canvas"), t1 - t0);
  t0 = t1;
  controller.update();
  webkitRequestAnimationFrame(step);
}

function updateCanvasSize()
{
  var canvas = $("canvas");
  canvas.height = document.body.clientHeight;
  canvas.width = document.body.clientWidth;
}

var world = new World();
world.addObject(new Square(100));
world.addObject(new Border(3));
//world.addObject(new Points(10000, world.objects[0]));
var t0 = Date.now();
var handler = new Handler();
var controller = new Controller(world.objects[0], handler);

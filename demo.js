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

function Logo(radius)
{
  this.centerX = 0;
  this.centerY = 0;
  this.angle = 0;
  this.angleSpeed = 0.0015;
  this.updateRadius(radius);
  this.segmentPointAngles = [-1 * Math.PI / 6, -1 * Math.PI / 2, -7 * Math.PI / 6, -5 * Math.PI / 6];
  this.segmentColors = ['#DE2126', '#F7CA10', '#4CB748'];
}

Logo.prototype = {
  animate: function(canvas, t) {
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.updateAngle(t);
    var context = canvas.getContext("2d");
    for (var s = 0; s < this.segmentColors.length; ++s) {
      var rotation = this.angle + s * 2 * Math.PI / 3;
      var points = this.calculatePoints(rotation);
      context.beginPath();
      context.moveTo(points[0][0], points[0][1]);
      for (var i = 1; i < points.length; ++i)
        context.lineTo(points[i][0], points[i][1]);
      context.arc(this.centerX, this.centerY, this.radius, this.segmentPointAngles[3] + rotation, this.segmentPointAngles[0] + rotation, false);
      context.closePath();
      context.fillStyle = this.segmentColors[s];
      context.fill();
    }

    context.beginPath();
    context.arc(this.centerX, this.centerY, this.innerRadius, 0, 2 * Math.PI, false);
    context.closePath();
    context.fillStyle = 'white';
    context.fill();

    context.beginPath();
    context.arc(this.centerX, this.centerY, this.innerRadius * 0.85, 0, 2 * Math.PI, false);
    context.closePath();
    context.fillStyle = '#2D78BA';
    context.fill();
  },

  calculatePoints: function(angle) {
    var points = [];
    for (var i = 0; i < this.segmentPointAngles.length; ++i)
      points.push(this.toCartesian(this.segmentPointRadiuses[i], angle + this.segmentPointAngles[i]));
    return points;
  },

  isPointInside: function(x, y) {
    return this.radiusFromCenter(x, y) <= this.radius;
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
  },

  updateRadius: function(radius) {
    this.radius = radius;
    this.innerRadius = radius * 0.45;
    this.segmentPointRadiuses = [radius, this.innerRadius, this.innerRadius, radius];
  }
};

function Points(n, logo)
{
  this.n = n;
  this.logo = logo;
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
      context.strokeStyle = this.logo.isPointInside(x, y) ? "#f0f" : "#00f";
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

function Controller(logo, handler)
{
  this.logo = logo;
  this.initialSpeed = logo.angleSpeed;
  this.reducedSpeed = this.initialSpeed / 10;
  this.handler = handler;
}

Controller.prototype = {
  update: function() {
    if (this.handler.fingerDown) {
      if (this.logo.isPointInside(this.handler.fingerX, this.handler.fingerY))
        this.logo.angleSpeed = this.reducedSpeed;
      else
        this.logo.angleSpeed = this.initialSpeed;
      if (this.handler.secondFingerDown &&
          (this.logo.isPointInside(this.handler.fingerX, this.handler.fingerY) ||
           this.logo.isPointInside(this.handler.secondFingerX, this.handler.secondFingerY))) {
        var radius = Math.max(
          this.logo.radiusFromCenter(this.handler.fingerX, this.handler.fingerY),
          this.logo.radiusFromCenter(this.handler.secondFingerX, this.handler.secondFingerY));
        this.logo.updateRadius(radius);
      }
    } else
      this.logo.angleSpeed = this.initialSpeed;
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
world.addObject(new Logo(200));
world.addObject(new Border(3));
// world.addObject(new Points(10000, world.objects[0]));
var t0 = Date.now();
var handler = new Handler();
var controller = new Controller(world.objects[0], handler);

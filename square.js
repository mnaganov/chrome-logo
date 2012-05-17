function renderCanvas()
{
  var canvas = $("canvas");
  var ctx = canvas.getContext("2d");
  ctx.lineWidth = 1;
  ctx.strokeStyle="#000";
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
}

function updateCanvasSize()
{
  var canvas = $("canvas");
  canvas.height = document.body.clientHeight;
  canvas.width = document.body.clientWidth;
}

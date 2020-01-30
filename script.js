window.onload = init;

var drawBoard, drawBoard_ctx;
var mouse = {x: 0, y: 0, down: false};
var drawings = [];
var currentDrawing = -1;

var fourier_iterations = 8;
var fourierx_coefficients = [];
var fouriery_coefficients = [];

function init(){
    var drawBoard = document.getElementById("drawboard");
    var db_ctx = drawBoard.getContext("2d");
    
    drawBoard.width = window.innerWidth;
    drawBoard.height = window.innerHeight;
    
//    db_ctx.lineWidth = 5;
//    db_ctx.lineJoin = 'round';
//    db_ctx.lineCap = 'round';
//    db_ctx.strokeStyle = '#FFFFFF';
    
    addEventListeners(drawBoard, db_ctx);
    window.requestAnimationFrame(draw);
}

function addEventListeners(drawBoard, db_ctx){
    var onPaint = function() {
        drawings[currentDrawing][0].push(mouse.x);
        drawings[currentDrawing][1].push(mouse.y);
    }

    drawBoard.addEventListener('mousemove', function(e) {
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
    }, false);

    drawBoard.addEventListener('mousedown', function(e){
        mouse.down = true;
        currentDrawing++;
        drawings.push([[], []]);
        drawings[currentDrawing][0].push(mouse.x);
        drawings[currentDrawing][1].push(mouse.y);
        drawBoard.addEventListener('mousemove', onPaint, false);
    }, false);

    drawBoard.addEventListener('mouseup', function() {
        mouse.down = false;
        drawBoard.removeEventListener('mousemove', onPaint, false);
        fourierx_coefficients.push(calc_fourier_coefficients(x));
        fouriery_coefficients.push(calc_fourier_coefficients(y));
        //console.log(fourierx_coefficients);
        //console.log(fouriery_coefficients);
    }, false);
}

function button_clicked(a) {
    a.classList.toggle("change");
    var graphs = document.getElementById("graphs");
    graphs.classList.toggle("change");
}

function draw_drawings(drawBoard, db_ctx){    
    db_ctx.lineWidth = 2;
    db_ctx.lineJoin = 'round';
    //db_ctx.lineCap = 'round';
    db_ctx.strokeStyle = '#383838';
    for(i in drawings){
        if(mouse.down && i == drawings.length - 1){
            db_ctx.strokeStyle = '#FFFFFF';
        }
        db_ctx.beginPath();
        db_ctx.moveTo(drawings[i][0][0], drawings[i][1][0]);
        for(j in drawings[i][0].slice(1)){
            db_ctx.lineTo(drawings[i][0][j], drawings[i][1][j]);
        }
        db_ctx.closePath();
        db_ctx.stroke();
    }
}

function calc_fourier_coefficients(f){
    var coefficients = [];
    var integral = 0;
    var dt = 0.01;
    for(t = -Math.PI; t <= Math.PI; t+=dt){
        integral += f(t)*dt;
    }
    var a_0 = -(1/(2*Math.PI))*integral;
    var a = [];
    var b = [];
    for(n = 0; n < fourier_iterations; n++){
        var integral = [0, 0];
        for(t = -Math.PI; t <= Math.PI; t+=dt){
            integral[0] += f(t)*Math.cos(n*t)*dt;
            integral[1] += f(t)*Math.sin(n*t)*dt;
        }
        a.push((1/Math.PI)*integral[0]);
        b.push((1/Math.PI)*integral[1]);
    }
    coefficients.push(a_0);
    coefficients.push(a);
    coefficients.push(b);
    return coefficients;
}

function calc_fourier(coefficients, x){
    var f = coefficients[0];
    for(n in coefficients[1]){
        f += coefficients[1][n]*Math.cos(n*x);
        f += coefficients[2][n]*Math.sin(n*x);
    }
    return f;
}

function x(t){
    var last = drawings.length - 1;
    var i = Math.floor(drawings[last][0].length*(t + Math.PI)/(2*Math.PI));
    return drawings[last][0][i];
}

function y(t){
    var last = drawings.length - 1;
    var i = Math.floor(drawings[last][1].length*(t + Math.PI)/(2*Math.PI));
    return drawings[last][1][i];
}

function draw_graphs(drawBoard, c_x, x_ctx, c_y, y_ctx){
    
    x_ctx.clearRect(0, 0, c_x.width, c_x.height);
    y_ctx.clearRect(0, 0, c_y.width, c_y.height);
    
    last = drawings.length - 1;
    
    x_ctx.strokeStyle = '#FFFFFF';
    x_ctx.lineWidth = 2;
    y_ctx.strokeStyle = '#FFFFFF';
    y_ctx.lineWidth = 2;
    
    x_ctx.beginPath();
    y_ctx.beginPath();

    var scale_x = drawBoard.width/c_x.height;
    var scale_y = drawBoard.height/c_y.height;
    
    x_ctx.moveTo(0, drawings[last][0][0]/scale_x);
    y_ctx.moveTo(0, drawings[last][1][0]/scale_y);
    for(i in drawings[last][0]){
        x_ctx.lineTo(i*(c_x.width/drawings[last][0].length), drawings[last][0][i]/scale_x);
        y_ctx.lineTo(i*(c_y.width/drawings[last][1].length), drawings[last][1][i]/scale_y);
    }
    
    x_ctx.lineTo(c_x.width, drawings[last][0][0]/scale_x);
    y_ctx.lineTo(c_y.width, drawings[last][1][0]/scale_y);
    
    x_ctx.stroke();
    y_ctx.stroke();
    
}

function draw_fourier(drawBoard, db_ctx, fourierx, fourierx_ctx, fouriery, fouriery_ctx){
    db_ctx.strokeStyle = '#FFFFFF';
    db_ctx.lineWidth = 2;
    for(i = 0; i < fourierx_coefficients.length; i++){
        db_ctx.beginPath();
        a = calc_fourier(fourierx_coefficients[i], -Math.PI)
        b = calc_fourier(fouriery_coefficients[i], -Math.PI)
        db_ctx.moveTo(a, b)
        dt = 0.01
        for(t = -Math.PI; t <= Math.PI; t += dt){
            db_ctx.lineTo(calc_fourier(fourierx_coefficients[i], t), calc_fourier(fouriery_coefficients[i], t));
        }
        db_ctx.closePath();
        db_ctx.stroke();
    }
    
    /////////////////////
    
    fourierx_ctx.clearRect(0, 0, fourierx.width, fourierx.height);
    fouriery_ctx.clearRect(0, 0, fouriery.width, fouriery.height);
    
    fourierx_ctx.strokeStyle = '#FFFFFF';
    fourierx_ctx.lineWidth = 2;
    fouriery_ctx.strokeStyle = '#FFFFFF';
    fouriery_ctx.lineWidth = 2;
    
    fourierx_ctx.beginPath();
    fouriery_ctx.beginPath();

    var scale_x = drawBoard.width/fourierx.height;
    var scale_y = drawBoard.height/fouriery.height;
    last = fourierx_coefficients.length - 1;
    
    dt = 0.01
    for(t = -Math.PI; t <= Math.PI; t += dt){
        fourierx_ctx.lineTo(fourierx.width*(t+Math.PI)/(2*Math.PI), calc_fourier(fourierx_coefficients[last], t)/scale_x);
        fouriery_ctx.lineTo(fouriery.width*(t+Math.PI)/(2*Math.PI), calc_fourier(fouriery_coefficients[last], t)/scale_y);
    }
    
    fourierx_ctx.stroke();
    fouriery_ctx.stroke();
}

var frame = 0;
function draw() {
    var drawBoard = document.getElementById("drawboard");
    var db_ctx = drawBoard.getContext("2d");
    
    db_ctx.clearRect(0, 0, drawBoard.width, drawBoard.height);
    draw_drawings(drawBoard, db_ctx);
    
    if(drawings.length >= 1){
        var c_x = document.getElementById("draw_x");
        var c_y = document.getElementById("draw_y");
        var fourierx = document.getElementById("fourier_x");
        var fouriery = document.getElementById("fourier_y");

        x_ctx = c_x.getContext("2d");
        y_ctx = c_y.getContext("2d");
        fourierx_ctx = fourierx.getContext("2d");
        fouriery_ctx = fouriery.getContext("2d");

        draw_graphs(drawBoard, c_x, x_ctx, c_y, y_ctx);
        
        if(fourierx_coefficients.length > 0){
            draw_fourier(drawBoard, db_ctx, fourierx, fourierx_ctx, fouriery, fouriery_ctx);
        }
        
    }
    
    frame++;
    window.requestAnimationFrame(draw);
}
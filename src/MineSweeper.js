include("Array2D.js");

/*************************
LEVEL 縦 横  地雷
  1    9  9   10 (12.3%) 
  2   16 16   40 (15.6%)
  3   16 30   99 (20.6%)
  4   30 30  199 (22.1%)
  5   40 40  399 (24.9%)
**************************/
var LEVEL =[[],
	[9, 9, 10],
	[16,16,40],
	[16,30,99],
	[30,30,199],
	[40,40,399]
	];





//何も無し
var NONE = 0;
//各数字
var BLOCK1 = 1;
var BLOCK2 = 2;
var BLOCK3 = 3;
var BLOCK4 = 4;
var BLOCK5 = 5;
var BLOCK6 = 6;
var BLOCK7 = 7;
var BLOCK8 = 8;
//未開封
var BLOCK = 9;
//旗
var FLAG = 10;
//地雷
var MINE = 11;
//地雷踏んだ時の奴
var MINE_RED = 12;
//旗が間違ってたときのやつ
var MINE_BATU = 13;



onload = function(){
	//loadImage();
};


function loadImage(){
	img.src = "image/image.png?" + new Date().getTime();
}



function MineSweeper(){
	
	//１マスの大きさ
	var size = 16;
	//難易度
	var level;// = 1;
	//行数
	var row;// = LEVEL[level][0];
	//列数
	var col;// = LEVEL[level][1];
	//地雷の数
	var mine;// = LEVEL[level][2];
	//残りのブロック数
	var remain;
	//中身
	var map;
	//開いたかどうか
	var openMap;
	//旗用
	var flagMap;
	
	
	//地雷を踏む、もしくはクリアするとtrue
	var gameOver;
	
	var canvas;
	var ctx;
	var face;
	var counter;
	var timer;
	
	var img = new Image();
	img.src = "image/image.png";
	
	var mouse = {
		xAxis: 0,
		yAxis: 0,
		x: 0,
		y: 0,
		left: false,
		right: false,
		target: null,
		
		log: function(){
			console.log("(" + this.x + ", " + this.y + ")");
		},
		
		set: function(x, y){
			this.xAxis = x;
			this.yAxis = y;
			this.x = Math.floor(x / size);
			this.y = Math.floor(y / size);
		}
		
	};
	
	
	
	this.write = function(){
		document.write(
				'<div id="main">' +
				'<div id="head">' +
				'<span id="counter">Mine: 0</span>' +
				'<input type="button" value="　(^-^)　" id="face" />' +
				'<span id="timer">Time: 0</span>' +
				'</div>' +
				'<div>' +
				'<img id="title" src="image/title.png" />' +
				'<canvas id="canvas" style="position: relative; display: none;"></canvas>' +
				'</div>' +
				'<div id="foot">' +
				'<input type="button" value="Level 1" id="Level 1" />' +
				'<input type="button" value="Level 2" id="Level 2" />' +
				'<input type="button" value="Level 3" id="Level 3" />' +
				'<input type="button" value="Level 4" id="Level 4" />' +
				'<input type="button" value="Level 5" id="Level 5" style="display: none;" />' +
				'</div>' +
				'<div id="log"></div>' +
				'</div>'
		);
		
		canvas = document.getElementById("canvas");
		if(!canvas || !canvas.getContext){
			return false;
		}
		ctx = canvas.getContext("2d");
		
		
		document.getElementById("Level 1").onclick = function(){
			init(1);
		};
		document.getElementById("Level 2").onclick = function(){
			init(2);
		};
		document.getElementById("Level 3").onclick = function(){
			init(3);
		};
		document.getElementById("Level 4").onclick = function(){
			init(4);
		};
		document.getElementById("Level 5").onclick = function(){
			init(5);
		};
		window.onmousemove = function(e){
			mouse.set(e.layerX, e.layerY);
			if(e.layerX == undefined) mouse.set(e.offsetX, e.offsetY);
			mouse.target = e.target;
			update();
			//log(e);
		};
		window.onmousedown = function(e){
			if(e.target.id != "canvas") return;
			if(e.button == 0){
				mouse.left = true;
			}
			if(e.button == 2){
				mouse.right = true;
			}
			update();
			//log(e);
		};
		window.onmouseup = function(e){
			if(e.button == 0){
				mouse.left = false;
			}else if(e.button == 2){
				mouse.right = false;
			}
			update();
			//log(e);
		};
		//右クリック無効
		window.oncontextmenu = function(e){
			return false;
		};
		//Chrome対策
		document.onmousedown = function(e){
			return false;
		};
		canvas.onmousemove = function(e){
			
		};
		canvas.onmousedown = function(e){
			if(e.button == 2 && !mouse.left){
				flag(mouse.x, mouse.y);
			}
		};
		canvas.onmouseup = function(e){
			if(mouse.left && !mouse.right){
				open(mouse.x, mouse.y);
			}else if(mouse.left && mouse.left){
				checkAround(mouse.x, mouse.y);
			}
		};
		
		face = document.getElementById("face");
		face.onclick = function(){
			if(canvas.style.display != "none"){
				init();
			}
		};
		
		counter = new Counter();
		timer = new Timer();
		
		
	};
	
	
	
	function init(newLevel){
		if(newLevel != undefined) level = newLevel;
		row = LEVEL[level][0];
		col = LEVEL[level][1];
		mine = LEVEL[level][2];
		remain = col * row - mine;
		canvas.width = col * size;
		canvas.height = row * size;
		map = Array2D(col, row);
		openMap = Array2D(col, row, false);
		flagMap = Array2D(col, row, false);
		pushMap = Array2D(col, row, false);
		gameOver = false;
		
		document.getElementById("title").style.display = "none";
		canvas.style.display = "inline";
		counter.init();
		timer.reset();
		create();
		
		draw();
		
	}
	
	
	
	function create(){
		var rng = new Array(col * row);
		for(var i = 0; i < col * row; i++){
			rng[i] = (i < mine) ? 1 : 0;
		}
		rng.random();
		var temp;
		for(var y = 0; y < row; y++){
			for(var x = 0; x < col; x++){
				if(rng[x + y * col] == 0){
					temp =
						get(x - 1, y - 1) + get(x    , y - 1) + get(x + 1, y - 1) +
						get(x - 1, y    ) +                   + get(x + 1, y    ) +
						get(x - 1, y + 1) + get(x    , y + 1) + get(x + 1, y + 1);
				}else{
					temp = MINE;
				}
					map[x][y] = temp;
			}
		}
		
		
		
		function get(x, y){
			if(x < 0 || col <= x) return 0;
			if(y < 0 || row <= y) return 0;
			return rng[x + y * col];
		}
	}
	
	
	
	function update(){
		if(gameOver) return;
		face.value = "　(^-^)　";
		if(mouse.left) face.value = "　(^o^)　";
		
		draw();
	}
	
	
	
	function draw(){
		var type;
		for(var y = 0; y < row; y++){
			for(var x = 0; x < col; x++){
				if(!openMap[x][y]){
					type = BLOCK;
					if(flagMap[x][y]) type = FLAG;
				}else{
					type = map[x][y];
					if(flagMap[x][y]){
						type = FLAG;
						if(map[x][y] != MINE) type = MINE_BATU;
					}
				}
				ctx.drawImage(img, (type % 4) * size, Math.floor(type / 4) * size, size , size, x * size, y * size, size, size);
			}
		}
		
		if(mouse.target.id != "canvas") return;
		var x = mouse.x;
		var y = mouse.y;
		if(mouse.left){
			push(x, y);
			if(mouse.right){
				push(x - 1, y - 1); push(x    , y - 1); push(x + 1, y - 1);
				push(x - 1, y    );                     push(x + 1, y    );
				push(x - 1, y + 1); push(x    , y + 1); push(x + 1, y + 1);
			}
		}
		
		
	}
	
	
	
	function push(x, y){
		if(x < 0 || col <= x) return;
		if(y < 0 || row <= y) return;
		if(openMap[x][y]) return;
		if(flagMap[x][y]) return;
		var type = NONE;
		ctx.drawImage(img, (type % 4) * size, Math.floor(type / 4) * size, size , size, x * size, y * size, size, size);
	}
	
	
	
	function open(x, y){
		if(x < 0 || col <= x) return;
		if(y < 0 || row <= y) return;
		if(openMap[x][y]) return;
		if(flagMap[x][y]) return;
		if(gameOver) return;
		
		timer.start();
		
		if(map[x][y] == MINE){
			failed(x, y);
			return;
		}
		openMap[x][y] = true;
		if(map[x][y] == NONE){
			openAround(x, y);
		}
		remain--;
		if(remain == 0){
			clear();
		}
	}
	
	
	
	function openAround(x, y){
		open(x - 1, y - 1); open(x, y - 1); open(x + 1, y - 1);
		open(x - 1, y    );                 open(x + 1, y    );
		open(x - 1, y + 1); open(x, y + 1); open(x + 1, y + 1);
	}
	
	
	
	function checkAround(x, y){
		if(flagMap[x][y]) return;
		if(!openMap[x][y]) return;
		var sum =
			getFlag(x - 1, y - 1) + getFlag(x, y - 1) + getFlag(x + 1, y - 1) +
			getFlag(x - 1, y    ) +                   + getFlag(x + 1, y    ) +
			getFlag(x - 1, y + 1) + getFlag(x, y + 1) + getFlag(x + 1, y + 1);
		if(sum == map[x][y]) openAround(x, y);
		
		
		function getFlag(x, y){
			if(x < 0 || col <= x) return 0;
			if(y < 0 || row <= y) return 0;
			if(!flagMap.get(x, y)) return 0;
			return 1;
		}
	}
	
	
	
	function clear(){
		gameOver = true;
		face.value = "＜(^o^)／";
		timer.stop();
		for(var y = 0; y < row; y++){
			for(var x = 0; x < col; x++){
				if(map[x][y] == MINE) flagMap[x][y] = true;
			}
		}
		draw();
	}
	
	
	function failed(x, y){
		gameOver = true;
		face.value = "＼(^o^)／";
		timer.stop();
		map[x][y] = MINE_RED;
		openMap = Array2D(col, row, true);
		draw();
	}
	
	
	
	function flag(x, y){
		if(openMap[x][y]) return;
		flagMap[x][y] = !flagMap[x][y];
		if(flagMap[x][y]){
			counter.decrement();
		}else{
			counter.increment();
		}
	}
	
	
	
	function Counter(){
		var count = mine;
		
		this.init = function(){
			count = mine;
			update();
		};
		
		this.increment = function(){
			count++;
			update();
		};
		
		this.decrement = function(){
			count--;
			update();
		};
		
		function update(){
			document.getElementById("counter").innerHTML = "Mine: " + count;
		}
	}
	
	
	
	function Timer(){
		var time = 0;
		var timer = null;
		var timerID = null;
		
		this.start = function(){
			if(timerID != null) return;
			timer = document.getElementById("timer");
			timerID = setInterval(function(){update();}, 1000);
		};
		
		this.stop = stop;
		function stop(){
			clearTimeout(timerID);
			timerID = null;
		};
		
		this.reset = function(){
			stop();
			time = -1;
			update();
		};
		
		function update(){
			time++;
			document.getElementById("timer").innerHTML = "Time: " + time;
			
		}
		
	}
	
	
	
	function log(e){
		printf("");
		println("target: " + e.target);
		println("type: " + e.type);
		println("screenX: " + e.screenX);
		println("screenY:" + e.screenY);
		println("pageX: " + e.pageX);
		println("pageY: " + e.pageY);
		println("layerX:" + e.layerX);
		println("layerY:" + e.layerY);
		println("clientX: " + e.clientX);
		println("clientY: " + e.clientY);
		println("offsetX: " + e.offsetX);
		println("offsetY: " + e.offsetY);
		
		println("xAxis: " + mouse.x);
		println("yAxis: " + mouse.y);
		println("Left: " + mouse.left);
		println("Right: " + mouse.right);
		println("x: " + mouse.x);
		println("y: " + mouse.y);
		
		println(e.target.id);
	}
	
	
	
}






function print(text){
	document.getElementById("log").innerHTML += text;
}

function println(text){
	document.getElementById("log").innerHTML += text + "<br>";
}

function printf(text){
	document.getElementById("log").innerHTML = text;
}



Array.prototype.random = function(){
    var i = this.length;
    while(i){
        var j = Math.floor(Math.random()*i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
};



function include(astrFile){
	var script = document.createElement('script');
	script.src = 'src/' + astrFile;
	script.type = 'text/javascript';
	document.getElementsByTagName('head').item(0).appendChild(script);
}
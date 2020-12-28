var x_start = 0;
var y_start = 0;
const TILE_SIZE = 20;
const SPEED = 20;
var food_eaten = null;
const GRID_POSITIONS = [];
var score = 0;
var game_over = false;

function make_grid() {
  for(i=0; i<400; i+=20) {
    for(j=0; j<400; j+=20) {
      noStroke();
      fill('#789984');
      rect(i, j, 20, 20);
      var tile = [];
      tile.push(i);
      tile.push(j);
      GRID_POSITIONS.push(tile);
    }
  }
}

class Segment {
  constructor(x, y) {
    this.x_pos = x;
    this.y_pos = y;
    this.prev_x = null;
    this.prev_y = null;
  }

  update(x, y) {
    // save the current coords as previous coords
    this.prev_x = this.x_pos;
    this.prev_y = this.y_pos;
    // update the current coords to new coords
    this.x_pos = x;
    this.y_pos = y;
  }

  draw() {
    fill('#324037');
    rect(this.x_pos, this.y_pos, TILE_SIZE);
  }
}

class Snake {
  constructor(start_seg) {
    this.body = [start_seg];
    this.dead = false;
  }

  add_segment() {
    var end_seg = this.body[this.body.length-1];
    var new_seg = new Segment(end_seg.prev_x, end_seg.prev_y);
    this.body.push(new_seg);
  }

  dead_check() {
    for (var i=1; i < this.body.length; i++) {
      if (this.body[0].x_pos == this.body[i].x_pos && this.body[0].y_pos == this.body[i].y_pos) {
        this.dead = true;
        return true;
      }
    }
  }

  update(x, y) {
    // update the head first
    this.body[0].update(x, y);
    // update the remaining segments starting with the 2nd element
    if (this.body.length > 1) {
      for(var i=1; i < this.body.length; i++) {
        this.body[i].update(this.body[i-1].prev_x, this.body[i-1].prev_y);
      }
    }
  }

  draw() {
    // iterate over the body segments and draw each one
    for (var seg of this.body) {
      seg.draw();
    }
    
    if (this.dead == true) {
      fill('black');
      rect(this.body[0].x_pos, this.body[0].y_pos, TILE_SIZE);
    }
  }
}

class Food {
  constructor(x, y) {
    this.x_pos = x;
    this.y_pos = y;
  }

  move(snake) {
    var new_location = false;
    while (new_location == false) {
      var random_pos = GRID_POSITIONS[Math.floor(Math.random() * GRID_POSITIONS.length)];
      this.x_pos = random_pos[0];
      this.y_pos = random_pos[1];
      for (const segment of snake.body) {
        if (this.x_pos == segment.x_pos && this.y_pos == segment.y_pos) {
          new_location = false;
        } else {
          // if we are the last segment and in the else block then the new location is valid
          if (segment.x_pos == snake.body[snake.body.length - 1].x_pos && segment.y_pos == snake.body[snake.body.length - 1].y_pos) {
            new_location = true;
          }
        }
      }
    }
  }

  draw() {
    fill('yellow');
    rect(this.x_pos, this.y_pos, TILE_SIZE);
  }
}

function get_direction(x, y) {
  // apply new direction
  if (keyCode == DOWN_ARROW) {
    y+=SPEED;
  } else if (keyCode == UP_ARROW) {
    y-=SPEED;
  } else if (keyCode == LEFT_ARROW) {
    x-=SPEED;
  } else if (keyCode == RIGHT_ARROW) {
    x+=SPEED;
  }
  // check for out of bounds
  if (x < 0) {
    x = 380;
  } else if (x > 380) {
    x = 0;
  } else if (y < 0) {
    y = 380;
  } else if (y > 380) {
    y = 0;
  }
  var coords = [x,y];
  return coords;
}

var head = new Segment(x_start, y_start);
var snake = new Snake(head);
var food = new Food(400/2, 400/2);

function setup() {
  var canvas = createCanvas(400, 400);
  canvas.parent('canvasContainer');
}

function update() {
  // snake update via direction of the head
  var new_coords = get_direction(snake.body[0].x_pos, snake.body[0].y_pos);
  snake.update(new_coords[0], new_coords[1]);
  // check to see if snake ate itself
  game_over = snake.dead_check();
  if (game_over == true) {
    noLoop();
    var restart = document.createElement("button");
    restart.textContent = 'RESTART';
    restart.onclick = function(){location.reload()};
    var score_panel = document.getElementById("score");
    score_panel.appendChild(restart);
  }
  // check to see if snake ate food
  if (snake.body[0].x_pos == food.x_pos && snake.body[0].y_pos == food.y_pos) {
    snake.add_segment();
    food.move(snake);
    score += 1;
  }
}

function draw() {
  frameRate(10);
  update();
  make_grid();
  food.draw();
  snake.draw();
  document.getElementById("score_num").innerHTML = score;
}
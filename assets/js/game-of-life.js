(function () {
  var GRID_SIZE = 64;
  var CELL_SIZE = 8;
  var LIVE_CELL_PROBABILITY = 0.22;
  var STEP_INTERVAL_MS = 120;
  var STAGNANT_THRESHOLD = 12;

  var canvas = document.getElementById("game-of-life");

  if (!canvas || !canvas.getContext) {
    return;
  }

  var context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    return;
  }

  var current = new Uint8Array(GRID_SIZE * GRID_SIZE);
  var next = new Uint8Array(GRID_SIZE * GRID_SIZE);
  var stagnantGenerations = 0;

  context.imageSmoothingEnabled = false;

  function indexFor(row, column) {
    return row * GRID_SIZE + column;
  }

  function seedBoard() {
    for (var i = 0; i < current.length; i += 1) {
      current[i] = Math.random() < LIVE_CELL_PROBABILITY ? 1 : 0;
      next[i] = 0;
    }

    stagnantGenerations = 0;
  }

  function countNeighbors(row, column) {
    var total = 0;

    for (var rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (var columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (rowOffset === 0 && columnOffset === 0) {
          continue;
        }

        var wrappedRow = (row + rowOffset + GRID_SIZE) % GRID_SIZE;
        var wrappedColumn = (column + columnOffset + GRID_SIZE) % GRID_SIZE;
        total += current[indexFor(wrappedRow, wrappedColumn)];
      }
    }

    return total;
  }

  function step() {
    var population = 0;
    var changed = false;

    for (var row = 0; row < GRID_SIZE; row += 1) {
      for (var column = 0; column < GRID_SIZE; column += 1) {
        var cellIndex = indexFor(row, column);
        var alive = current[cellIndex] === 1;
        var neighbors = countNeighbors(row, column);
        var nextValue = 0;

        if (alive && (neighbors === 2 || neighbors === 3)) {
          nextValue = 1;
        } else if (!alive && neighbors === 3) {
          nextValue = 1;
        }

        next[cellIndex] = nextValue;
        population += nextValue;

        if (nextValue !== current[cellIndex]) {
          changed = true;
        }
      }
    }

    if (!changed) {
      stagnantGenerations += 1;
    } else {
      stagnantGenerations = 0;
    }

    var buffer = current;
    current = next;
    next = buffer;

    if (population === 0 || stagnantGenerations >= STAGNANT_THRESHOLD) {
      seedBoard();
      population = 1;
    }

    return population;
  }

  function draw() {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";

    for (var row = 0; row < GRID_SIZE; row += 1) {
      for (var column = 0; column < GRID_SIZE; column += 1) {
        if (current[indexFor(row, column)] === 1) {
          context.fillRect(
            column * CELL_SIZE,
            row * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      }
    }
  }

  seedBoard();
  draw();

  window.setInterval(function () {
    step();
    draw();
  }, STEP_INTERVAL_MS);
})();

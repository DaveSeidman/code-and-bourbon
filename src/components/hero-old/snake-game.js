// public/snake-game.js
import bourbonImage from '../../assets/images/bourbon2.png';

export default function SnakeGame(canvas) {
  const gl = canvas.getContext('webgl');
  if (!gl) return alert('WebGL not supported');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const boxSize = 48;

  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  resizeCanvas();

  const cols = Math.floor(canvas.width / boxSize);
  const rows = Math.floor(canvas.height / boxSize);

  let snake = [
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
  ];
  let food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
  let dir = { x: 1, y: 0 };
  let last = 0;
  let speed = 240;
  let drunkenness = 0;

  const image = new Image();
  image.src = bourbonImage;
  let texture;

  image.onload = () => {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };

  document.addEventListener('keydown', (e) => {
    // e.preventDefault();
    if (e.key === 'ArrowUp' && dir.y === 0) dir = { x: 0, y: 1 };
    if (e.key === 'ArrowDown' && dir.y === 0) dir = { x: 0, y: -1 };
    if (e.key === 'ArrowLeft' && dir.x === 0) dir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && dir.x === 0) dir = { x: 1, y: 0 };
  });

  function renderSquare(x, y, color) {
    const sx = ((x * boxSize) / canvas.width) * 2 - 1;
    const sy = ((y * boxSize) / canvas.height) * 2 - 1;
    const sX = (boxSize / canvas.width) * 2;
    const sY = (boxSize / canvas.height) * 2;

    const vertices = new Float32Array([
      sx,
      sy,
      sx + sX,
      sy,
      sx + sX,
      sy + sY,
      sx,
      sy,
      sx + sX,
      sy + sY,
      sx,
      sy + sY,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 a; void main() { gl_Position = vec4(a, 0, 1); }');
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fs,
      `precision mediump float; void main() { gl_FragColor = vec4(${color}, 1); }`,
    );
    gl.compileShader(fs);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const a = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function renderImage(x, y) {
    if (!texture) return;

    const sx = ((x * boxSize) / canvas.width) * 2 - 1;
    const sy = ((y * boxSize) / canvas.height) * 2 - 1;
    const sX = (boxSize / canvas.width) * 2;
    const sY = (boxSize / canvas.height) * 2;

    const vertices = new Float32Array([
      sx,
      sy,
      0,
      0,
      sx + sX,
      sy,
      1,
      0,
      sx + sX,
      sy + sY,
      1,
      1,
      sx,
      sy,
      0,
      0,
      sx + sX,
      sy + sY,
      1,
      1,
      sx,
      sy + sY,
      0,
      1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vs,
      'attribute vec2 a; attribute vec2 uv; varying vec2 v; void main() { gl_Position = vec4(a, 0, 1); v = uv; }',
    );
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fs,
      'precision mediump float; varying vec2 v; uniform sampler2D t; void main() { gl_FragColor = texture2D(t, v); }',
    );
    gl.compileShader(fs);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const a = gl.getAttribLocation(prog, 'a');
    const uv = gl.getAttribLocation(prog, 'uv');
    const texLoc = gl.getUniformLocation(prog, 't');

    gl.enableVertexAttribArray(a);
    gl.enableVertexAttribArray(uv);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(texLoc, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function renderBorder() {
    const lineThickness = 0.0025; // thickness in NDC units (~2px)

    const program = gl.createProgram();
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(
      vs,
      `
      attribute vec2 a;
      void main() {
        gl_Position = vec4(a, 0.0, 1.0);
      }
    `,
    );
    gl.compileShader(vs);

    gl.shaderSource(
      fs,
      `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.671, 0.714, 0.020, 1.0);
      }
    `,
    );
    gl.compileShader(fs);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const lines = [];

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      const x = ((i * boxSize) / canvas.width) * 2 - 1;
      lines.push(
        x - lineThickness,
        -1,
        x + lineThickness,
        -1,
        x + lineThickness,
        1,
        x - lineThickness,
        -1,
        x + lineThickness,
        1,
        x - lineThickness,
        1,
      );
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = ((i * boxSize) / canvas.height) * 2 - 1;
      lines.push(
        -1,
        y - lineThickness,
        1,
        y - lineThickness,
        1,
        y + lineThickness,
        -1,
        y - lineThickness,
        1,
        y + lineThickness,
        -1,
        y + lineThickness,
      );
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(program, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, lines.length / 2);
  }

  function renderVignette() {
    const vertices = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vs,
      `
      attribute vec2 a;
      varying vec2 vUv;
      void main() {
        vUv = a * 0.5 + 0.5;
        gl_Position = vec4(a, 0.0, 1.0);
      }
    `,
    );
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fs,
      `
      precision mediump float;
      varying vec2 vUv;
      void main() {
        float dist = distance(vUv, vec2(0.5));
        float vignette = smoothstep(0.5, 0.9, dist);
        gl_FragColor = vec4(0.0, 0.0, 0.0, vignette * 0.8);
      }
    `,
    );
    gl.compileShader(fs);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const loc = gl.getAttribLocation(program, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function loop(t) {
    if (t - last > speed) {
      last = t;

      // Drunkenness increases random turning
      const drunkChance = Math.min(0.025 + 0.01 * drunkenness, 0.2);
      if (Math.random() < drunkChance) {
        const dirs = [
          { x: 0, y: 1 }, // down
          { x: 1, y: 0 }, // right
          { x: 0, y: -1 }, // up
          { x: -1, y: 0 }, // left
        ];
        const currentIndex = dirs.findIndex((d) => d.x === dir.x && d.y === dir.y);
        const turn = Math.random() < 0.5 ? -1 : 1;
        const newDir = dirs[(currentIndex + turn + 4) % 4];

        const peek = {
          x: (snake[0].x + newDir.x + cols) % cols,
          y: (snake[0].y + newDir.y + rows) % rows,
        };
        if (!snake.some((s) => s.x === peek.x && s.y === peek.y)) {
          dir = newDir;
        }
      }

      const head = {
        x: (snake[0].x + dir.x + cols) % cols,
        y: (snake[0].y + dir.y + rows) % rows,
      };

      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        snake = [
          { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
          { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
          { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
        ];
        dir = { x: 1, y: 0 };
        food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
        speed = 240;
        drunkenness = 0;
      } else {
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
          speed = Math.max(60, speed - 8);
          drunkenness++;
        } else {
          snake.pop();
        }
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    renderImage(food.x, food.y);
    snake.forEach((s) => renderSquare(s.x, s.y, '0.204, 0.212, 0.012'));
    renderBorder();
    renderVignette();

    requestAnimationFrame(loop);
  }

  gl.clearColor(0.655, 0.69, 0.02, 1.0);
  requestAnimationFrame(loop);
}

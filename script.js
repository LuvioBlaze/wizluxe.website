(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const COLORS = ['#ff4d6d','#ffd23f','#3ddc97','#3db2ff','#b983ff','#ff9f45'];

  const R = 17;                     // bubble radius
  const COLS = 10;                  // columns on even rows
  const rowHeight = R * Math.sqrt(3);
  const W = R*2*COLS + 4;
  const H = 640;
  const gameOverY = H - 120;
  const shooterY = H - 46;

  canvas.width = W;
  canvas.height = H;

  let grid = [];        // grid[row][col] = color string or null
  let score = 0;
  let level = 1;
  let shootBubble = null;
  let nextColor = null;
  let angle = -Math.PI/2;
  let particles = [];
  let running = true;
  let animId = null;

  const scoreEl = document.getElementById('scoreVal');
  const levelEl = document.getElementById('levelVal');
  const nextBubbleEl = document.getElementById('nextBubble');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');

  function cellPos(row,col){
    const y = R + row*rowHeight;
    const x = R + col*2*R + (row%2===1 ? R : 0);
    return {x,y};
  }

  function colsInRow(row){
    return row%2===1 ? COLS-1 : COLS;
  }

  function neighbors(row,col){
    const res = [];
    if(row%2===0){
      res.push([row,col-1],[row,col+1],
                [row-1,col-1],[row-1,col],
                [row+1,col-1],[row+1,col]);
    } else {
      res.push([row,col-1],[row,col+1],
                [row-1,col],[row-1,col+1],
                [row+1,col],[row+1,col+1]);
    }
    return res.filter(([r,c])=> r>=0 && c>=0 && c<colsInRow(r));
  }

  function ensureRow(row){
    while(grid.length <= row) grid.push(new Array(colsInRow(grid.length)).fill(null));
  }

  function initGrid(fillRows){
    grid = [];
    for(let r=0;r<fillRows;r++){
      ensureRow(r);
      for(let c=0;c<colsInRow(r);c++){
        grid[r][c] = COLORS[Math.floor(Math.random()*Math.min(5,COLORS.length))];
      }
    }
    ensureRow(fillRows+8);
  }

  function colorsInPlay(){
    const s = new Set();
    for(const row of grid) for(const cell of row) if(cell) s.add(cell);
    if(s.size===0) COLORS.forEach(c=>s.add(c));
    return Array.from(s);
  }

  function pickNextColor(){
    const avail = colorsInPlay();
    return avail[Math.floor(Math.random()*avail.length)];
  }

  function spawnShooter(){
    shootBubble = {
      x: W/2, y: shooterY, color: nextColor, vx:0, vy:0, moving:false
    };
    nextColor = pickNextColor();
    nextBubbleEl.style.background = radialShade(nextColor);
  }

  function radialShade(color){
    return `radial-gradient(circle at 35% 30%, ${lighten(color,55)}, ${color} 65%, ${darken(color,25)})`;
  }
  function lighten(hex,amt){ return shade(hex,amt); }
  function darken(hex,amt){ return shade(hex,-amt); }
  function shade(hex,amt){
    let c = hex.replace('#','');
    let num = parseInt(c,16);
    let r = Math.min(255,Math.max(0,(num>>16)+amt));
    let g = Math.min(255,Math.max(0,((num>>8)&0xff)+amt));
    let b = Math.min(255,Math.max(0,(num&0xff)+amt));
    return `rgb(${r},${g},${b})`;
  }

  function drawBubble(x,y,color,scale=1){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    const grad = ctx.createRadialGradient(-R*0.35,-R*0.4,R*0.2,0,0,R);
    grad.addColorStop(0, lighten(color,70));
    grad.addColorStop(0.55, color);
    grad.addColorStop(1, darken(color,30));
    ctx.beginPath();
    ctx.arc(0,0,R-1,0,Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-R*0.35,-R*0.4,R*0.28,R*0.16,-0.6,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
    ctx.restore();
  }

  function drawGrid(){
    for(let r=0;r<grid.length;r++){
      for(let c=0;c<colsInRow(r);c++){
        const color = grid[r][c];
        if(color){
          const {x,y} = cellPos(r,c);
          if(y - R > H) continue;
          drawBubble(x,y,color);
        }
      }
    }
  }

  function drawShooter(){
    ctx.save();
    ctx.beginPath();
    ctx.arc(W/2, shooterY, R+8, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();
    ctx.restore();

    const len = 220;
    let dx = Math.cos(angle), dy = Math.sin(angle);
    ctx.save();
    ctx.setLineDash([6,8]);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W/2, shooterY);
    ctx.lineTo(W/2 + dx*len, shooterY + dy*len);
    ctx.stroke();
    ctx.restore();

    if(shootBubble) drawBubble(shootBubble.x, shootBubble.y, shootBubble.color);
  }

  function drawGameOverLine(){
    ctx.save();
    ctx.setLineDash([4,6]);
    ctx.strokeStyle = 'rgba(255,77,109,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, gameOverY);
    ctx.lineTo(W, gameOverY);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles(){
    for(const p of particles){
      ctx.save();
      ctx.globalAlpha = Math.max(p.life,0);
      drawBubble(p.x,p.y,p.color, p.life);
      ctx.restore();
    }
  }

  function updateParticles(dt){
    for(const p of particles){
      p.x += p.vx*dt;
      p.y += p.vy*dt;
      p.vy += 400*dt;
      p.life -= dt*1.6;
    }
    particles = particles.filter(p=>p.life>0);
  }

  function popEffect(row,col,color){
    const {x,y} = cellPos(row,col);
    for(let i=0;i<6;i++){
      const a = Math.random()*Math.PI*2;
      const speed = 60+Math.random()*90;
      particles.push({x,y,vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, color, life:1});
    }
  }

  function neighborsSameColor(row,col,color,visited){
    const stack = [[row,col]];
    const group = [];
    visited.add(row+','+col);
    while(stack.length){
      const [r,c] = stack.pop();
      group.push([r,c]);
      for(const [nr,nc] of neighbors(r,c)){
        const key = nr+','+nc;
        if(!visited.has(key) && grid[nr] && grid[nr][nc]===color){
          visited.add(key);
          stack.push([nr,nc]);
        }
      }
    }
    return group;
  }

  function removeFloating(){
    const visited = new Set();
    const stack = [];
    for(let c=0;c<colsInRow(0);c++){
      if(grid[0][c]){ stack.push([0,c]); visited.add('0,'+c); }
    }
    while(stack.length){
      const [r,c] = stack.pop();
      for(const [nr,nc] of neighbors(r,c)){
        const key = nr+','+nc;
        if(!visited.has(key) && grid[nr] && grid[nr][nc]){
          visited.add(key);
          stack.push([nr,nc]);
        }
      }
    }
    let removed = 0;
    for(let r=0;r<grid.length;r++){
      for(let c=0;c<colsInRow(r);c++){
        if(grid[r][c] && !visited.has(r+','+c)){
          popEffect(r,c,grid[r][c]);
          grid[r][c] = null;
          removed++;
        }
      }
    }
    return removed;
  }

  function checkGridEmpty(){
    for(const row of grid) for(const cell of row) if(cell) return false;
    return true;
  }

  function handleLanding(row,col,color){
    ensureRow(row+2);
    grid[row][col] = color;
    const visited = new Set();
    const group = neighborsSameColor(row,col,color,visited);
    if(group.length>=3){
      for(const [r,c] of group){
        popEffect(r,c,color);
        grid[r][c] = null;
      }
      score += group.length*10;
      const floated = removeFloating();
      if(floated>0) score += floated*15;
      updateHud();
    }
    if(checkGridEmpty()){
      level++;
      initGrid(Math.min(5+level,10));
      updateHud();
    }
    checkGameOver();
  }

  function findSnapCell(x,y){
    let row = Math.round((y - R) / rowHeight);
    if(row<0) row=0;
    ensureRow(row+1);
    const offset = row%2===1 ? R : 0;
    let col = Math.round((x - R - offset) / (2*R));
    col = Math.max(0, Math.min(colsInRow(row)-1, col));

    const candidates = new Map();
    const add = (r,c)=>{
      ensureRow(r+1);
      if(c>=0 && c<colsInRow(r)) candidates.set(r+','+c,[r,c]);
    };
    add(row,col);
    for(const [nr,nc] of neighbors(row,col)) add(nr,nc);
    for(const [nr,nc] of neighbors(row,col)){
      for(const [nnr,nnc] of neighbors(nr,nc)) add(nnr,nnc);
    }

    let best = null, bestDist = Infinity;
    for(const [r,c] of candidates.values()){
      if(grid[r] && grid[r][c]) continue;
      const p = cellPos(r,c);
      const d = (p.x-x)*(p.x-x) + (p.y-y)*(p.y-y);
      if(d < bestDist){ bestDist = d; best = [r,c]; }
    }
    if(!best) best = [row,col];
    return best;
  }

  function checkGameOver(){
    for(let r=0;r<grid.length;r++){
      for(let c=0;c<colsInRow(r);c++){
        if(grid[r][c]){
          const {y} = cellPos(r,c);
          if(y + R >= gameOverY){
            endGame();
            return;
          }
        }
      }
    }
  }

  function endGame(){
    running = false;
    overlayTitle.textContent = 'Game Over';
    overlayText.textContent = `Your final score: ${score}`;
    overlay.style.display = 'flex';
  }

  function updateHud(){
    scoreEl.textContent = score;
    levelEl.textContent = level;
  }

  // ---- input (works with mouse AND touch/finger) ----
  function setAngleFromPoint(px,py){
    let dx = px - W/2;
    let dy = py - shooterY;
    let a = Math.atan2(dy,dx);
    if(a > 0) a = a - Math.PI*2;
    a = Math.max(-Math.PI+0.1, Math.min(-0.1, a));
    angle = a;
  }

  function getPointFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width/rect.width;
    const scaleY = canvas.height/rect.height;
    let clientX, clientY;
    if(e.touches && e.touches.length){
      clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX; clientY = e.clientY;
    }
    return {x:(clientX-rect.left)*scaleX, y:(clientY-rect.top)*scaleY};
  }

  canvas.addEventListener('pointermove', (e)=>{
    if(!running) return;
    const p = getPointFromEvent(e);
    setAngleFromPoint(p.x,p.y);
  });

  canvas.addEventListener('pointerdown', (e)=>{
    if(!running) return;
    const p = getPointFromEvent(e);
    setAngleFromPoint(p.x,p.y);
    shoot();
  });

  function shoot(){
    if(!shootBubble || shootBubble.moving) return;
    const speed = 620;
    shootBubble.vx = Math.cos(angle)*speed;
    shootBubble.vy = Math.sin(angle)*speed;
    shootBubble.moving = true;
  }

  // ---- main loop ----
  let lastTime = performance.now();
  function loop(now){
    const dt = Math.min((now-lastTime)/1000, 0.033);
    lastTime = now;

    ctx.clearRect(0,0,W,H);
    drawGameOverLine();
    drawGrid();
    updateParticles(dt);
    drawParticles();

    if(running){
      if(shootBubble && shootBubble.moving){
        shootBubble.x += shootBubble.vx*dt;
        shootBubble.y += shootBubble.vy*dt;

        if(shootBubble.x - R < 0){ shootBubble.x = R; shootBubble.vx *= -1; }
        if(shootBubble.x + R > W){ shootBubble.x = W-R; shootBubble.vx *= -1; }

        let collided = false;
        if(shootBubble.y - R <= 0){
          shootBubble.y = R;
          collided = true;
        } else {
          outer:
          for(let r=0;r<grid.length;r++){
            for(let c=0;c<colsInRow(r);c++){
              if(grid[r][c]){
                const p = cellPos(r,c);
                const dx = p.x - shootBubble.x, dy = p.y - shootBubble.y;
                if(dx*dx+dy*dy <= (2*R*0.96)*(2*R*0.96)){
                  collided = true;
                  break outer;
                }
              }
            }
          }
        }

        if(collided){
          const [row,col] = findSnapCell(shootBubble.x, shootBubble.y);
          handleLanding(row,col,shootBubble.color);
          spawnShooter();
        }
      }
      drawShooter();
    }

    animId = requestAnimationFrame(loop);
  }

  function newGame(){
    score = 0; level = 1; particles = [];
    running = true;
    overlay.style.display = 'none';
    initGrid(6);
    nextColor = pickNextColor();
    spawnShooter();
    updateHud();
  }

  document.getElementById('restartBtn').addEventListener('click', newGame);
  document.getElementById('overlayBtn').addEventListener('click', newGame);

  newGame();
  lastTime = performance.now();
  animId = requestAnimationFrame(loop);
})();

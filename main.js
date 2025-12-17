// Utilidad para quitar tildes
function quitarTildes(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  
  const form = document.getElementById('name-form');
  const input = document.getElementById('name-input');
  const formContainer = document.getElementById('form-container');
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d');
  // Control para reiniciar/cancelar la animación al cambiar tamaño
  let currentAnimationCancel = null;
  let activeNombre = null;
  // Para preservar progreso entre reinicios: índice de letra actual
  let currentLetterIndex = 0;
  let preserveLetterIndex = null;
  // Para preservar estado de animación (posición del avión, segmento, t, etc.)
  let currentAnimState = null;
  let preserveAnimState = null;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Adjust letter size and spacing dynamically based on screen size
    const baseWidth = 1920; // Reference width for scaling
    const scaleFactor = Math.min(window.innerWidth / baseWidth, 1);

    // Further reduce letter size for smaller screens
    const isSmallMobile = window.innerWidth <= 480;
    const isMobile = window.innerWidth <= 768;

    if (isSmallMobile) {
      letraW = 8 * scaleFactor; // Más pequeñas para móviles muy pequeños
      letraH = 16 * scaleFactor;
      esp = 40 * scaleFactor;
      espPalabra = 50 * scaleFactor;
      corazonScale = 0.5 * scaleFactor;
    } else if (isMobile) {
      letraW = 12 * scaleFactor; // Reducidas para móviles
      letraH = 24 * scaleFactor;
      esp = 45 * scaleFactor;
      espPalabra = 55 * scaleFactor;
      corazonScale = 0.6 * scaleFactor;
    } else {
        letraW = 38 * scaleFactor; // Default for larger screens
        letraH = 80 * scaleFactor;
        esp = 35 * scaleFactor;
        espPalabra = 48 * scaleFactor;
        corazonScale = scaleFactor;
    }

    // Restart animation to apply new dimensions
    if (activeNombre) {
        preserveLetterIndex = currentLetterIndex;
        preserveAnimState = currentAnimState;
        iniciarAnimacionBlockMensaje(activeNombre);
    }
  }
  window.addEventListener('resize', resizeCanvas);
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let nombre = input.value.trim();
    if (!nombre) return;
    nombre = quitarTildes(nombre).toUpperCase();
    formContainer.style.display = 'none';
    canvas.style.display = 'block';
    document.getElementById('credits').style.display = 'block'; // Mostrar créditos de animación
    resizeCanvas();
    activeNombre = nombre;
    iniciarAnimacionBlockMensaje(nombre);
  });

  // Reiniciar la animación responsiva al redimensionar (debounced)
  let resizeDebounceTimer = null;
  window.addEventListener('resize', () => {
    // Ajusta canvas inmediatamente
    resizeCanvas();
    // Si no hay nombre activo no hacemos nada
    if (!activeNombre) return;
    // Debounce: espera a que el usuario termine de redimensionar
    if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      // Guardar índice de letra actual para preservarlo tras reiniciar
      preserveLetterIndex = currentLetterIndex;
      // Guardar estado de animación (posición aproximada) también
      preserveAnimState = currentAnimState;
      // Reinicia la animación para recalcular posiciones responsivas
      iniciarAnimacionBlockMensaje(activeNombre);
      resizeDebounceTimer = null;
    }, 300);
  });
  
  // --- Animación de la avioneta dibujando mensaje tipo block con humo nube y rotación ---
  
  function drawPlane(x, y, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Hacer el avioncito más pequeño en móviles
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    let scale = 1;
    
    if (isSmallMobile) {
      scale = 0.6; // Móvil pequeño - avioncito más pequeño
    } else if (isMobile) {
      scale = 0.75; // Móvil - avioncito mediano
    }
    
    ctx.scale(scale, scale);
    
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(-19, -5, 38, 10); // cuerpo
    ctx.fillStyle = '#b22222';
    ctx.fillRect(14, -3, 11, 6); // nariz
    ctx.fillStyle = '#888';
    ctx.fillRect(-22, -2, 6, 4); // cola
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(-8, -8, 16, 6); // cabina
    ctx.beginPath();
    ctx.arc(-2, -5, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd299';
    ctx.fill();
    ctx.fillStyle = '#b22222';
    ctx.fillRect(-6, 2, 25, 5);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.restore();
  }
  
  function drawCloudSmoke(x, y) {
    for (let i = 0; i < 5; i++) { // Reducido de 7 a 5
      const dx = (Math.random() - 0.5) * 8; // Reducido de 10 a 8
      const dy = (Math.random() - 0.5) * 8;
      const r = 4 + Math.random() * 4; // Reducido de 5.5+5.5 a 4+4
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.random() * 0.2; // Reducido transparencia
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#e0e0e0';
      ctx.shadowBlur = 6; // Reducido de 8 a 6
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Paths tipo block para letras mayúsculas y corazón
  const blockLetters = {
    'A': [
      [[0,80],[14,0],[28,80]],
      [[6,40],[22,40]]
    ],
    'B': [
      [[0,0],[0,80]],
      [[0,0],[32,0],[38,8],[38,32],[32,40],[0,40]],
      [[0,40],[32,40],[38,48],[38,72],[32,80],[0,80]]
    ],
    'C': [
      [[38,8],[32,0],[6,0],[0,8],[0,72],[6,80],[32,80],[38,72]]
    ],
    'D': [
      [[0,0],[0,80]],
      [[0,0],[28,0],[38,12],[38,68],[28,80],[0,80]]
    ],
    'E': [
      [[38,0],[0,0],[0,80],[38,80]],
      [[0,40],[28,40]]
    ],
    'F': [
      [[0,0],[0,80]],
      [[0,0],[38,0]],
      [[0,40],[28,40]]
    ],
    'G': [
      [[38,8],[32,0],[6,0],[0,8],[0,72],[6,80],[32,80],[38,72],[38,48],[22,48]]
    ],
    'H': [
      [[0,0],[0,80]],
      [[38,0],[38,80]],
      [[0,40],[38,40]]
    ],
    'I': [
      [[0,0],[38,0]],
      [[19,0],[19,80]],
      [[0,80],[38,80]]
    ],
    'J': [
      [[38,0],[38,64],[32,80],[6,80],[0,72]]
    ],
    'K': [
      [[0,0],[0,80]],
      [[0,40],[38,0]],
      [[0,40],[38,80]]
    ],
    'L': [
      [[0,0],[0,80],[38,80]]
    ],
    'M': [
      [[0,80],[0,0],[19,40],[38,0],[38,80]]
    ],
    'N': [
      [[0,80],[0,0],[38,80],[38,0]]
    ],
    'O': [
      [[6,0],[32,0],[38,8],[38,72],[32,80],[6,80],[0,72],[0,8],[6,0]]
    ],
    'P': [
      [[0,80],[0,0],[32,0],[38,8],[38,32],[32,40],[0,40]]
    ],
    'Q': [
      [[6,0],[32,0],[38,8],[38,72],[32,80],[6,80],[0,72],[0,8],[6,0]],
      [[24,56],[38,80]]
    ],
    'R': [
      [[0,80],[0,0],[32,0],[38,8],[38,32],[32,40],[0,40]],
      [[0,40],[38,80]]
    ],
    'S': [
      [[38,8],[32,0],[6,0],[0,8],[0,32],[6,40],[32,40],[38,48],[38,72],[32,80],[6,80],[0,72]]
    ],
    'T': [
      [[0,0],[38,0]],
      [[19,0],[19,80]]
    ],
    'U': [
      [[0,0],[0,64],[6,80],[32,80],[38,64],[38,0]]
    ],
    'V': [
      [[0,0],[19,80],[38,0]]
    ],
    'W': [
      [[0,0],[9,80],[19,40],[29,80],[38,0]]
    ],
    'X': [
      [[0,0],[38,80]],
      [[38,0],[0,80]]
    ],
    'Y': [
      [[0,0],[19,40],[38,0]],
      [[19,40],[19,80]]
    ],
    'Z': [
      [[0,0],[38,0],[0,80],[38,80]]
    ],
    ' ': [],
    '♥': [
      // Corazón clásico, simétrico, siguiendo la referencia
      [
        [32,80], // punta inferior
        [8,56],  // curva izquierda baja
        [4,36],  // curva izquierda media
        [12,20], // lóbulo izquierdo
        [28,16], // parte superior izquierda
        [32,24], // centro superior
        [36,16], // parte superior derecha
        [52,20], // lóbulo derecho
        [60,36], // curva derecha media
        [56,56], // curva derecha baja
        [32,80]  // cerrar
      ]
    ]
  };
  
  function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
  
  // --- Nubes pixel art y skyline ---
  const cloudSprites = [
    // Cada nube es una matriz de píxeles (1=blanco, 0=transparente)
    [
      [0,1,1,1,0],
      [1,1,1,1,1],
      [0,1,1,1,0]
    ],
    [
      [0,0,1,1,0,0],
      [0,1,1,1,1,0],
      [1,1,1,1,1,1],
      [0,1,1,1,1,0],
      [0,0,1,1,0,0]
    ],
    [
      [0,1,1,0],
      [1,1,1,1],
      [0,1,1,0]
    ]
  ];
  
  let clouds = [];
  function initClouds() {
    clouds = [];
    const n = 7;
    for(let i=0;i<n;i++){
      // Evitar la franja central del mensaje
      let y;
      do {
        y = 40 + Math.random() * (canvas.height-200);
      } while (y > canvas.height/2-90 && y < canvas.height/2+90);
      clouds.push({
        x: Math.random()*canvas.width,
        y,
        speed: 0.1 + Math.random()*0.15,
        sprite: cloudSprites[Math.floor(Math.random()*cloudSprites.length)],
        scale: 2 + Math.random()*2
      });
    }
  }
  
  function drawCloudSprite(cloud) {
    const {x, y, sprite, scale} = cloud;
    for(let i=0;i<sprite.length;i++){
      for(let j=0;j<sprite[i].length;j++){
        if(sprite[i][j]){
          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = '#fff';
          ctx.shadowColor = '#e0e0e0';
          ctx.shadowBlur = 4;
          ctx.fillRect(x+j*scale, y+i*scale, scale, scale);
          ctx.restore();
        }
      }
    }
  }
  
  function updateClouds() {
    for(const cloud of clouds){
      cloud.x += cloud.speed;
      if(cloud.x > canvas.width+40) cloud.x = -40;
    }
  }
  
  // Skyline pixel art (siluetas de edificios)
  function drawSkyline() {
    const baseY = canvas.height-60;
    // Edificios principales (x, ancho, alto, color)
    const buildings = [
      // Empire State
      {x:40,w:22,h:90,c:'#b0b8c1'},
      // One World Trade
      {x:120,w:18,h:110,c:'#a0a8b8'},
      // Chrysler
      {x:200,w:16,h:70,c:'#b8b8c8'},
      // Edificio genérico
      {x:70,w:18,h:60,c:'#a8b0b8'},
      // Edificio genérico
      {x:170,w:14,h:50,c:'#b0b0b0'},
      // Estatua de la Libertad
      {x:260,w:10,h:40,c:'#7ec0b8'},
      // Puente de Brooklyn (simplificado)
      {x:300,w:60,h:20,c:'#b89c7c'},
      // Más edificios
      {x:370,w:18,h:60,c:'#b0b8c1'},
      {x:400,w:14,h:40,c:'#a0a8b8'},
      {x:430,w:22,h:80,c:'#b8b8c8'}
    ];
    // Fondo base
    ctx.save();
    ctx.fillStyle = '#6a7ba2';
    ctx.fillRect(0,baseY,canvas.width,60);
    // Edificios
    for(const b of buildings){
      ctx.fillStyle = b.c;
      ctx.fillRect(b.x, baseY-b.h, b.w, b.h);
      // Detalles Empire State
      if(b.h>80){
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(b.x+b.w/2-2, baseY-b.h-12, 4, 12);
      }
      // Estatua de la Libertad
      if(b.h===40 && b.w===10){
        ctx.fillStyle = '#b2dfdb';
        ctx.fillRect(b.x+3, baseY-b.h-10, 4, 10);
        ctx.beginPath();
        ctx.arc(b.x+5, baseY-b.h-12, 3, 0, Math.PI*2);
        ctx.fill();
      }
      // Puente de Brooklyn
      if(b.h===20 && b.w===60){
        ctx.fillStyle = '#b89c7c';
        ctx.fillRect(b.x+10, baseY-10, 40, 4);
        ctx.fillRect(b.x+10, baseY-6, 40, 4);
        ctx.fillStyle = '#a67c52';
        ctx.fillRect(b.x, baseY-20, 6, 20);
        ctx.fillRect(b.x+54, baseY-20, 6, 20);
      }
    }
    ctx.restore();
  }
  
  let bgImg = new window.Image();
  bgImg.src = 'assets/fondo1.jpg';
  let bgLoaded = false;
  bgImg.onload = () => { bgLoaded = true; };

  function drawBackground() {
    if (bgLoaded) {
      // En móviles: usar todo el alto de la imagen sin zoom, en desktop: cover normal
      const isMobile = window.innerWidth <= 768;
      let iw = bgImg.width, ih = bgImg.height, cw = canvas.width, ch = canvas.height;
      let scale, nw, nh, nx, ny;
      
      if (isMobile) {
        // Usar todo el alto de la imagen sin zoom
        scale = ch / ih; // Escalar por altura para usar todo el alto
        nw = iw * scale;
        nh = ih * scale;
        nx = (cw - nw) / 2; // Centrar horizontalmente
        ny = 0; // Alinear al tope
        
        // Si el ancho es menor que la pantalla, ajustar para cubrir completamente
        if (nw < cw) {
          scale = cw / iw;
          nw = iw * scale;
          nh = ih * scale;
          nx = 0;
          ny = (ch - nh) / 2; // Centrar verticalmente
        }
      } else {
        // Cover: cubrir toda la pantalla (desktop)
        scale = Math.max(cw/iw, ch/ih);
        nw = iw*scale, nh = ih*scale;
        nx = (cw-nw)/2, ny = (ch-nh)/2;
      }
      
      ctx.drawImage(bgImg, nx, ny, nw, nh);
    } else {
      ctx.fillStyle = '#7ec0ee';
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  }

  // --- Fuegos artificiales pixel art ---
  let fireworks = [];
  function launchFirework() {
    const x = 100 + Math.random()*(canvas.width-200);
    const y = 100 + Math.random()*(canvas.height/2-100);
    const color = `hsl(${Math.floor(Math.random()*360)},90%,70%)`;
    const particles = [];
    for(let i=0;i<18;i++){
      const angle = (i/18)*2*Math.PI;
      const speed = 2+Math.random()*2;
      particles.push({
        x, y, angle, speed,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        alpha: 1
      });
    }
    fireworks.push({particles, color});
  }
  function updateFireworks() {
    for(const fw of fireworks){
      for(const p of fw.particles){
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= 0.018;
      }
    }
    fireworks = fireworks.filter(fw => fw.particles.some(p => p.alpha > 0));
  }
  function drawFireworks() {
    for(const fw of fireworks){
      for(const p of fw.particles){
        if(p.alpha>0){
          ctx.save();
          ctx.globalAlpha = Math.max(0,p.alpha);
          ctx.fillStyle = fw.color;
          ctx.shadowColor = fw.color;
          ctx.shadowBlur = 8;
          ctx.fillRect(p.x, p.y, 4, 4);
          ctx.restore();
        }
      }
    }
  }
  
  function iniciarAnimacionBlockMensaje(nombre) {
    // Cancelar animación previa si existe
    if (typeof currentAnimationCancel === 'function') currentAnimationCancel();
    let cancelled = false;
    currentAnimationCancel = () => { cancelled = true; };
    // Registrar nombre activo (para reinicios en resize)
    activeNombre = nombre;
    // Parámetros de tamaño responsivos
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    let letraW, letraH, esp, espPalabra, corazonScale;
    
    if (isSmallMobile) {
      // Móvil pequeño - letras mucho más pequeñas y separadas
      letraW = 8 * 0.8; // Más pequeñas para móviles muy pequeños
      letraH = 16 * 0.8;
      esp = 60 * 0.8; // reducir espaciado
      espPalabra = 60 * 0.8;
      corazonScale = 0.5; 
    } else if (isMobile) {
      // Móvil - letras más pequeñas y separadas
      letraW = 12 * 0.8; // Reducidas para móviles
      letraH = 24 * 0.8;
      esp = 65 * 0.8;
      espPalabra = 65 * 0.8;
      corazonScale = 0.6;
    } else {
      // Desktop - NO TOCAR
      letraW = 38*0.8;
      letraH = 80*0.8;
      esp = 35*0.8;
      espPalabra = 48*0.8;
      corazonScale = 1.1;
    }
    // Escala real de las letras respecto al diseño base (38x80)
    const letterScaleX = letraW / 38;
    const letterScaleY = letraH / 80;
    
    // Construir mensaje según el dispositivo
    let mensaje, segundaLinea;
    if (isMobile) {
      // En móviles: "HBD" centrado en primera línea, nombre en segunda línea
      mensaje = quitarTildes('HBD').toUpperCase();
      segundaLinea = nombre;
    } else {
      // En desktop: todo en una línea
      mensaje = quitarTildes('Feliz Cumpleaños ' + nombre).toUpperCase();
      segundaLinea = null;
    }
    
    // Construir paths para el mensaje y asociar cada segmento a su letra
    let paths = [];
    let letraIndices = [];
    let x = 0;
    let y = 0; // Para manejar múltiples líneas
    let maxY = 0, minY = Infinity;
    
    // Función para calcular el ancho real de una letra
    function getLetterWidth(ch) {
      if (ch === ' ') return espPalabra;
      const letter = blockLetters[ch] || blockLetters[' '];
      let maxX = 0;
      for (const seg of letter) {
        const segMaxX = Math.max(...seg.map(([px, _]) => px));
        if (segMaxX > maxX) maxX = segMaxX;
      }
      return maxX * letterScaleX;
    }
    
    // Calcular el ancho total del mensaje completo para centrarlo
    let totalWidth = 0;
    let letterCount = 0;
    
    // Calcular ancho de la primera línea (HBD + espacio + nombre)
    for (let i = 0; i < mensaje.length; i++) {
      const ch = mensaje[i];
      if (ch === ' ') {
        totalWidth += espPalabra;
        continue;
      }
      totalWidth += getLetterWidth(ch);
      letterCount++;
    }
    
    // Añadir espaciado entre letras
    totalWidth += (letterCount - 1) * esp;
    
    // Añadir espacio para el corazón al final
    const corazonWidth = 60 * corazonScale; // Ancho aproximado del corazón
    totalWidth += 15 + corazonWidth; // 15px de espacio + ancho del corazón
    
    // Calcular ancho de la segunda línea si existe (solo móvil)
    if (segundaLinea) {
      let segundaLineaWidth = 0;
      let segundaLineaLetterCount = 0;
      for (let i = 0; i < segundaLinea.length; i++) {
        const ch = segundaLinea[i];
        segundaLineaWidth += getLetterWidth(ch);
        segundaLineaLetterCount++;
      }
      // Añadir espaciado entre letras
      segundaLineaWidth += (segundaLineaLetterCount - 1) * esp;
      // Añadir espacio para el corazón en la segunda línea también
      segundaLineaWidth += 15 + corazonWidth;
      // Usar el ancho más grande de las dos líneas
      totalWidth = Math.max(totalWidth, segundaLineaWidth);
    }
    
    // Add a third line with 'TQM ♥' below the existing lines
    // Tercera línea: puede ir al final del nombre (misma línea) o debajo de la segunda línea
    const terceraLinea = 'TQM ♥';
    // Más espacio al final y entre letras para que "TQM ♥" quede más separado
    let terceraLineaWidth = 0;
    let terceraLineaLetterCount = 0;
    const extraEndSpacing = 30; // espacio extra al final en px
    const extraGapBetween = 12;  // espacio extra entre letras en px

    for (let i = 0; i < terceraLinea.length; i++) {
      const ch = terceraLinea[i];
      terceraLineaWidth += getLetterWidth(ch);
      terceraLineaLetterCount++;
    }
    terceraLineaWidth += (terceraLineaLetterCount - 1) * (esp + extraGapBetween);
    terceraLineaWidth += extraEndSpacing;
    // Calcular ancho y posición del nombre (segunda línea) para decidir si se anexa al final
    let nombreWidthForCenter = 0;
    let nombreLetterCount = 0;
    if (segundaLinea) {
      for (let i = 0; i < segundaLinea.length; i++) {
        const ch = segundaLinea[i];
        nombreWidthForCenter += getLetterWidth(ch);
        nombreLetterCount++;
      }
      nombreWidthForCenter += (nombreLetterCount - 1) * esp;
      // espacio estimado para el corazón (como hacemos luego)
      nombreWidthForCenter += 15 + corazonWidth;
    }
    // Decidir si anexar o colocar debajo
    let appendToNombre = false;
    if (segundaLinea) {
      const nombreStartX = (canvas.width - nombreWidthForCenter) / 2;
      // Calcular la X donde terminará el nombre con el mecanismo de dibujo (se usa letraW+esp para el avance)
      const nombreEndX = nombreStartX + nombreLetterCount * (letraW + esp);
      const spaceRight = canvas.width - nombreEndX;
      // Si hay suficiente espacio a la derecha, anexamos (dejar un pequeño margen extra)
      if (spaceRight >= terceraLineaWidth + 20) appendToNombre = true;
    } else {
      // Si no hay segunda línea (desktop), intentamos poner la tercera al final del mensaje principal
      // calcular width del mensaje principal
      let mensajeWidth = 0;
      let mensajeLetters = 0;
      for (let i = 0; i < mensaje.length; i++) {
        const ch = mensaje[i];
        if (ch === ' ') {
          mensajeWidth += espPalabra;
          continue;
        }
        mensajeWidth += getLetterWidth(ch);
        mensajeLetters++;
      }
      mensajeWidth += (mensajeLetters - 1) * esp;
      const mensajeStartX = (canvas.width - mensajeWidth) / 2;
      const mensajeEndX = mensajeStartX + mensajeLetters * (letraW + esp);
      if (canvas.width - mensajeEndX >= terceraLineaWidth + 20) appendToNombre = true;
    }

    // Espacio adicional antes de la tercera línea (cuarta línea en blanco)
    const extraFourthLineGap = 60; // ajustar para más/menos espacio

    if (appendToNombre) {
      // Anexar la tercera línea al final del nombre (misma línea)
      let nombreStartX = (canvas.width - nombreWidthForCenter) / 2;
      let startX = nombreStartX + nombreLetterCount * (letraW + esp) + 15; // comienzo después del nombre + pequeño espacio
      let startY = letraH + 80; // misma Y que la segunda línea
      let tx = startX;
      for (let i = 0; i < terceraLinea.length; i++) {
        const ch = terceraLinea[i];
        const letter = blockLetters[ch] || blockLetters[' '];
        for (const seg of letter) {
          const segAbs = seg.map(([px, py]) => [tx + px * 0.8, startY + py * 0.8]);
          paths.push(segAbs);
          letraIndices.push(mensaje.length + (segundaLinea ? segundaLinea.length : 0) + i);
          for (const [_, py] of seg) {
            if (startY + py > maxY) maxY = startY + py;
            if (startY + py < minY) minY = startY + py;
          }
        }
        tx += letraW + esp;
      }
    } else {
      // Colocar la tercera línea centrada debajo (o como segunda línea si no exista)
      // Aplicar espacio adicional (cuarta línea en blanco) si hay segunda línea
      let startY = segundaLinea ? (letraH + 80 + letraH + 20 + extraFourthLineGap) : (letraH + 80);
      let startX = (canvas.width - terceraLineaWidth) / 2;
      let tx = startX;
      for (let i = 0; i < terceraLinea.length; i++) {
        const ch = terceraLinea[i];
        const letter = blockLetters[ch] || blockLetters[' '];
        for (const seg of letter) {
          const segAbs = seg.map(([px, py]) => [tx + px * 0.8, startY + py * 0.8]);
          paths.push(segAbs);
          letraIndices.push(mensaje.length + (segundaLinea ? segundaLinea.length : 0) + i);
          for (const [_, py] of seg) {
            if (startY + py > maxY) maxY = startY + py;
            if (startY + py < minY) minY = startY + py;
          }
        }
        tx += letraW + esp;
      }
    }
    
    // Centrar el mensaje completo
    x = (canvas.width - totalWidth) / 2;
    
    // Primera línea (HBD) - centrada
    if (isMobile) {
      // En móvil, centrar solo HBD
      let hbdWidth = 0;
      let hbdLetterCount = 0;
      for (let i = 0; i < mensaje.length; i++) {
        const ch = mensaje[i];
        hbdWidth += getLetterWidth(ch);
        hbdLetterCount++;
      }
      hbdWidth += (hbdLetterCount - 1) * esp;
      x = (canvas.width - hbdWidth) / 2; // Centrar HBD
    }
    
    for (let i = 0; i < mensaje.length; i++) {
      const ch = mensaje[i];
      if (ch === ' ') {
        x += espPalabra;
        continue;
      }
      const letter = blockLetters[ch] || blockLetters[' '];
      for (const seg of letter) {
        const segAbs = seg.map(([px, py]) => [x + px*0.8, y + py*0.8]);
        paths.push(segAbs);
        letraIndices.push(i);
        for (const [_, py] of seg) {
          if (py > maxY) maxY = py;
          if (py < minY) minY = py;
        }
      }
      x += letraW + esp;
    }
    
    // Segunda línea (nombre) - solo en móviles, centrada independientemente
    if (segundaLinea) {
      // Calcular el ancho total del nombre + corazón para centrarlo independientemente
      let nombreWidth = 0;
      let nombreLetterCount = 0;
      for (let i = 0; i < segundaLinea.length; i++) {
        const ch = segundaLinea[i];
        nombreWidth += getLetterWidth(ch);
        nombreLetterCount++;
      }
      // Añadir espaciado entre letras
      nombreWidth += (nombreLetterCount - 1) * esp;
      // Añadir espacio para el corazón
      nombreWidth += 15 + corazonWidth;
      x = (canvas.width - nombreWidth) / 2; // Centrar el nombre + corazón independientemente
      y = letraH + 80; // Más espacio entre líneas
      
      for (let i = 0; i < segundaLinea.length; i++) {
        const ch = segundaLinea[i];
        const letter = blockLetters[ch] || blockLetters[' '];
        for (const seg of letter) {
          const segAbs = seg.map(([px, py]) => [x + px*0.8, y + py*0.8]);
          paths.push(segAbs);
          letraIndices.push(mensaje.length + i);
          for (const [_, py] of seg) {
            if (y + py > maxY) maxY = y + py;
            if (y + py < minY) minY = y + py;
          }
        }
        x += letraW + esp;
      }
    }
    
    // Añadir corazón al final
    const corazonYOffset = (letraH - 80*corazonScale) / 2;
    const corazonXOffset = x + 15;
    const corazonY = segundaLinea ? y + 25 : 0;
    const corazon = blockLetters['♥'][0].map(([px, py]) => [corazonXOffset + px*corazonScale, corazonY + py*corazonScale + corazonYOffset]);
    paths.push(corazon);
    letraIndices.push(mensaje.length + (segundaLinea ? segundaLinea.length : 0));

    // Centrado vertical
    const totalH = terceraLinea ? y + letraH + 80 : (segundaLinea ? y + letraH + 80 : letraH); // Más espacio para el total
    const offsetY = canvas.height/2 - totalH/2;

    // Reiniciar variables globales que afectan la animación
    initClouds();
    fireworks = [];

    // Animación
    let pathIdx = 0, puntoIdx = 0, t = 0;
    let estado = 'dibuja';
    let lastPoint = null, moveFrom = null, moveTo = null;
    let drawnSmoke = [];
    let pausaFrames = isMobile ? 13 : 17;
    let showFireworks = false;
    let fireworkTimer = 0;

    // Si venimos de un resize y queremos preservar la letra actual,
    // buscamos el primer segmento que corresponda a esa letra.
    if (preserveLetterIndex !== null) {
      const idx = letraIndices.findIndex(li => li >= preserveLetterIndex);
      if (idx !== -1) {
        pathIdx = idx;
      }
      preserveLetterIndex = null;
    }

    // Restaurar estado exacto del avión si estaba disponible
    if (preserveAnimState) {
      // Si tenemos pathIdx mapeado, intentamos restaurar punto y t
      try {
        if (preserveAnimState.pathIdx != null) {
          // buscar índice nuevo correspondiente a la misma letra
          const mappedIdx = letraIndices.findIndex(li => li >= (preserveAnimState.letterIndex || 0));
          if (mappedIdx !== -1) pathIdx = mappedIdx;
        }
        if (preserveAnimState.puntoIdx != null) {
          puntoIdx = Math.min(preserveAnimState.puntoIdx, (paths[pathIdx] ? paths[pathIdx].length - 2 : 0));
        }
        if (preserveAnimState.t != null) {
          t = preserveAnimState.t;
        }
        if (preserveAnimState.estado) {
          estado = preserveAnimState.estado;
        }
        // Recalcular lastPoint/moveFrom/moveTo en coordenadas nuevas
        if (paths[pathIdx] && paths[pathIdx][puntoIdx+1]) {
          lastPoint = paths[pathIdx][puntoIdx+1];
        }
        if (estado === 'mueve' && pathIdx < paths.length) {
          moveFrom = lastPoint ? [lastPoint[0], offsetY + lastPoint[1]] : null;
          if (paths[pathIdx] && paths[pathIdx+1]) moveTo = [paths[pathIdx+1][0][0], offsetY + paths[pathIdx+1][0][1]];
        }
      } catch (e) {
        // si algo falla, ignoramos y dibujamos desde el inicio de la letra mapeada
      }
      preserveAnimState = null;
    }

    function animar() {
      // Actualizar estado global para preservación (se usa en resize)
      currentAnimState = { pathIdx, puntoIdx, t, estado, letterIndex: letraIndices[pathIdx] || 0 };
      if (cancelled) return;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // Fondo imagen
      drawBackground();
      // Nubes
      updateClouds();
      for(const cloud of clouds) drawCloudSprite(cloud);
      // Fuegos artificiales
      if(showFireworks){
        updateFireworks();
        drawFireworks();
        if(fireworkTimer%20===0 && fireworkTimer<100) launchFirework();
        fireworkTimer++;
      }
      // Dibuja humo ya trazado
      for(const dot of drawnSmoke) drawCloudSmoke(dot[0], dot[1]);
      // Si terminó el trazado, iniciar fuegos y continuar animando
      if(pathIdx >= paths.length && !showFireworks) {
        showFireworks = true;
        fireworkTimer = 0;
      }

      // Actualizar el índice de letra currentLetterIndex para preservación
      if (pathIdx < letraIndices.length) currentLetterIndex = letraIndices[pathIdx];

      if (pathIdx < paths.length) {
        const seg = paths[pathIdx];
        const start = seg[puntoIdx];
        const end = seg[puntoIdx+1];
        let px, py, angle;
        if(estado==='dibuja') {
          // Velocidad uniforme: avanzar por distancia, no por t fijo
          const dx = end[0]-start[0], dy = end[1]-start[1];
          const dist = Math.sqrt(dx*dx+dy*dy);
          const speed = isMobile ? 11.5 : 9.5;
          t += speed/dist;
          px = start[0] + (end[0]-start[0])*t;
          py = offsetY + start[1] + (end[1]-start[1])*t;
          angle = getAngle(
            start[0],
            offsetY + start[1],
            end[0],
            offsetY + end[1]
          );
          drawPlane(px, py, angle);
          drawCloudSmoke(px, py);
          drawnSmoke.push([px, py]);
          if(t>=1) {
            t=0;
            puntoIdx++;
            if(puntoIdx>=seg.length-1) {
              puntoIdx=0;
              let prevLetter = letraIndices[pathIdx];
              pathIdx++;
              let nextLetter = letraIndices[pathIdx];
              lastPoint = end;
              if(nextLetter !== prevLetter) {
                estado='pausa';
              } else {
                // Movimiento directo al siguiente segmento de la misma letra
                estado='mueve';
                moveFrom = [lastPoint[0], offsetY + lastPoint[1]];
                moveTo = [paths[pathIdx][0][0], offsetY + paths[pathIdx][0][1]];
                t = 0;
              }
            }
          }
        } else if(estado==='pausa') {
          px = lastPoint[0];
          py = offsetY + lastPoint[1];
          angle = 0;
          drawPlane(px, py, angle);
          pausaFrames--;
          if(pausaFrames<=0) {
            pausaFrames = isMobile ? 13 : 17;
            estado='mueve';
            if(pathIdx<paths.length) {
              moveFrom = [lastPoint[0], offsetY + lastPoint[1]];
              moveTo = [paths[pathIdx][0][0], offsetY + paths[pathIdx][0][1]];
            }
            t = 0;
          }
        } else if(estado==='mueve') {
          const from = moveFrom;
          const to = moveTo;
          const dx = to[0]-from[0], dy = to[1]-from[1];
          const dist = Math.sqrt(dx*dx+dy*dy);
          const speed = isMobile ? 12 : 12;
          t += speed/dist;
          px = from[0] + (to[0]-from[0])*t;
          py = from[1] + (to[1]-from[1])*t;
          angle = getAngle(from[0], from[1], to[0], to[1]);
          drawPlane(px, py, angle);
          if(t>=1) {
            t=0;
            estado='dibuja';
          }
        }
      }
      requestAnimationFrame(animar);
    }
    animar();
  }

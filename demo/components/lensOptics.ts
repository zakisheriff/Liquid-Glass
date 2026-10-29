/** Render the wallpaper and oversized title through a convex lens, including
 * on Safari where SVG displacement cannot filter a live backdrop. The title
 * stays at the top of the scene while the droplet bends its letters. */
export function mountLensOptics(stage: HTMLElement, lens: HTMLElement, canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: false });
  if (!gl) return;

  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * .5 + .5;
      gl_Position = vec4(position, 0., 1.);
    }
  `;
  const fragment = `
    precision highp float;
    uniform sampler2D poster;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform vec2 size;
    varying vec2 uv;

    vec3 samplePoster(vec2 p) {
      return texture2D(poster, clamp(p / resolution, vec2(0.), vec2(1.))).rgb;
    }

    void main() {
      vec2 p = vec2(uv.x, 1. - uv.y) * resolution;
      vec2 local = p - center;
      float radius = size.y * .5;
      vec2 q = abs(local) - (size * .5 - radius);
      vec2 corner = max(q, 0.);
      float distance = length(corner) + min(max(q.x, q.y), 0.) - radius;
      vec3 color = samplePoster(p);
      if (distance < 1.) {
        vec2 normal = length(corner) > .001
          ? normalize(corner) * sign(local)
          : (q.x > q.y ? vec2(sign(local.x), 0.) : vec2(0., sign(local.y)));
        float depth = max(-distance, 0.);
        // Apple's droplet: a clear, unmagnified centre and a rounded rim that
        // bends hard near the edge, curling letters under it into arcs.
        float bevel = radius * .75;
        float t = clamp(depth / bevel, 0., 1.);
        float edge = 1. - t;
        float bend = radius * .9 * pow(edge, 2.);
        // A slightly magnified, perfectly clear centre.
        vec2 ray = center + local / 1.07 + normal * bend;
        // Red bends least and blue most, so wherever the rim bends hard the
        // letters split into a thin rainbow, like light through a water drop.
        float split = bend * .11;
        vec3 glass = vec3(
          samplePoster(ray - normal * split).r,
          samplePoster(ray - normal * split * .35).g * .5 + samplePoster(ray + normal * split * .35).g * .5,
          samplePoster(ray + normal * split).b
        );
        // Fresnel reflection: a transparent centre, light gathering at the rim.
        float fresnel = pow(1. - t, 3.);
        float light = pow(abs(dot(normal, normalize(vec2(-.65, -1.)))), 3.);
        glass = mix(glass, vec3(.9, .96, 1.), fresnel * .16);
        float rim = exp(-pow((depth - .8) / .65, 2.));
        glass = mix(glass, vec3(1.), rim * (.22 + .55 * light));
        float inner = exp(-pow((depth - 2.6) / 1.2, 2.));
        glass += inner * light * .065;
        color = mix(color, glass, 1. - smoothstep(-.5, .75, distance));
      }
      gl_FragColor = vec4(color, 1.);
    }
  `;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return;
  }
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const uniforms = {
    resolution: gl.getUniformLocation(program, 'resolution'),
    center: gl.getUniformLocation(program, 'center'),
    size: gl.getUniformLocation(program, 'size'),
  };
  const source = document.createElement('canvas');
  const context = source.getContext('2d')!;
  // The wallpaper rasterised once per size; a theme change only re-tints.
  const base = document.createElement('canvas');
  const baseContext = base.getContext('2d')!;
  let baseSize = '';
  const image = new Image();
  let stopped = false;
  let ready = false;
  let visible = true;
  let frame = 0;
  let previous = '';
  // Frames since the lens last moved. The loop sleeps after ~half a second
  // of stillness and wakes when the lens, the page or the theme changes, so
  // a lens left alone costs no frames (and no battery).
  let still = 0;
  const wake = () => {
    still = 0;
    if (!frame && !stopped) frame = requestAnimationFrame(tick);
  };

  const paintPoster = () => {
    if (stopped || !image.complete || !image.naturalWidth) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    const density = Math.min(devicePixelRatio || 1, 2, gl.getParameter(gl.MAX_TEXTURE_SIZE) / Math.max(width, height));
    source.width = canvas.width = Math.round(width * density);
    source.height = canvas.height = Math.round(height * density);
    const size = `${source.width}x${source.height}`;
    if (size !== baseSize) {
      base.width = source.width;
      base.height = source.height;
      baseContext.setTransform(density, 0, 0, density, 0, 0);
      const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const iw = image.naturalWidth * cover;
      const ih = image.naturalHeight * cover;
      baseContext.drawImage(image, (width - iw) / 2, (height - ih) / 2, iw, ih);
      baseSize = size;
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.drawImage(base, 0, 0);
    context.setTransform(density, 0, 0, density, 0, 0);
    // The theme's wash (lighter in light mode, deeper in dark), under the title.
    const tint = getComputedStyle(stage).getPropertyValue('--poster-tint').trim();
    if (tint) {
      context.fillStyle = tint;
      context.fillRect(0, 0, width, height);
    }
    const title = stage.querySelector<HTMLElement>('.lens-demo__title')!;
    const style = getComputedStyle(title);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.letterSpacing = style.letterSpacing;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = style.color;
    context.fillText(title.textContent || '', width / 2, parseFloat(style.top));
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.resolution, width, height);
    previous = '';
    ready = true;
    wake();
  };
  const tick = () => {
    frame = 0;
    if (stopped || !visible || document.hidden) return;
    if (ready) {
      const area = stage.getBoundingClientRect();
      const glass = lens.getBoundingClientRect();
      const sx = stage.clientWidth / area.width;
      const sy = stage.clientHeight / area.height;
      const x = (glass.left - area.left + glass.width / 2) * sx;
      const y = (glass.top - area.top + glass.height / 2) * sy;
      const w = glass.width * sx;
      const h = glass.height * sy;
      const key = `${x}|${y}|${w}|${h}`;
      if (key !== previous) {
        gl.uniform2f(uniforms.center, x, y);
        gl.uniform2f(uniforms.size, w, h);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        stage.dataset.optics = 'ready';
        previous = key;
        still = 0;
      } else {
        still++;
      }
    }
    if (still < 30) frame = requestAnimationFrame(tick);
  };
  const lost = (event: Event) => {
    event.preventDefault();
    ready = false;
    delete stage.dataset.optics;
  };
  // Fall back to the live CSS lens if the GPU context is lost.
  canvas.addEventListener('webglcontextlost', lost);
  image.onload = paintPoster;
  image.src = '/glass-wallpaper.svg';
  const resize = new ResizeObserver(paintPoster);
  resize.observe(stage);
  // Repaint when the preview switches between light and dark.
  const theme = new MutationObserver(paintPoster);
  theme.observe(stage, { attributes: true, attributeFilter: ['data-theme'] });
  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) wake();
  });
  intersection.observe(stage);
  // Dragging and pressing the lens rewrite its transform and scale.
  const moved = new MutationObserver(wake);
  moved.observe(lens, { attributes: true, attributeFilter: ['style'] });
  document.addEventListener('visibilitychange', wake);
  document.fonts.ready.then(() => { if (!stopped) paintPoster(); });
  wake();

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    theme.disconnect();
    intersection.disconnect();
    moved.disconnect();
    document.removeEventListener('visibilitychange', wake);
    image.onload = null;
    canvas.removeEventListener('webglcontextlost', lost);
    delete stage.dataset.optics;
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
}

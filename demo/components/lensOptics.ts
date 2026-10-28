/** Render the wallpaper through a convex lens, including on Safari where SVG
 * displacement cannot filter a live backdrop. The title lives inside the
 * draggable blob so it stays centered as the droplet moves. */
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
        float bevel = radius * .55;
        float t = clamp(depth / bevel, 0., 1.);
        float edge = 1. - t;
        float bend = radius * .4 * pow(edge, 1.9);
        vec2 ray = center + local + normal * bend;
        float split = bend * .018;
        vec3 glass = vec3(
          samplePoster(ray + normal * split).r,
          samplePoster(ray).g,
          samplePoster(ray - normal * split).b
        );
        // Fresnel reflection: a transparent centre, light gathering at the rim.
        float fresnel = pow(1. - t, 3.);
        float light = pow(abs(dot(normal, normalize(vec2(-.65, -1.)))), 3.);
        glass = mix(glass, vec3(.88, .95, 1.), .025 + fresnel * .15);
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
  const image = new Image();
  let stopped = false;
  let ready = false;
  let visible = true;
  let frame = 0;
  let previous = '';

  const paintPoster = () => {
    if (stopped || !image.complete || !image.naturalWidth) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    const density = Math.min(devicePixelRatio || 1, 2, gl.getParameter(gl.MAX_TEXTURE_SIZE) / Math.max(width, height));
    source.width = canvas.width = Math.round(width * density);
    source.height = canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const iw = image.naturalWidth * cover;
    const ih = image.naturalHeight * cover;
    context.drawImage(image, (width - iw) / 2, (height - ih) / 2, iw, ih);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.resolution, width, height);
    previous = '';
    ready = true;
  };
  const tick = () => {
    if (stopped) return;
    if (ready && visible && !document.hidden) {
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
      }
    }
    frame = requestAnimationFrame(tick);
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
  const intersection = new IntersectionObserver((entries) => { visible = entries.some((entry) => entry.isIntersecting); });
  intersection.observe(stage);
  document.fonts.ready.then(() => { if (!stopped) paintPoster(); });
  frame = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    image.onload = null;
    canvas.removeEventListener('webglcontextlost', lost);
    delete stage.dataset.optics;
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
}

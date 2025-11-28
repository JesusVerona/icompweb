// Toggle theme and fade-in
const themeToggle = (() => {
  const btn = document.createElement('button');
  btn.id = 'themeToggle';
  btn.className = 'toggle-btn';
  btn.style.border = 'none';
  btn.style.background = 'transparent';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '18px';
  btn.style.padding = '6px';

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (header) header.appendChild(btn);

    const html = document.documentElement;

    if (localStorage.getItem('icomp-theme') === 'light') {
      html.classList.add('light');
      btn.textContent = '☀️';
    } else {
      btn.textContent = '🌙';
    }

    btn.addEventListener('click', () => {
      html.classList.toggle('light');
      const light = html.classList.contains('light');
      localStorage.setItem('icomp-theme', light ? 'light' : 'dark');
      btn.textContent = light ? '☀️' : '🌙';
    });

    const main = document.querySelector('main');
    if (main) main.classList.add('fade-in');
  });
})();

// Resaltar link activo del menú
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('nav a');
  links.forEach(a => {
    if (
      window.location.pathname.endsWith(a.getAttribute('href')) ||
      (a.getAttribute('href') === 'index.html' && window.location.pathname.endsWith('/'))
    ) {
      a.style.background = 'rgba(255,255,255,0.03)';
      a.style.color = 'var(--cont)';
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("privacy-banner");
  const button = document.getElementById("pb-accept");
  if (!banner || !button) return;
  if (!localStorage.getItem("privacidadAceptada")) {
    banner.classList.remove("hidden");
  }
  button.addEventListener("click", function () {
    banner.classList.add("hidden");
    localStorage.setItem("privacidadAceptada", "true");
  });
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("blogForm");
    const imagenInput = document.getElementById("imagen");
    const tituloInput = document.getElementById("titulo");
    const textoInput = document.getElementById("texto");
    const postsContainer = document.getElementById("postsContainer");
    const postsCount = document.getElementById("postsCount");
    const clearPostsBtn = document.getElementById("clearPostsBtn");
    const clearActions = document.getElementById("clearActions");

    const imagePreview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImg");

    // Elementos del modal (lightbox)
    const modal = document.getElementById("modalImagen");
    const modalImg = document.getElementById("imgAmpliada");
    const btnCerrar = document.querySelector("#modalImagen .cerrar");

    const STORAGE_KEY = "miBlogPosts";

    // Cargar posts al iniciar
    let posts = cargarPosts();
    renderPosts();

    // Vista previa de imagen del formulario
    imagenInput.addEventListener("change", () => {
        const file = imagenInput.files[0];
        if (!file) {
            imagePreview.style.display = "none";
            previewImg.src = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    });

    // Manejo del envío del formulario
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const titulo = tituloInput.value.trim();
        const texto = textoInput.value.trim();

        if (!titulo || !texto) {
            alert("Por favor, completa el título y el contenido.");
            return;
        }

        const fecha = new Date();
        const nuevoPost = {
            id: Date.now(),
            titulo,
            texto,
            fecha: fecha.toISOString(),
            imagenBase64: null
        };

        const file = imagenInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                nuevoPost.imagenBase64 = e.target.result;
                guardarYRenderizar(nuevoPost);
            };
            reader.readAsDataURL(file);
        } else {
            guardarYRenderizar(nuevoPost);
        }
    });

    // Borrar todas las publicaciones
    clearPostsBtn.addEventListener("click", () => {
        if (confirm("¿Seguro que deseas borrar todas las publicaciones?")) {
            posts = [];
            guardarPosts();
            renderPosts();
        }
    });

    // Cerrar modal al dar clic en la X
    btnCerrar.addEventListener("click", () => {
        modal.style.display = "none";
        modalImg.src = "";
    });

    // Cerrar modal al dar clic fuera de la imagen
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            modalImg.src = "";
        }
    });

    // ===== Funciones auxiliares =====

    function guardarYRenderizar(nuevoPost) {
        posts.unshift(nuevoPost); // Agregar al inicio
        guardarPosts();
        renderPosts();
        form.reset();
        imagePreview.style.display = "none";
        previewImg.src = "";
    }

    function cargarPosts() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error leyendo posts de localStorage:", e);
            return [];
        }
    }

    function guardarPosts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    function formatearFecha(isoString) {
        const d = new Date(isoString);
        return d.toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function renderPosts() {
        postsContainer.innerHTML = "";

        if (!posts.length) {
            postsContainer.innerHTML =
                '<p class="posts-empty">Aún no hay publicaciones. Crea la primera usando el formulario.</p>';
            postsCount.textContent = "0 publicaciones";
            clearActions.style.display = "none";
            return;
        }

        postsCount.textContent = posts.length === 1
            ? "1 publicación"
            : posts.length + " publicaciones";

        clearActions.style.display = "flex";

        posts.forEach(post => {
            const postEl = document.createElement("article");
            postEl.className = "post";

            const imgContainer = document.createElement("div");
            imgContainer.className = "post-image";

            if (post.imagenBase64) {
                const img = document.createElement("img");
                img.src = post.imagenBase64;
                img.alt = post.titulo;
                img.style.cursor = "zoom-in";

                // Abrir imagen en grande
                img.addEventListener("click", () => {
                    modalImg.src = post.imagenBase64;
                    modal.style.display = "block";
                });

                imgContainer.appendChild(img);
            }

            const content = document.createElement("div");
            content.className = "post-content";

            const titleEl = document.createElement("h3");
            titleEl.textContent = post.titulo;

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = "Publicado el " + formatearFecha(post.fecha);

            const textEl = document.createElement("p");
            textEl.className = "post-text";
            textEl.textContent = post.texto;

            content.appendChild(titleEl);
            content.appendChild(meta);
            content.appendChild(textEl);

            postEl.appendChild(imgContainer);
            postEl.appendChild(content);

            postsContainer.appendChild(postEl);
        });
    }
});

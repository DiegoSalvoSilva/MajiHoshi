# MajiHoshi

Mini SPA para aprender Hiragana japonés: tabla de referencia, quiz de opción múltiple, vocabulario ilustrado y práctica de trazo en canvas con feedback de precisión.

HTML/CSS/JS puro (ES Modules), sin frameworks ni build step.

## Estructura

```
├── index.html
├── css/style.css
├── assets/vocab/  # fotos del vocabulario ilustrado (ver abajo)
└── js/
    ├── app.js         # punto de entrada
    ├── data.js        # dataset de hiragana (gojūon/dakuten/handakuten/yōon)
    ├── vocab-data.js  # dataset de vocabulario ilustrado (íconos/colores)
    ├── utils.js       # helpers compartidos
    ├── tabs.js        # navegación entre pestañas
    ├── study.js       # pestaña Estudio
    ├── quiz.js        # pestaña Práctica (quiz de opción múltiple)
    ├── vocab.js       # pestaña Vocabulario (escribir romaji a partir de una imagen)
    └── canvas.js      # pestaña Escritura (canvas + feedback de trazo)
```

## Desarrollo local

Como se usan ES Modules, hay que servir los archivos por HTTP (no abrir `index.html` directo con `file://`):

```bash
python -m http.server 8000
# o
npx serve .
```

Luego abrir `http://localhost:8000`.

## Fotos del vocabulario ilustrado

Las palabras de `js/vocab-data.js` se muestran por defecto con un ícono dibujado
o una muestra de color. Para reemplazar alguna por una foto real, basta con
poner el archivo en `assets/vocab/` nombrado igual que el **romaji** de la
palabra — la app la detecta sola, sin tocar código:

```
assets/vocab/hana.jpg     → はな (flor)
assets/vocab/yama.png     → やま (montaña)
```

Extensiones soportadas (en este orden de búsqueda): `.jpg`, `.jpeg`, `.png`, `.webp`.
Si el archivo no existe, se sigue mostrando el ícono normalmente — no rompe nada.

Usa fotos de bancos de licencia libre sin atribución obligatoria, como
[Pexels](https://www.pexels.com), [Pixabay](https://pixabay.com) o
[Unsplash](https://unsplash.com), y guárdalas directamente en el repo (no enlaces
externos) — el `Content-Security-Policy` en `vercel.json` solo permite imágenes
del propio sitio.

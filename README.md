# MajiHoshi

Mini SPA para aprender Hiragana japonés: tabla de referencia, quiz de opción múltiple y práctica de trazo en canvas con feedback de precisión.

HTML/CSS/JS puro (ES Modules), sin frameworks ni build step.

## Estructura

```
├── index.html
├── css/style.css
└── js/
    ├── app.js       # punto de entrada
    ├── data.js      # dataset de hiragana
    ├── utils.js     # helpers compartidos
    ├── tabs.js      # navegación entre pestañas
    ├── study.js     # pestaña Estudio
    ├── quiz.js      # pestaña Práctica (quiz)
    └── canvas.js    # pestaña Escritura (canvas + feedback de trazo)
```

## Desarrollo local

Como se usan ES Modules, hay que servir los archivos por HTTP (no abrir `index.html` directo con `file://`):

```bash
python -m http.server 8000
# o
npx serve .
```

Luego abrir `http://localhost:8000`.

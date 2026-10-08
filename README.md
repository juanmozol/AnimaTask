# AnimaTask

Prototipo interactivo móvil de gamificación de tareas: tus hábitos diarios hacen evolucionar criaturas originales mediante energías de Enfoque, Familia, Creatividad y Actividad.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # chequeo de tipos
npm run build    # build normal en dist/
```

## Compartir con amigos (un solo archivo)

```bash
npm run build:single
```

Genera `dist-single/index.html`: un único archivo con JS, CSS e imágenes incrustados. Se abre con doble clic en cualquier navegador, sin servidor ni instalación, y se puede enviar por correo o mensajería. Usa fuentes de Google si hay internet; sin conexión usa las del sistema.

> El botón "HTML" dentro de la app exporta una versión simplificada aparte (necesita internet); para compartir la app real usa `npm run build:single`.

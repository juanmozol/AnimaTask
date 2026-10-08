# AnimaTask

Prototipo interactivo móvil de gamificación de tareas: tus hábitos diarios hacen evolucionar a tu criatura (Numbik) mediante energías de Enfoque, Familia, Creatividad y Actividad. Como en Pokémon, pero con tareas: lo que haces (o dejas de hacer) decide en qué evoluciona.

## Árbol de evolución

```
Huevo → Principal ─┬─ Armonía: P2 Thylaguard → P3 Myrmora → P4 Astra-Kip Sabio
                   └─ Sombra:  B2 Noctifax   → B3 Skullican → B4 Umbra-Vorax
```

La forma **Principal** es común. La senda se decide al evolucionar desde ella, según el **balance de hábitos** (−100 Sombra … +100 Armonía): `balance ≥ 0` → P2-P4, `balance < 0` → B2-B4. Una vez elegida, la senda queda fija.

| Acción | Balance |
|---|---|
| Completar tarea | +2 (prioritaria +3) |
| Misión de cámara | +2 |
| Momento en familia | +10 |
| Tarea diaria sin completar al cerrar el día | −2 (prioritaria −4) |
| 3+ días sin momento en familia (por día) | −5 |

- El día se cierra a medianoche (calendario real). Si vuelves tras varios días, el castigo se limita a 3 días.
- Botón 🌙 de la cabecera: **simula el fin del día** para probar la senda de Sombra sin esperar. Con el Bloqueo Familiar (+10 al registrar el momento) hacen falta al menos 2 pulsaciones antes de evolver.
- Solo Numbik está disponible; las demás especies figuran como "Próximamente".

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # chequeo de tipos
npm run build    # build normal en dist/
```

Las reglas de balance están en `src/game/balance.ts` y el catálogo de formas en `src/data/initialData.ts`.

## Compartir con amigos (un solo archivo)

```bash
npm run build:single
```

Genera `dist-single/index.html`: un único archivo con JS, CSS e imágenes incrustados. Se abre con doble clic en cualquier navegador, sin servidor ni instalación, y se puede enviar por correo o mensajería. Usa fuentes de Google si hay internet; sin conexión usa las del sistema.

> El botón "HTML" dentro de la app exporta una versión simplificada aparte (necesita internet); para compartir la app real usa `npm run build:single`.

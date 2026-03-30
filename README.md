# Sushi Go Scoreboard

App web simple para cargar una partida de Sushi Go y calcular el puntaje de 3 rondas más pudines finales.

## Estado actual

- Landing con selección de `2` a `5` jugadores
- Carga de nombres
- Tablero estilo anotador con rondas, pudines y total
- Puntaje completo de:
  - Maki
  - Tempura
  - Sashimi
  - Gyoza
  - Nigiri + Wasabi
  - Pudín al final
- Carga manual rápida con miniaturas reales de cartas
- Interfaz ajustada para celular

## Estructura

- `docs/index.html`: shell de la app
- `docs/app.js`: estado, UI y scoring
- `docs/styles.css`: estilos
- `docs/assets/`: imágenes de la portada y de las cartas

## Cómo publicarlo en GitHub Pages

Este proyecto está preparado para publicarse desde la carpeta `docs/`.

En GitHub:

1. Entrá a `Settings`
2. Abrí `Pages`
3. En `Build and deployment`, elegí:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/docs`
4. Guardá y esperá unos minutos

## Cómo actualizarlo desde la terminal

```bash
cd /Users/martin/Documents/sushi-go-online
git add .
git commit -m "update"
git push
```

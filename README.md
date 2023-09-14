# Sonolus PJSekai Engine Extended

Fork of [Sonolus PJSekai Engine](https://github.com/NonSpicyBurrito/sonolus-pjsekai-engine) with additional features.

## Links

-   [Sonolus Website](https://sonolus.com)
-   [Sonolus Wiki](https://github.com/NonSpicyBurrito/sonolus-wiki)

## Installation

```
# TODO
```

## Custom Resources

### Skin Sprites

In addition to the original skin sprites, this engine also supports the following sprites:

| Name                                     |
| ---------------------------------------- |
| `Sekai+ Note Slim Gray Left`             |
| `Sekai+ Note Slim Gray Middle`           |
| `Sekai+ Note Slim Gray Right`            |
| `Sekai+ Note Slim Yellow Left`           |
| `Sekai+ Note Slim Yellow Middle`         |
| `Sekai+ Note Slim Yellow Right`          |
| `Sekai+ Note Slim Red Left`              |
| `Sekai+ Note Slim Red Middle`            |
| `Sekai+ Note Slim Red Right`             |
| `Sekai+ Slot Glow Gray`                  |
| `Sekai+ Slot Glow Yellow`                |

### Effect Clips

In addition to the original effect clips, this engine also supports the following clips:

| Name                                     |
| ---------------------------------------- |
| `Sekai+ Trace`                           |
| `Sekai+ Critical Trace`                  |
| `Sekai+ Trace Flick`                     |

## Documentation

### `version`

Package version.

### `engineInfo`

Partial engine information compatible with [sonolus-express](https://github.com/NonSpicyBurrito/sonolus-express).

### `engineConfiguration`

Engine Configuration.

-   `engineConfiguration.path`: path to file.
-   `engineConfiguration.buffer`: buffer of file.
-   `engineConfiguration.hash`: hash of file.

### `enginePlayData`

Engine Play Data.

-   `enginePlayData.path`: path to file.
-   `enginePlayData.buffer`: buffer of file.
-   `enginePlayData.hash`: hash of file.

### `enginePreviewData`

Engine Preview Data.

-   `enginePreviewData.path`: path to file.
-   `enginePreviewData.buffer`: buffer of file.
-   `enginePreviewData.hash`: hash of file.

### `engineTutorialData`

Engine Tutorial Data.

-   `engineTutorialData.path`: path to file.
-   `engineTutorialData.buffer`: buffer of file.
-   `engineTutorialData.hash`: hash of file.

### `engineThumbnail`

Engine Thumbnail.

-   `engineThumbnail.path`: path to file.
-   `engineThumbnail.buffer`: buffer of file.
-   `engineThumbnail.hash`: hash of file.

### `susToUSC(sus)`

Converts sus chart to USC (Universal Sekai Chart).

-   `sus`: sus chart.

### `uscToLevelData(usc, offset?)`

Converts USC (Universal Sekai Chart) to Level Data.

-   `usc`: usc chart.
-   `offset`: offset (default: `0`).

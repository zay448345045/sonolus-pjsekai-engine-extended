import { skin } from '../../skin.mjs'
import { DummySlide } from './DummySlide.mjs'

export class YellowDummySlide extends DummySlide {
    sprites = {
        normal: skin.sprites.dummySlideYellow,
        fallback: skin.sprites.criticalSlideConnectorNormal,
        secondaryFallback: skin.sprites.criticalSlideConnectorFallback,
    }
}

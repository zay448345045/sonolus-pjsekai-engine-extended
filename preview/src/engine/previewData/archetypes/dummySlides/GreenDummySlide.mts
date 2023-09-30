import { skin } from '../../skin.mjs'
import { DummySlide } from './DummySlide.mjs'

export class GreenDummySlide extends DummySlide {
    sprites = {
        normal: skin.sprites.dummySlideGreen,
        fallback: skin.sprites.normalSlideConnectorNormal,
        secondaryFallback: skin.sprites.normalSlideConnectorFallback,
    }
}

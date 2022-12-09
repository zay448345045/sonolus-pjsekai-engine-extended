import { defineScripts } from 'sonolus.js'
import { flickNote } from './flick-note'
import { initialization } from './initialization'
import { input } from './input'
import { judge } from './judge'
import { longSfx } from './long-sfx'
import { simLine } from './sim-line'
import { slideConnector } from './slide-connector'
import { slideEnd } from './slide-end'
import { slideEndFlick } from './slide-end-flick'
import { slideStart } from './slide-start'
import { slideTick } from './slide-tick'
import { slotEffect } from './slot-effect'
import { slotGlowEffect } from './slot-glow-effect'
import { stage } from './stage'
import { tapNote } from './tap-note'
import { traceFlick } from './trace-flick'
import { traceNote } from './trace-note'

export const scripts = defineScripts({
    initialization,
    stage,
    input,

    tapNote: () => tapNote(false),
    flickNote: () => flickNote(false),
    slideStart: () => slideStart(false),
    slideTick: () => slideTick(false),
    slideEnd: () => slideEnd(false),
    slideEndFlick: () => slideEndFlick(false),
    slideConnector: () => slideConnector(false),

    criticalTapNote: () => tapNote(true),
    criticalFlickNote: () => flickNote(true),
    criticalSlideStart: () => slideStart(true),
    criticalSlideTick: () => slideTick(true),
    criticalSlideEnd: () => slideEnd(true),
    criticalSlideEndFlick: () => slideEndFlick(true),
    criticalSlideConnector: () => slideConnector(true),

    slideHiddenTick: () => slideTick(false, false),

    traceNote: () => traceNote(false),
    traceFlick: () => traceFlick(false, false),

    criticalTraceNote: () => traceNote(true),
    criticalTraceFlick: () => traceFlick(true, false),

    traceNdFlick: () => traceFlick(false, true),

    simLine,

    slotEffect,
    slotGlowEffect,
    judgeRenderer: judge,
    longSfx,
})

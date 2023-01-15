import { ParticleEffect } from 'sonolus-core'
import {
    Add,
    And,
    bool,
    Divide,
    EntityMemory,
    Equal,
    Greater,
    GreaterOr,
    If,
    InputAccuracy,
    InputBucket,
    InputBucketValue,
    InputJudgment,
    InputOffset,
    Multiply,
    Not,
    NotEqual,
    Or,
    Script,
    Subtract,
    Time,
    TouchDX,
    TouchDY,
    TouchT,
    TouchVR,
} from 'sonolus.js'
import { options } from '../../configuration/options'
import { buckets } from '../buckets'
import { arrowRedSprite, arrowYellowSprite, getArrowLayout } from './common/arrow-sprite'
import { criticalTraceClip, Layer, minFlickVR, windows } from './common/constants'
import { playNoteEffect, playNoteLaneEffect, playSlotEffect } from './common/effect'
import { onMiss, setJudgeVariable } from './common/judge'
import {
    applyMirrorDirections,
    checkNoteTimeInEarlyWindow,
    checkTouchXInNoteHitbox,
    initializeNoteSimLine,
    InputState,
    noteBottom,
    NoteData,
    noteInputState,
    noteScale,
    noteSpawnTime,
    noteTop,
    noteZ,
    preprocessNote,
    scheduleNoteAutoSFX,
    updateNoteY,
} from './common/note'
import {
    calculateNoteLayout,
    getNoteLayout,
    noteTraceRedSprite,
    noteTraceYellowSprite,
} from './common/note-sprite'
import { getTraceFlickClip, playJudgmentSFX } from './common/sfx'
import {
    calculateTickLayout,
    getTickLayout,
    tickRedSprite,
    tickYellowSprite,
} from './common/tick-sprite'
import { checkDirection, checkTouchYInHitbox } from './common/touch'
import { disallowStart, rotateAngle } from './input'

export function traceFlick(isCritical: boolean, isNonDirectonal: boolean): Script {
    const bucket = isCritical
        ? buckets.criticalTraceFlickIndex
        : isNonDirectonal
        ? buckets.traceNdFlickIndex
        : buckets.traceFlickIndex
    const window = isCritical ? windows.slideEndFlick.critical : windows.slideEndFlick.normal
    const noteSprite = isCritical ? noteTraceYellowSprite : noteTraceRedSprite
    const tickSprite = isCritical ? tickYellowSprite : tickRedSprite
    const arrowSprite = isCritical ? arrowYellowSprite : arrowRedSprite

    const noteLayout = getNoteLayout(EntityMemory.to(0))
    const tickLayout = getTickLayout(EntityMemory.to(8))
    const arrowLayout = getArrowLayout(EntityMemory.to(14))
    const arrowZ = EntityMemory.to<number>(51)

    const preprocess = [
        preprocessNote(bucket, window.good.late, 0.25, Layer.NoteBody),
        applyMirrorDirections(NoteData.direction),
        calculateNoteLayout(NoteData.center, NoteData.width, noteLayout),
        calculateTickLayout(NoteData.center, NoteData.width, tickLayout),
        arrowSprite.calculateLayout(
            NoteData.center,
            NoteData.width,
            NoteData.direction,
            arrowLayout
        ),
        arrowZ.set(Subtract(Layer.NoteArrow, Divide(NoteData.time, 1000))),
    ]

    const spawnOrder = noteSpawnTime

    const shouldSpawn = GreaterOr(Time, noteSpawnTime)

    const initialize = initializeNoteSimLine()

    const touch = Or(
        options.isAutoplay,
        And(
            Not(bool(noteInputState)),
            checkNoteTimeInEarlyWindow(0),
            Not(disallowStart),
            GreaterOr(TouchVR, minFlickVR),
            checkTouchYInHitbox(),
            checkTouchXInNoteHitbox(),
            [onComplete(), rotateAngle.set(Add(rotateAngle.get(), Multiply(NoteData.center, -2)))]
        )
    )

    const updateParallel = [
        scheduleNoteAutoSFX(getTraceFlickClip(isCritical)),
        Or(
            And(options.isAutoplay, GreaterOr(Time, NoteData.time)),
            Equal(noteInputState, InputState.Terminated),
            Greater(Subtract(Time, NoteData.time, InputOffset), window.good.late),
            [
                updateNoteY(),

                noteSprite.draw(noteScale, noteBottom, noteTop, noteLayout, noteZ),
                tickSprite.draw(noteScale, noteBottom, noteTop, tickLayout, Add(noteZ, 1)),
                isNonDirectonal ? [] : [arrowSprite.draw(noteScale, arrowLayout, arrowZ)],
            ]
        ),
    ]

    const terminate = And(options.isAutoplay, playVisualEffects())

    const updateSequential = [
        // DebugLog(window.good.late),
        If(
            Or(
                GreaterOr(Subtract(Time, NoteData.time, InputOffset), window.good.late),
                And(options.isAutoplay, GreaterOr(Time, NoteData.time))
            ),
            [onMiss],
            []
        ),
    ]
    return {
        preprocess,
        spawnOrder,
        shouldSpawn,
        initialize,
        touch,
        updateSequential,
        updateParallel,
        terminate,
    }

    function onComplete() {
        return [
            noteInputState.set(InputState.Terminated),

            InputJudgment.set(1),
            InputAccuracy.set(Subtract(TouchT, InputOffset, NoteData.time)),
            isNonDirectonal
                ? []
                : Or(
                      NotEqual(InputJudgment, 1),
                      checkDirection(TouchDX, TouchDY, NoteData.direction),
                      [InputJudgment.set(2), InputAccuracy.set(window.perfect.late)]
                  ),
            InputBucket.set(bucket),
            InputBucketValue.set(Multiply(InputAccuracy, 1000)),

            playVisualEffects(),
            setJudgeVariable(),

            playJudgmentSFX(isCritical, getTraceFlickClip),
        ]
    }

    function playVisualEffects() {
        return [
            playNoteLaneEffect(),
            isNonDirectonal
                ? playNoteEffect(
                      ParticleEffect.NoteCircularTapRed,
                      ParticleEffect.NoteLinearTapRed,
                      0,
                      'normal'
                  )
                : playNoteEffect(
                      isCritical
                          ? ParticleEffect.NoteCircularTapYellow
                          : ParticleEffect.NoteCircularTapRed,
                      isCritical
                          ? ParticleEffect.NoteLinearTapYellow
                          : ParticleEffect.NoteLinearTapRed,
                      isCritical
                          ? ParticleEffect.NoteLinearAlternativeYellow
                          : ParticleEffect.NoteLinearAlternativeRed,
                      'flick'
                  ),
            playSlotEffect(isCritical ? 4 : 1),
        ]
    }
}

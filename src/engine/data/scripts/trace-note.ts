import { ParticleEffect } from 'sonolus-core'
import {
    Add,
    And,
    bool,
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
    Or,
    Script,
    Subtract,
    Time,
    TouchId,
    TouchST,
    TouchStarted,
} from 'sonolus.js'
import { options } from '../../configuration/options'
import { buckets } from '../buckets'
import { Layer, windows } from './common/constants'
import { playNoteEffect, playNoteLaneEffect, playSlotEffect } from './common/effect'
import { onMiss, setAutoJudge, setJudgeVariable } from './common/judge'
import {
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
    shouldSpawn,
    updateNoteY,
} from './common/note'
import {
    calculateNoteLayout,
    getNoteLayout,
    noteTraceGraySprite,
    noteTraceYellowSprite,
} from './common/note-sprite'
import { getTraceClip, playJudgmentSFX } from './common/sfx'
import {
    calculateTickLayout,
    getTickLayout,
    tickGraySprite,
    tickYellowSprite,
} from './common/tick-sprite'
import { checkTouchYInHitbox } from './common/touch'
import { disallowEmpties, disallowEnds, disallowStart } from './input'

export function traceNote(isCritical: boolean): Script {
    const bucket = isCritical ? buckets.criticalTraceNoteIndex : buckets.traceNoteIndex
    const window = isCritical ? windows.tapNote.critical : windows.tapNote.normal
    const noteSprite = isCritical ? noteTraceYellowSprite : noteTraceGraySprite
    const tickSprite = isCritical ? tickYellowSprite : tickGraySprite

    const noteLayout = getNoteLayout(EntityMemory.to(0))
    const tickLayout = getTickLayout(EntityMemory.to(8))

    const preprocess = [
        preprocessNote(bucket, window.good.late, 0.25, Layer.NoteBody),
        calculateNoteLayout(NoteData.center, NoteData.width, noteLayout),
        calculateTickLayout(NoteData.center, NoteData.width, tickLayout),
    ]

    const spawnOrder = noteSpawnTime

    const initialize = [initializeNoteSimLine()]

    const touch = Or(
        options.isAutoplay,
        And(
            Not(bool(noteInputState)),
            Or(
                And(checkNoteTimeInEarlyWindow(window.good.early), TouchStarted),
                checkNoteTimeInEarlyWindow(0)
            ),
            Not(disallowStart),
            checkTouchYInHitbox(),
            checkTouchXInNoteHitbox(),
            onComplete()
        )
    )

    const updateParallel = [
        scheduleNoteAutoSFX(getTraceClip(isCritical)),
        Or(
            And(options.isAutoplay, GreaterOr(Time, NoteData.time)),
            Equal(noteInputState, InputState.Terminated),
            Greater(Subtract(Time, NoteData.time, InputOffset), window.good.late),
            [
                updateNoteY(),

                noteSprite.draw(noteScale, noteBottom, noteTop, noteLayout, noteZ),
                tickSprite.draw(noteScale, noteBottom, noteTop, tickLayout, Add(noteZ, 1)),
            ]
        ),
    ]

    const terminate = [And(options.isAutoplay, [playVisualEffects(), setAutoJudge()])]
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
        updateParallel: {
            code: updateParallel,
            order: 1000,
        },
        terminate,
    }

    function onComplete() {
        return [
            noteInputState.set(InputState.Terminated),
            If(
                TouchStarted,
                [
                    InputJudgment.set(1),
                    InputAccuracy.set(Subtract(TouchST, InputOffset, NoteData.time)),
                    InputBucket.set(bucket),
                    InputBucketValue.set(Multiply(InputAccuracy, 1000)),
                    disallowStart.set(true),
                    disallowEmpties.add(TouchId),
                    disallowEnds.add(TouchId, Time),
                ],
                [InputJudgment.set(1), InputAccuracy.set(0)]
            ),
            setJudgeVariable(),
            playVisualEffects(),
            playJudgmentSFX(isCritical, getTraceClip),
        ]
    }

    function playVisualEffects() {
        return [
            playNoteLaneEffect(),
            playNoteEffect(
                isCritical
                    ? ParticleEffect.NoteCircularTapYellow
                    : ParticleEffect.NoteCircularTapNeutral,
                isCritical
                    ? ParticleEffect.NoteLinearTapYellow
                    : ParticleEffect.NoteLinearTapNeutral,
                0,
                'normal'
            ),
            // playNoteEffect(
            //     isCritical
            //         ? ParticleEffect.NoteCircularAlternativeYellow
            //         : ParticleEffect.NoteCircularAlternativeBase,
            //     isCritical
            //         ? ParticleEffect.NoteLinearTapYellow
            //         : ParticleEffect.NoteLinearTapBase,
            //     0,
            //     'tick'
            // ),
            playSlotEffect(isCritical ? 4 : 0),
        ]
    }
}

import { EffectClip, ParticleEffect } from 'sonolus-core'
import {
    And,
    bool,
    EntityMemory,
    Equal,
    Greater,
    GreaterOr,
    If,
    InputAccuracy,
    InputJudgment,
    Less,
    Not,
    Or,
    Script,
    Time,
    TouchId,
    TouchStarted,
} from 'sonolus.js'
import { options } from '../../configuration/options'
import { buckets } from '../buckets'
import { Layer, windows } from './common/constants'
import { playNoteEffect, playNoteLaneEffect, playSlotEffect } from './common/effect'
import { currentJudge, judgeTime, setAutoJudge, setJudgeVariable } from './common/judge'
import {
    checkNoteTimeInEarlyWindow,
    checkNoteTimeInLateWindow,
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
    updateNoteY,
} from './common/note'
import { calculateNoteLayout, getNoteLayout, notePurpleSprite } from './common/note-sprite'
import { playJudgmentSFX } from './common/sfx'
import { checkTouchYInHitbox } from './common/touch'
import { disallowEmpties, disallowEnds, disallowStart } from './input'

export function damageNote(): Script {
    const bucket = buckets.damageNoteIndex
    const window = windows.tapNote.normal
    const noteSprite = notePurpleSprite

    const noteLayout = getNoteLayout(EntityMemory.to(0))

    const preprocess = [
        preprocessNote(bucket, window.good.late, 0.625, Layer.NoteBody),
        calculateNoteLayout(NoteData.center, NoteData.width, noteLayout),
    ]

    const spawnOrder = noteSpawnTime

    const shouldSpawn = GreaterOr(Time, noteSpawnTime)

    const initialize = [initializeNoteSimLine(), InputJudgment.set(1), InputAccuracy.set(0)]

    const touch = Or(
        options.isAutoplay,
        And(
            Not(bool(noteInputState)),
            checkNoteTimeInLateWindow(window.perfect.late),
            Or(
                And(checkNoteTimeInEarlyWindow(window.great.early), TouchStarted),
                checkNoteTimeInEarlyWindow(0)
            ),
            Not(disallowStart),
            checkTouchYInHitbox(),
            checkTouchXInNoteHitbox(),
            onComplete()
        )
    )

    const updateParallel = Or(
        And(options.isAutoplay, GreaterOr(Time, NoteData.time)),
        Equal(noteInputState, InputState.Terminated),
        Less(noteBottom, -1),
        [updateNoteY(), noteSprite.draw(noteScale, noteBottom, noteTop, noteLayout, noteZ)]
    )

    const terminate = [And(options.isAutoplay, [playVisualEffects(), setAutoJudge()])]
    const updateSequential = [
        // DebugLog(window.good.late),
        If(
            Or(And(Greater(noteBottom, 1)), Equal(noteInputState, InputState.Terminated)),
            [currentJudge.set(0), judgeTime.set(Time)],
            []
        ),
    ]

    return {
        preprocess: {
            code: preprocess,
        },
        spawnOrder: {
            code: spawnOrder,
        },
        shouldSpawn: {
            code: shouldSpawn,
        },
        initialize: {
            code: initialize,
        },
        touch: {
            code: touch,
        },
        updateSequential: {
            code: updateSequential,
        },
        updateParallel: {
            code: updateParallel,
        },
        terminate: {
            code: terminate,
        },
    }

    function onComplete() {
        return [
            disallowStart.set(true),
            disallowEmpties.add(TouchId),
            disallowEnds.add(TouchId, Time),
            noteInputState.set(InputState.Terminated),
            InputJudgment.set(0),
            setJudgeVariable(),
            playVisualEffects(),
            playJudgmentSFX(false, () => EffectClip.Good),
        ]
    }

    function playVisualEffects() {
        return [
            playNoteLaneEffect(),
            playNoteEffect(
                ParticleEffect.NoteCircularTapPurple,
                ParticleEffect.NoteLinearTapPurple,
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
            playSlotEffect(5),
        ]
    }
}

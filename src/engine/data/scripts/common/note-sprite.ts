import { SkinSprite } from 'sonolus-core'
import {
    Abs,
    Add,
    And,
    Code,
    customSkinSprite,
    Draw,
    GreaterOr,
    HasSkinSprite,
    If,
    LessOr,
    Multiply,
    Not,
    Or,
    Pointer,
    Subtract,
    Unlerp,
} from 'sonolus.js'
import { options } from '../../../configuration/options'
import { baseNote, engineId, extEngineId, noteFirstAppearY, origin } from './constants'
import { getLayout, Tuple } from './utils'

export type NoteLayout = Tuple<Code<number>, 8>
export type WritableNoteLayout = Tuple<Pointer<number>, 8>

export function getNoteLayout(pointer: Pointer) {
    return getLayout(pointer, 8)
}

export function calculateNoteLayout(
    center: Code<number>,
    width: Code<number>,
    layout: WritableNoteLayout
) {
    return [
        layout[0].set(Multiply(Subtract(center, width), baseNote.tw)),
        layout[1].set(Multiply(Add(center, width), baseNote.tw)),
        layout[2].set(Multiply(Subtract(center, width), baseNote.bw)),
        layout[3].set(Multiply(Add(center, width), baseNote.bw)),
        layout[4].set(Add(layout[0], Multiply(baseNote.tw, 0.25))),
        layout[5].set(Add(layout[1], Multiply(baseNote.tw, -0.25))),
        layout[6].set(Add(layout[2], Multiply(baseNote.bw, 0.25))),
        layout[7].set(Add(layout[3], Multiply(baseNote.bw, -0.25))),
    ]
}

export class NoteSprite {
    public readonly left: Code<number>
    public readonly mid: Code<number>
    public readonly right: Code<number>
    public readonly fallback: Code<number>
    public readonly exists: Code<boolean>

    public constructor(color: number, skinEngineId: number = engineId) {
        this.left = customSkinSprite(skinEngineId, 10 + color)
        this.mid = customSkinSprite(skinEngineId, 20 + color)
        this.right = customSkinSprite(skinEngineId, 30 + color)
        this.fallback = SkinSprite.NoteHeadNeutral + color
        this.exists = And(...[this.left, this.mid, this.right].map(HasSkinSprite))
    }

    public draw(
        scale: Code<number>,
        bottom: Code<number>,
        top: Code<number>,
        layout: NoteLayout,
        z: Code<number>,
        alpha: Code<number> = 1
    ) {
        return And(
            Not(options.hideNotes),
            GreaterOr(Unlerp(origin, baseNote.b, bottom), noteFirstAppearY),
            Or(
                LessOr(Abs(Subtract(layout[0], layout[1])), 0),
                If(
                    this.exists,
                    [
                        Draw(
                            this.mid,
                            Multiply(layout[6], scale),
                            bottom,
                            Multiply(layout[4], scale),
                            top,
                            Multiply(layout[5], scale),
                            top,
                            Multiply(layout[7], scale),
                            bottom,
                            z,
                            alpha
                        ),
                        Draw(
                            this.left,
                            Multiply(layout[2], scale),
                            bottom,
                            Multiply(layout[0], scale),
                            top,
                            Multiply(layout[4], scale),
                            top,
                            Multiply(layout[6], scale),
                            bottom,
                            z,
                            alpha
                        ),
                        Draw(
                            this.right,
                            Multiply(layout[7], scale),
                            bottom,
                            Multiply(layout[5], scale),
                            top,
                            Multiply(layout[1], scale),
                            top,
                            Multiply(layout[3], scale),
                            bottom,
                            z,
                            alpha
                        ),
                    ],
                    Draw(
                        this.fallback,
                        Multiply(layout[2], scale),
                        bottom,
                        Multiply(layout[0], scale),
                        top,
                        Multiply(layout[1], scale),
                        top,
                        Multiply(layout[3], scale),
                        bottom,
                        z,
                        alpha
                    )
                )
            )
        )
    }
}

export const noteRedSprite = new NoteSprite(1)
export const noteGreenSprite = new NoteSprite(2)
export const noteYellowSprite = new NoteSprite(4)
export const noteCyanSprite = new NoteSprite(6)

export const noteTraceGraySprite = new NoteSprite(1, extEngineId)
export const noteTraceYellowSprite = new NoteSprite(2, extEngineId)
export const noteTraceRedSprite = new NoteSprite(3, extEngineId)
export const noteDamageSprite = new NoteSprite(4, extEngineId)

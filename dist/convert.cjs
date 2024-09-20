"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uscToLevelData = void 0;
const core_1 = require("@sonolus/core");
const usctool_1 = require("usctool");
const uscToLevelData = (usc, offset = 0) => {
    const entities = [];
    const timeToIntermediates = new Map();
    const intermediateToRef = new Map();
    const intermediateToEntity = new Map();
    let i = 0;
    const getRef = (intermediate) => {
        let ref = intermediateToRef.get(intermediate);
        if (ref)
            return ref;
        ref = (i++).toString(36);
        intermediateToRef.set(intermediate, ref);
        const entity = intermediateToEntity.get(intermediate);
        if (entity)
            entity.name = ref;
        return ref;
    };
    const append = (intermediate) => {
        const entity = {
            archetype: intermediate.archetype,
            data: [],
        };
        if (intermediate.sim) {
            const beat = intermediate.data[core_1.EngineArchetypeDataName.Beat];
            if (typeof beat !== 'number')
                throw new Error('Unexpected beat');
            const intermediates = timeToIntermediates.get(beat);
            if (intermediates) {
                intermediates.push(intermediate);
            }
            else {
                timeToIntermediates.set(beat, [intermediate]);
            }
        }
        const ref = intermediateToRef.get(intermediate);
        if (ref)
            entity.name = ref;
        intermediateToEntity.set(intermediate, entity);
        entities.push(entity);
        for (const [name, value] of Object.entries(intermediate.data)) {
            if (typeof value === 'number') {
                entity.data.push({
                    name,
                    value,
                });
            }
            else if (typeof value === 'boolean') {
                entity.data.push({
                    name,
                    value: value ? 1 : 0,
                });
            }
            else if (typeof value === 'string') {
                entity.data.push({
                    name,
                    ref: value,
                });
            }
            else {
                entity.data.push({
                    name,
                    ref: getRef(value),
                });
            }
        }
        if ('timeScaleGroup' in intermediate) {
            entity.data.push({
                name: `timeScaleGroup`,
                ref: `tsg:${intermediate.timeScaleGroup ?? 0}`,
            });
        }
    };
    append({
        archetype: 'Initialization',
        data: {},
        sim: false,
    });
    append({
        archetype: 'InputManager',
        data: {},
        sim: false,
    });
    append({
        archetype: 'Stage',
        data: {},
        sim: false,
    });
    let tsGroupIndex = -1;
    const tsGroupEntities = [];
    const tsChangeEntities = [];
    for (const tsGroup of usc.objects) {
        if (tsGroup.type !== 'timeScaleGroup')
            continue;
        tsGroupIndex++;
        const changes = [...tsGroup.changes];
        changes.sort((a, b) => a.beat - b.beat);
        for (const [index, change] of Object.entries(changes)) {
            tsChangeEntities.push({
                archetype: 'TimeScaleChange',
                data: [
                    {
                        name: core_1.EngineArchetypeDataName.Beat,
                        value: change.beat,
                    },
                    {
                        name: 'timeScale',
                        value: change.timeScale === 0 ? 0.000001 : change.timeScale,
                    },
                    tsGroup.changes[+index + 1] === undefined
                        ? {
                            name: 'next',
                            value: -1,
                        }
                        : {
                            name: 'next',
                            ref: `tsc:${tsGroupIndex}:${+index + 1}`,
                        },
                ],
                name: `tsc:${tsGroupIndex}:${index}`,
            });
        }
        tsGroupEntities.push({
            archetype: 'TimeScaleGroup',
            data: [
                {
                    name: 'first',
                    ref: `tsc:${tsGroupIndex}:0`,
                },
                {
                    name: 'length',
                    value: tsGroup.changes.length,
                },
                tsGroupIndex === tsGroup.changes.length - 1
                    ? {
                        name: 'next',
                        value: -1,
                    }
                    : {
                        name: 'next',
                        ref: `tsg:${tsGroupIndex + 1}`,
                    },
            ],
            name: `tsg:${tsGroupIndex}`,
        });
    }
    if (tsGroupIndex === -1) {
        entities.push({
            archetype: 'TimeScaleGroup',
            data: [
                {
                    name: 'first',
                    ref: `tsc:0:0`,
                },
                {
                    name: 'length',
                    value: 0,
                },
            ],
            name: `tsg:0`,
        });
        entities.push({
            archetype: 'TimeScaleChange',
            data: [
                {
                    name: core_1.EngineArchetypeDataName.Beat,
                    value: 0,
                },
                {
                    name: 'timeScale',
                    value: 1,
                },
                {
                    name: `timeScaleGroup`,
                    ref: 'trg:0',
                },
            ],
            name: 'tsc:0:0',
        });
    }
    else {
        entities.push(...tsGroupEntities);
        entities.push(...tsChangeEntities);
    }
    for (const object of usc.objects) {
        handlers[object.type](object, append);
    }
    for (const intermediates of timeToIntermediates.values()) {
        for (let i = 1; i < intermediates.length; i++) {
            append({
                archetype: 'SimLine',
                data: {
                    a: intermediates[i - 1],
                    b: intermediates[i],
                },
                sim: false,
            });
        }
    }
    return {
        bgmOffset: usc.offset + offset,
        entities,
    };
};
exports.uscToLevelData = uscToLevelData;
const directions = {
    left: -1,
    up: 0,
    right: 1,
};
const eases = {
    outin: -2,
    out: -1,
    linear: 0,
    in: 1,
    inout: 2
};
const slideStarts = {
    tap: 0,
    trace: 1,
    none: 2,
};
const bpm = (object, append) => {
    append({
        archetype: core_1.EngineArchetypeName.BpmChange,
        data: {
            [core_1.EngineArchetypeDataName.Beat]: object.beat,
            [core_1.EngineArchetypeDataName.Bpm]: object.bpm,
        },
        sim: false,
    });
};
const timeScaleGroup = () => undefined;
const single = (object, append) => {
    const intermediate = {
        archetype: object.critical ? 'CriticalTapNote' : 'NormalTapNote',
        data: {
            [core_1.EngineArchetypeDataName.Beat]: object.beat,
            lane: object.lane,
            size: object.size,
        },
        timeScaleGroup: object.timeScaleGroup,
        sim: true,
    };
    if (object.trace) {
        intermediate.archetype = object.critical ? 'CriticalTraceNote' : 'NormalTraceNote';
        if (object.direction) {
            if (object.direction === 'none') {
                intermediate.archetype = 'NonDirectionalTraceFlickNote';
            }
            else {
                intermediate.archetype = object.critical
                    ? 'CriticalTraceFlickNote'
                    : 'NormalTraceFlickNote';
                intermediate.data.direction = directions[object.direction];
            }
        }
    }
    else {
        if (object.direction) {
            intermediate.archetype = object.critical ? 'CriticalFlickNote' : 'NormalFlickNote';
            if (object.direction === 'none') {
                return;
            }
            intermediate.data.direction = directions[object.direction];
        }
    }
    append(intermediate);
};
const damage = (object, append) => {
    const intermediate = {
        archetype: 'DamageNote',
        data: {
            [core_1.EngineArchetypeDataName.Beat]: object.beat,
            lane: object.lane,
            size: object.size,
        },
        sim: false,
        timeScaleGroup: object.timeScaleGroup,
    };
    append(intermediate);
};
const slide = (object, append) => {
    const cis = [];
    const joints = [];
    const attaches = [];
    const ends = [];
    let startType = 'tap';
    const connections = getConnections(object);
    for (const [i, connection] of connections.entries()) {
        if (i === 0) {
            if (connection.type !== 'start')
                continue;
            let archetype;
            let sim = true;
            if (connection.judgeType === 'none') {
                archetype = 'HiddenSlideStartNote';
                sim = false;
                startType = 'none';
            }
            else if (connection.judgeType === 'trace') {
                if (connection.critical) {
                    archetype = 'CriticalTraceSlideStartNote';
                }
                else {
                    archetype = 'NormalTraceSlideStartNote';
                }
                startType = 'trace';
            }
            else {
                if (connection.critical) {
                    archetype = 'CriticalSlideStartNote';
                }
                else {
                    archetype = 'NormalSlideStartNote';
                }
                startType = 'tap';
            }
            const ci = {
                archetype,
                data: {
                    [core_1.EngineArchetypeDataName.Beat]: connection.beat,
                    lane: connection.lane,
                    size: connection.size,
                },
                sim,
                ease: connection.ease,
                timeScaleGroup: connection.timeScaleGroup,
            };
            cis.push(ci);
            joints.push(ci);
            continue;
        }
        if (i === connections.length - 1) {
            if (connection.type !== 'end')
                continue;
            let ci;
            if (connection.judgeType === 'none') {
                ci = {
                    archetype: 'HiddenSlideTickNote',
                    data: {
                        [core_1.EngineArchetypeDataName.Beat]: connection.beat,
                        lane: connection.lane,
                        size: connection.size,
                    },
                    sim: false,
                    timeScaleGroup: connection.timeScaleGroup,
                };
            }
            else {
                let archetype;
                if (connection.judgeType === 'trace') {
                    if (connection.critical) {
                        archetype = 'CriticalTraceSlideEndNote';
                    }
                    else {
                        archetype = 'NormalTraceSlideEndNote';
                    }
                }
                else {
                    if (connection.critical) {
                        archetype = 'CriticalSlideEndNote';
                    }
                    else {
                        archetype = 'NormalSlideEndNote';
                    }
                }
                ci = {
                    archetype,
                    data: {
                        [core_1.EngineArchetypeDataName.Beat]: connection.beat,
                        lane: connection.lane,
                        size: connection.size,
                    },
                    sim: true,
                    timeScaleGroup: connection.timeScaleGroup,
                };
                if (connection.direction != undefined) {
                    ci.archetype = connection.critical
                        ? 'CriticalSlideEndFlickNote'
                        : 'NormalSlideEndFlickNote';
                    ci.data.direction = directions[connection.direction];
                }
            }
            cis.push(ci);
            joints.push(ci);
            ends.push(ci);
            continue;
        }
        switch (connection.type) {
            case 'tick': {
                const ci = {
                    archetype: 'HiddenSlideTickNote',
                    data: {
                        [core_1.EngineArchetypeDataName.Beat]: connection.beat,
                        lane: connection.lane,
                        size: connection.size,
                    },
                    sim: false,
                    ease: connection.ease,
                    timeScaleGroup: connection.timeScaleGroup,
                };
                if (connection.critical != undefined)
                    ci.archetype = connection.critical
                        ? 'CriticalSlideTickNote'
                        : 'NormalSlideTickNote';
                cis.push(ci);
                joints.push(ci);
                break;
            }
            case 'attach': {
                const ci = {
                    archetype: 'IgnoredSlideTickNote',
                    data: {
                        [core_1.EngineArchetypeDataName.Beat]: connection.beat,
                    },
                    sim: false,
                };
                if ('critical' in connection)
                    ci.archetype = connection.critical
                        ? 'CriticalAttachedSlideTickNote'
                        : 'NormalAttachedSlideTickNote';
                if ('timeScaleGroup' in connection)
                    ci.timeScaleGroup = connection.timeScaleGroup;
                cis.push(ci);
                attaches.push(ci);
                break;
            }
            case 'start':
            case 'end':
                throw new Error('Unexpected slide tick');
        }
    }
    const connectors = [];
    const start = cis[0];
    for (const [i, joint] of joints.entries()) {
        if (i === 0)
            continue;
        const head = joints[i - 1];
        if (!head.ease)
            throw new Error('Unexpected missing ease');
        const archetype = object.critical ? 'CriticalSlideConnector' : 'NormalSlideConnector';
        connectors.push({
            archetype,
            data: {
                start,
                end: ends[0],
                head,
                tail: joint,
                ease: eases[head.ease],
                startType: slideStarts[startType],
            },
            sim: false,
        });
    }
    for (const attach of attaches) {
        const index = cis.indexOf(attach);
        const tailIndex = joints.findIndex((c) => cis.indexOf(c) > index);
        attach.data.attach = connectors[tailIndex - 1];
    }
    for (const end of ends) {
        end.data.slide = connectors[connectors.length - 1];
    }
    for (const ci of cis) {
        append(ci);
    }
    for (const connector of connectors) {
        append(connector);
    }
};
const guide = (object, append) => {
    const start = object.midpoints[0];
    const end = object.midpoints[object.midpoints.length - 1];
    for (const [i, joint] of object.midpoints.entries()) {
        if (i === 0)
            continue;
        const head = object.midpoints[i - 1];
        if (!head.ease)
            throw new Error('Unexpected missing ease');
        append({
            archetype: 'Guide',
            data: {
                color: usctool_1.USCColor[object.color],
                fade: usctool_1.USCFade[object.fade],
                ease: eases[head.ease],
                startLane: start.lane,
                startSize: start.size,
                startBeat: start.beat,
                startTimeScaleGroup: `tsg:${start.timeScaleGroup ?? 0}`,
                headLane: head.lane,
                headSize: head.size,
                headBeat: head.beat,
                headTimeScaleGroup: `tsg:${head.timeScaleGroup ?? 0}`,
                tailLane: joint.lane,
                tailSize: joint.size,
                tailBeat: joint.beat,
                tailTimeScaleGroup: `tsg:${joint.timeScaleGroup ?? 0}`,
                endLane: end.lane,
                endSize: end.size,
                endBeat: end.beat,
                endTimeScaleGroup: `tsg:${end.timeScaleGroup ?? 0}`,
            },
            sim: false,
        });
    }
};
const handlers = {
    bpm,
    single,
    timeScaleGroup,
    slide,
    guide,
    damage,
};
const getConnections = (object) => {
    const connections = [...object.connections];
    const beats = connections.map(({ beat }) => beat).sort((a, b) => a - b);
    const min = beats[0];
    const max = beats[beats.length - 1];
    const start = Math.max(Math.ceil(min / 0.5) * 0.5, Math.floor(min / 0.5 + 1) * 0.5);
    for (let beat = start; beat < max; beat += 0.5) {
        connections.push({
            type: 'attach',
            beat,
        });
    }
    const startStep = connections.find(({ type }) => type === 'start');
    const endStep = connections.find(({ type }) => type === 'end');
    const steps = connections.filter(({ type }) => type === 'tick' || type === 'attach');
    steps.sort((a, b) => a.beat - b.beat);
    if (!startStep)
        throw 'Missing start';
    if (!endStep)
        throw 'Missing end';
    return [startStep, ...steps, endStep];
};

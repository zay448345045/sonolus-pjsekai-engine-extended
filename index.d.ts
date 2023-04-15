import { LevelData } from 'sonolus-core';
import { Fannithm } from './fannithm/convert';
import { Resource } from './Resource';
export declare const version = "0.2.0";
export declare const engineInfo: {
    readonly name: "pjsekai";
    readonly version: 7;
    readonly title: {
        readonly en: "Project Sekai";
        readonly ja: "プロセカ";
        readonly ko: "프로젝트 세카이";
        readonly zhs: "世界计划";
        readonly zht: "世界計劃";
    };
    readonly subtitle: {
        readonly en: "Project Sekai: Colorful Stage!";
        readonly ja: "プロジェクトセカイ カラフルステージ!";
        readonly ko: "프로젝트 세카이: 컬러풀 스테이지!";
        readonly zhs: "世界计划 彩色舞台";
        readonly zht: "世界計畫 繽紛舞台！";
    };
    readonly author: {
        readonly en: "Burrito";
    };
    readonly description: {
        readonly en: string;
    };
};
export declare const engineConfiguration: Resource;
export declare const engineData: Resource;
export declare const engineThumbnail: Resource;
export declare function fromSus(sus: string, bgmOffset?: number, chartOffset?: number): LevelData;
export declare function fromFannithm(fannithm: Fannithm, bgmOffset?: number, chartOffset?: number): LevelData;

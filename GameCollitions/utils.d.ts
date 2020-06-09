declare class celerSDK {
    public static onStateReceived(callback: (msg: string) => void): void;
    public static onCourtModeStarted(callback: Function): void;
    public static getMatch(): MatchInfo;
    public static showCourtModeDialog(): void;
    public static start(): void;
    public static sendState(e: any): void;
    public static draw(e: any): void;
    public static win(e: any): void;
    public static lose(e: any): void;
    public static surrender(e: any): void;
    public static applyAction(e: any, a: any): void;
    public static getOnChainState(callback: (msg: string) => void): void;
    public static submitScore(score: int): void;
    public static ready(): void;
    public static onStart(callback: Function): void;
    public static provideScore(callback: () => number): void;
    public static provideCurrentFrameData(callback: Function): void;
    public static didTakeSnapshot(imageData: string): void;
    public static log(msg: string): void;
}

interface MatchInfo {
    matchId: string;
    sharedRandomSeed: number;
    shouldLaunchTutorial: boolean;
}

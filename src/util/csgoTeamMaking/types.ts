export type Player = {
    discId: string;
    HLTV: number;
};

export type TeamPair = {
    teamOne: Player[];
    teamTwo: Player[];
    avgHLTVDiff: number;
};

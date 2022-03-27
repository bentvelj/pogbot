export type Player = {
    discId: string;
    HLTV: number;
    ADR: number;
    WR: number;
};

export type TeamPair = {
    teamOne: Player[];
    teamTwo: Player[];
    avgHLTVDiff: number;
    avgADRDiff: number;
    avgWRDiff: number;
};

export type Player = {
    discId: string;
    HLTV: number;
    ADR: number;
    WR: number;
    HSP: number;
};

export type TeamPair = {
    teamOne: Player[];
    teamTwo: Player[];
    avgHLTVDiff: number;
    avgADRDiff: number;
    avgWRDiff: number;
    avgHSPDiff: number;
};

export type PlayerStats = {
    HLTV: number;
    WR: number;
    ADR: number;
    HSP: number;
};

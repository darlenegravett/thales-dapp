type AccountInfo = {
    balance: number;
    rawBalance: string;
    index: number;
    proof: string[];
};

export type Airdrop = {
    isClaimPaused: boolean;
    hasClaimRights: boolean;
    claimed: boolean;
    accountInfo?: AccountInfo;
};

export type VestingInfo = {
    startTime: number;
    endTime: number;
    initialLocked: number;
    totalClaimed: number;
    unlocked: number;
};

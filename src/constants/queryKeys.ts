import { NetworkId } from 'utils/network';
import { SpaceKey } from './governance';

export const QUERY_KEYS = {
    WalletBalances: {
        RetroAirdrop: (walletAddress: string, networkId: NetworkId) => [
            'walletBalances',
            'retroAirdrop',
            walletAddress,
            networkId,
        ],
        Synths: (walletAddress: string, networkId: NetworkId) => ['walletBalances', 'synths', walletAddress, networkId],
        ETH: (walletAddress: string, networkId: NetworkId) => ['walletBalances', 'ETH', walletAddress, networkId],
        Tokens: (walletAddress: string, networkId: NetworkId) => ['walletBalances', 'tokens', walletAddress, networkId],
        Thales: (walletAddress: string, networkId: NetworkId) => ['walletBalances', 'thales', walletAddress, networkId],
        OpThales: (walletAddress: string, networkId: NetworkId) => [
            'walletBalances',
            'opThales',
            walletAddress,
            networkId,
        ],
        Vesting: (walletAddress: string, networkId: NetworkId) => [
            'walletBalances',
            'vesting',
            walletAddress,
            networkId,
        ],
    },
    Rates: {
        ExchangeRates: (networkId: NetworkId) => ['rates', 'exchangeRates', networkId],
        ExchangeRatesMarketData: (networkId: NetworkId) => ['rates', 'exchangeRatesMarketData', networkId],
    },
    Synths: {
        FrozenSynths: ['synths', 'frozenSynths'],
    },
    Medium: {
        Posts: ['medium', 'posts'],
    },
    Network: {
        EthGasPrice: ['network', 'ethGasPrice'],
        EthGasPriceEip1559: (networkId: NetworkId) => ['network', 'ethGasPriceEip1559', networkId],
    },
    BinaryOptions: {
        Markets: (networkId: NetworkId) => ['binaryOptions', 'markets', networkId],
        SynthsMap: (networkId: NetworkId) => ['binaryOptions', 'synthsMap', networkId],
        Market: (marketAddress: string) => ['binaryOptions', 'markets', marketAddress],
        MarketFlippening: () => ['binaryOptions', 'marketFlippening'],
        ETHBTCMarketCapRatioHistory: () => ['binaryOptions', 'ETHBTCMarketCapRatioHistory'],
        EthBurnedCount: () => ['binaryOptions', 'ethBurnedCount'],
        AccountMarketInfo: (marketAddress: string, accountAddress: string) => [
            'binaryOptions',
            'markets',
            marketAddress,
            accountAddress,
        ],
        RecentTransactions: (marketAddress: string) => ['binaryOptions', 'transactions', marketAddress],
        UserTransactions: (marketAddress: string, walletAddress: string) => [
            'binaryOptions',
            'transactions',
            marketAddress,
            walletAddress,
        ],
        UserMarkets: (walletAddress: string, networkId: NetworkId) => [
            'binaryOptions',
            'userMarkets',
            walletAddress,
            networkId,
        ],
        OptionPrices: (marketAddress: string) => ['binaryOptions', marketAddress],
        MarketOrderBook: (optionsTokenAddress: string) => ['binaryOptions', 'marketOrderBook', optionsTokenAddress],
        AllTrades: (networkId: NetworkId) => ['binaryOptions', 'allTrades', networkId],
        Trades: (marketAddress: string) => ['binaryOptions', 'trades', marketAddress],
        UserTrades: (marketAddress: string, walletAddress: string) => [
            'binaryOptions',
            'trades',
            marketAddress,
            walletAddress,
        ],
        Leaderboard: (networkId: NetworkId) => ['binaryOptions', 'leaderboard', networkId],
        Profiles: (networkId: NetworkId) => ['binaryOptions', 'profiles', networkId],
        Competition: (networkId: NetworkId) => ['binaryOptions', 'competition', networkId],
        Orders: (orderType: string, networkId: NetworkId) => ['binaryOptions', 'orders', orderType, networkId],
        OrdersCount: (networkId: NetworkId) => ['binaryOptions', 'ordersCount', networkId],
        AmmMaxLimits: (marketAddress: string) => ['binaryOptions', 'amm', marketAddress],
    },
    User: {
        Watchlist: (walletAddress: string, networkId: NetworkId) => ['user', 'watchlist', walletAddress, networkId],
        Orders: (walletAddress: string, networkId: NetworkId) => ['user', 'orders', walletAddress, networkId],
        Assets: (walletAddress: string, networkId: NetworkId) => ['user', 'assets', walletAddress, networkId],
        DisplayName: (walletAddress: string) => ['user', 'displayName', walletAddress],
        DisplayNames: () => ['user', 'displayNames'],
        TwitterAccount: (walletAddress: string) => ['user', 'twitterAccount', walletAddress],
        TwitterAccounts: () => ['user', 'twitterAccounts'],
        VerifiedTwitterAccounts: () => ['user', 'verifiedTwitterAccounts'],
    },
    Staking: {
        Thales: (walletAddress: string, networkId: NetworkId) => ['staking', 'thales', walletAddress, networkId],
        Escrow: (walletAddress: string, networkId: NetworkId) => ['staking', 'escrow', walletAddress, networkId],
    },
    Token: {
        Transactions: (walletAddress: string, networkId: NetworkId) => [
            'token',
            'transactions',
            walletAddress,
            networkId,
        ],
        VestingSchedule: (walletAddress: string, networkId: NetworkId) => [
            'token',
            'vesting',
            'schedule',
            walletAddress,
            networkId,
        ],
        Info: (networkId: NetworkId) => ['token', 'info', networkId],
        StakingMigrationOptout: (walletAddress: string, networkId: NetworkId) => [
            'token',
            'stakingMigrationOptout',
            walletAddress,
            networkId,
        ],
        StakingRewards: (walletAddress: string, networkId: NetworkId) => [
            'token',
            'stakingRewards',
            walletAddress,
            networkId,
        ],
        MigratedRewards: (walletAddress: string, networkId: NetworkId) => [
            'token',
            'migratedRewards',
            walletAddress,
            networkId,
        ],
        LPStaking: (walletAddress: string, networkId: NetworkId) => ['token', 'LPStaking', walletAddress, networkId],
        GelatoBalance: (walletAddress: string, networkId: NetworkId) => [
            'token',
            'GelatoBalance',
            walletAddress,
            networkId,
        ],
        Gelato: () => ['token', 'Gelato'],
    },
    Swap: {
        Tokens: (networkId: NetworkId) => ['swap', 'tokens', networkId],
        Quote: (networkId: NetworkId) => ['swap', 'quote', networkId],
        Approve: (networkId: NetworkId) => ['swap', 'approve', networkId],
        Swap: (networkId: NetworkId) => ['swap', 'swap', networkId],
    },
    Royale: {
        Data: (walletAddress: string) => ['royale', 'data', walletAddress],
        User: (walletAddress: string) => ['royale', 'user', walletAddress],
        Players: () => ['royale', 'players'],
        Rounds: (networkId: NetworkId, season?: number) => ['royale', 'rounds', networkId, season],
        Seasons: (networkId: NetworkId) => ['royale', 'Seasons', networkId],
        Positions: (networkId: NetworkId) => ['royale', 'positions', networkId],
        PlayerPositions: (networkId: NetworkId, season: number, address: string) => [
            'royale',
            'positions',
            networkId,
            season,
            address,
        ],
        EthBalance: (walletAddress: string) => ['royale', 'ethBalance', walletAddress],
        EthPrice: () => ['royale', 'ethPrice'],
        LatestRoyaleData: () => ['royale', 'latestRoyaleData'],
        LatestRoyaleDataForUserCard: (season: number) => ['royale', 'LatestRoyaleDataForUserCard', season],
        LatestSeason: () => ['royale', 'latestSeason'],
        RoyaleArenaContract: (season: number, walletAddress: string) => [
            'royale',
            'royaleArenaContract',
            season,
            walletAddress,
        ],
        RoyaleDataForScoreboard: (season: number) => ['royale', 'royaleDataForScoreboad', season],
        FooterData: (season: number) => ['royale', 'footerData', season],
    },
    Governance: {
        Proposals: (spaceKey: SpaceKey) => ['governance', 'proposals', spaceKey],
        Proposal: (spaceKey: SpaceKey, hash: string, walletAddress: string) => [
            'governance',
            'proposal',
            spaceKey,
            hash,
            walletAddress,
        ],
        CouncilMembers: () => ['governance', 'councilMembers'],
        ThalesStakers: () => ['governance', 'thalesStakers'],
        VotingPower: (proposalId: string, snapshot: string, walletAddress: string) => [
            'governance',
            'votingPower',
            proposalId,
            snapshot,
            walletAddress,
        ],
    },
};

export default QUERY_KEYS;

import { NetworkId } from '@synthetixio/contracts-interface';

export const binaryOptionsMarketDataContract = {
    addresses: {
        [NetworkId.Mainnet]: '0x5ed98Ebb66A929758C7Fe5Ac60c979aDF0F4040a',
        [NetworkId.Ropsten]: '0x708f748CD51dcFaE38F9f18ae928007F293898ce',
        [NetworkId.Rinkeby]: 'TBD',
        [NetworkId.Kovan]: '0x547818b1ee8bd9a6d5854e8A9E84E066B9a07aA7',
        // added to resolve error with typings
        [NetworkId.Goerli]: '', // TODO: goerli network remove or implement
        [NetworkId['Mainnet-Ovm']]: '0xBE086E0A2c588Ad64C8530048cE4356190D6a6F3',
        [NetworkId['Kovan-Ovm']]: '0x6382660BF24f5e7BeC43a7D47591F823488FDB8D',
    },
    abi: [
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
                {
                    internalType: 'contract IERC20',
                    name: '_sUSD',
                    type: 'address',
                },
                {
                    internalType: 'contract IPriceFeed',
                    name: '_priceFeed',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_expiryDuration',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_maxTimeToMaturity',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_creatorCapitalRequirement',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'constructor',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'value',
                    type: 'uint256',
                },
            ],
            name: 'CreatorCapitalRequirementUpdated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'duration',
                    type: 'uint256',
                },
            ],
            name: 'ExpiryDurationUpdated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'market',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'creator',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'bytes32',
                    name: 'oracleKey',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'strikePrice',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'maturityDate',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'expiryDate',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'long',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'short',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'customMarket',
                    type: 'bool',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'customOracle',
                    type: 'address',
                },
            ],
            name: 'MarketCreated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'enabled',
                    type: 'bool',
                },
            ],
            name: 'MarketCreationEnabledUpdated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'market',
                    type: 'address',
                },
            ],
            name: 'MarketExpired',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'contract BinaryOptionMarketManager',
                    name: 'receivingManager',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'contract BinaryOptionMarket[]',
                    name: 'markets',
                    type: 'address[]',
                },
            ],
            name: 'MarketsMigrated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'contract BinaryOptionMarketManager',
                    name: 'migratingManager',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'contract BinaryOptionMarket[]',
                    name: 'markets',
                    type: 'address[]',
                },
            ],
            name: 'MarketsReceived',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'duration',
                    type: 'uint256',
                },
            ],
            name: 'MaxTimeToMaturityUpdated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'oldOwner',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'newOwner',
                    type: 'address',
                },
            ],
            name: 'OwnerChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'newOwner',
                    type: 'address',
                },
            ],
            name: 'OwnerNominated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'isPaused',
                    type: 'bool',
                },
            ],
            name: 'PauseChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_binaryOptionMarketFactory',
                    type: 'address',
                },
            ],
            name: 'SetBinaryOptionsMarketFactory',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'enabled',
                    type: 'bool',
                },
            ],
            name: 'SetCustomMarketCreationEnabled',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'manager',
                    type: 'address',
                },
            ],
            name: 'SetMigratingManager',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_address',
                    type: 'address',
                },
            ],
            name: 'SetPriceFeed',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_zeroExAddress',
                    type: 'address',
                },
            ],
            name: 'SetZeroExAddress',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_address',
                    type: 'address',
                },
            ],
            name: 'SetsUSD',
            type: 'event',
        },
        {
            constant: false,
            inputs: [],
            name: 'acceptOwnership',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'pageSize',
                    type: 'uint256',
                },
            ],
            name: 'activeMarkets',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: '_address',
                    type: 'address',
                },
            ],
            name: 'addWhitelistedAddress',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'binaryOptionMarketFactory',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'capitalRequirement',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'oracleKey',
                    type: 'bytes32',
                },
                {
                    internalType: 'uint256',
                    name: 'strikePrice',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'maturity',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'initialMint',
                    type: 'uint256',
                },
                {
                    internalType: 'bool',
                    name: 'customMarket',
                    type: 'bool',
                },
                {
                    internalType: 'address',
                    name: 'customOracle',
                    type: 'address',
                },
            ],
            name: 'createMarket',
            outputs: [
                {
                    internalType: 'contract IBinaryOptionMarket',
                    name: '',
                    type: 'address',
                },
            ],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'customMarketCreationEnabled',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'delta',
                    type: 'uint256',
                },
            ],
            name: 'decrementTotalDeposited',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [],
            name: 'disableWhitelistedAddresses',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'durations',
            outputs: [
                {
                    internalType: 'uint256',
                    name: 'expiryDuration',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'maxTimeToMaturity',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [],
            name: 'enableWhitelistedAddresses',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address[]',
                    name: 'markets',
                    type: 'address[]',
                },
            ],
            name: 'expireMarkets',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'delta',
                    type: 'uint256',
                },
            ],
            name: 'incrementTotalDeposited',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [
                {
                    internalType: 'address',
                    name: 'candidate',
                    type: 'address',
                },
            ],
            name: 'isActiveMarket',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [
                {
                    internalType: 'address',
                    name: 'candidate',
                    type: 'address',
                },
            ],
            name: 'isKnownMarket',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'lastPauseTime',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'marketCreationEnabled',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'pageSize',
                    type: 'uint256',
                },
            ],
            name: 'maturedMarkets',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'contract BinaryOptionMarketManager',
                    name: 'receivingManager',
                    type: 'address',
                },
                {
                    internalType: 'bool',
                    name: 'active',
                    type: 'bool',
                },
                {
                    internalType: 'contract BinaryOptionMarket[]',
                    name: 'marketsToMigrate',
                    type: 'address[]',
                },
            ],
            name: 'migrateMarkets',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'nominateNewOwner',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'nominatedOwner',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'numActiveMarkets',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'numMaturedMarkets',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'onlyWhitelistedAddressesCanCreateMarkets',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'owner',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'paused',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'priceFeed',
            outputs: [
                {
                    internalType: 'contract IPriceFeed',
                    name: '',
                    type: 'address',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'bool',
                    name: 'active',
                    type: 'bool',
                },
                {
                    internalType: 'contract BinaryOptionMarket[]',
                    name: 'marketsToReceive',
                    type: 'address[]',
                },
            ],
            name: 'receiveMarkets',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: '_address',
                    type: 'address',
                },
            ],
            name: 'removeWhitelistedAddress',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: 'market',
                    type: 'address',
                },
            ],
            name: 'resolveMarket',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'sUSD',
            outputs: [
                {
                    internalType: 'contract IERC20',
                    name: '',
                    type: 'address',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: '_binaryOptionMarketFactory',
                    type: 'address',
                },
            ],
            name: 'setBinaryOptionsMarketFactory',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_creatorCapitalRequirement',
                    type: 'uint256',
                },
            ],
            name: 'setCreatorCapitalRequirement',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'bool',
                    name: 'enabled',
                    type: 'bool',
                },
            ],
            name: 'setCustomMarketCreationEnabled',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_expiryDuration',
                    type: 'uint256',
                },
            ],
            name: 'setExpiryDuration',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'bool',
                    name: 'enabled',
                    type: 'bool',
                },
            ],
            name: 'setMarketCreationEnabled',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_maxTimeToMaturity',
                    type: 'uint256',
                },
            ],
            name: 'setMaxTimeToMaturity',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'contract BinaryOptionMarketManager',
                    name: 'manager',
                    type: 'address',
                },
            ],
            name: 'setMigratingManager',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'bool',
                    name: '_paused',
                    type: 'bool',
                },
            ],
            name: 'setPaused',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: '_address',
                    type: 'address',
                },
            ],
            name: 'setPriceFeed',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address[]',
                    name: '_whitelistedAddresses',
                    type: 'address[]',
                },
            ],
            name: 'setWhitelistedAddresses',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: '_address',
                    type: 'address',
                },
            ],
            name: 'setsUSD',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'totalDeposited',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [
                {
                    internalType: 'address',
                    name: 'sender',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: 'receiver',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: 'amount',
                    type: 'uint256',
                },
            ],
            name: 'transferSusdTo',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'whitelistedAddresses',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
    ],
};

export default binaryOptionsMarketDataContract;

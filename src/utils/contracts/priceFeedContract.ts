import { NetworkId } from '@synthetixio/contracts-interface';

export const priceFeedContract = {
    addresses: {
        [NetworkId.Mainnet]: 'TBD',
        [NetworkId.Ropsten]: '0x4a1e5AF88f39Ad09BC3fAc3563B77F4f8A55F3Da',
        [NetworkId.Rinkeby]: 'TBD',
        [NetworkId.Kovan]: '0x750dCAdcA8e9e7f9702c85383119ea8034450993',
        // added to resolve error with typings
        [NetworkId.Goerli]: '', // TODO: goerli network remove or implement
        [NetworkId['Mainnet-Ovm']]: '0xf4aef21d906992aFAdde7A9676e1dB4feb6390DD',
        [NetworkId['Kovan-Ovm']]: '0xDa00B46a924dA3019b2F5fC13E770956F75C04C7',
    },
    abi: [
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'token', type: 'address' }],
            name: 'AddressChangedETH',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'token', type: 'address' }],
            name: 'AddressChangedwETH',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' },
                { indexed: false, internalType: 'address', name: 'aggregator', type: 'address' },
            ],
            name: 'AggregatorAdded',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' },
                { indexed: false, internalType: 'address', name: 'aggregator', type: 'address' },
            ],
            name: 'AggregatorRemoved',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: false, internalType: 'address', name: 'newOwner', type: 'address' },
            ],
            name: 'OwnerChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'newOwner', type: 'address' }],
            name: 'OwnerNominated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' },
                { indexed: false, internalType: 'address', name: 'pool', type: 'address' },
            ],
            name: 'PoolAdded',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' },
                { indexed: false, internalType: 'address', name: 'pool', type: 'address' },
            ],
            name: 'PoolRemoved',
            type: 'event',
        },
        {
            inputs: [],
            name: '_ETH',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: '_wETH',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        { inputs: [], name: 'acceptOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        {
            inputs: [
                { internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' },
                { internalType: 'address', name: 'aggregatorAddress', type: 'address' },
            ],
            name: 'addAggregator',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' },
                { internalType: 'address', name: 'currencyAddress', type: 'address' },
                { internalType: 'address', name: 'poolAddress', type: 'address' },
            ],
            name: 'addPool',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            name: 'aggregatorKeys',
            outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
            name: 'aggregators',
            outputs: [{ internalType: 'contract AggregatorV2V3Interface', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
            name: 'currencyKeyDecimals',
            outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            name: 'currencyKeys',
            outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'getCurrencies',
            outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'getRates',
            outputs: [{ internalType: 'uint256[]', name: 'rates', type: 'uint256[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'nominateNewOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'nominatedOwner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'owner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
            name: 'pools',
            outputs: [{ internalType: 'contract IUniswapV3Pool', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' }],
            name: 'rateAndUpdatedTime',
            outputs: [
                { internalType: 'uint256', name: 'rate', type: 'uint256' },
                { internalType: 'uint256', name: 'time', type: 'uint256' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' }],
            name: 'rateForCurrency',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' }],
            name: 'removeAggregator',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: 'currencyKey', type: 'bytes32' }],
            name: 'removePool',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
            name: 'setETH',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'setOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'int56', name: '_twapInterval', type: 'int56' }],
            name: 'setTwapInterval',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
            name: 'setWETH',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        { inputs: [], name: 'transferCurrencyKeys', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        {
            inputs: [{ internalType: 'address', name: 'proxyAddress', type: 'address' }],
            name: 'transferOwnershipAtInit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'twapInterval',
            outputs: [{ internalType: 'int56', name: '', type: 'int56' }],
            stateMutability: 'view',
            type: 'function',
        },
    ],
};

export default priceFeedContract;

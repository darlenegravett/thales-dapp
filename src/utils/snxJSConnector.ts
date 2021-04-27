import { ethers, Signer } from 'ethers';
import { synthSummaryUtilContract } from './contracts/synthSummaryUtilContract';
import binaryOptionsMarketDataContract from './contracts/binaryOptionsMarketDataContract';
import keyBy from 'lodash/keyBy';
import initSynthetixJS, { Synth } from '@synthetixio/contracts-interface';
import { SynthsMap, ContractSettings } from 'types/synthetix';

type SnxJSConnector = {
    initialized: boolean;
    snxJS: ReturnType<typeof initSynthetixJS> | null;
    synths: Synth[];
    synthsMap: SynthsMap;
    provider: ethers.providers.Provider | undefined;
    signer: Signer | undefined;
    synthSummaryUtilContract: ethers.Contract;
    binaryOptionsMarketDataContract: ethers.Contract;
    setContractSettings: (contractSettings: ContractSettings) => void;
};

// @ts-ignore
const snxJSConnector: SnxJSConnector = {
    initialized: false,

    setContractSettings: function (contractSettings: ContractSettings) {
        this.initialized = true;
        this.snxJS = initSynthetixJS(contractSettings);
        this.synths = this.snxJS.synths;
        this.synthsMap = keyBy(this.synths, 'name');
        this.signer = contractSettings.signer;
        this.provider = contractSettings.provider;
        this.synthSummaryUtilContract = new ethers.Contract(
            synthSummaryUtilContract.addresses[contractSettings.networkId],
            synthSummaryUtilContract.abi,
            this.provider
        );
        this.binaryOptionsMarketDataContract = new ethers.Contract(
            binaryOptionsMarketDataContract.addresses[contractSettings.networkId],
            binaryOptionsMarketDataContract.abi,
            this.provider
        );
    },
};

export default snxJSConnector;

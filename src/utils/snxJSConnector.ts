import { ethers, Signer } from 'ethers';
import binaryOptionsMarketDataContract from './contracts/binaryOptionsMarketDataContract';
import binaryOptionsMarketManagerContract from './contracts/binaryOptionsMarketManagerContract';
import vestingEscrow from './contracts/vestingEscrow';
import airdrop from './contracts/airdrop';
import ongoingAirdrop from './contracts/ongoingAirdrop';
import stakingThales from './contracts/stakingThales';
import thalesContract from './contracts/thalesContract';
import escrowThales from './contracts/escrowThales';
import priceFeedContract from './contracts/priceFeedContract';
import limitOrderProtocol1inchContract from './contracts/limitOrderProtocol1inchContract';
import ammContract from './contracts/ammContract';
import thalesRoyaleContract from './contracts/thalesRoyalContract';
import thalesExchangerContract from './contracts/thalesExchangerContract';
import opThalesContract from './contracts/opThalesContract';
import lpStakingRewardsContract from './contracts/lpStakingRewardsContract';
import { synthetix, SynthetixJS, Config } from '@synthetixio/contracts-interface';
import { gelatoContract } from './contracts/gelatoContract';

type SnxJSConnector = {
    initialized: boolean;
    snxJS: SynthetixJS | null;
    provider: ethers.providers.Provider | undefined;
    signer: Signer | undefined;
    binaryOptionsMarketDataContract: ethers.Contract;
    binaryOptionsMarketManagerContract: ethers.Contract;
    retroAirdropContract?: ethers.Contract;
    vestingEscrowContract?: ethers.Contract;
    ongoingAirdropContract?: ethers.Contract;
    stakingThalesContract?: ethers.Contract;
    thalesTokenContract?: ethers.Contract;
    escrowThalesContract?: ethers.Contract;
    priceFeedContract?: ethers.Contract;
    limitOrderProtocol1inchContract?: ethers.Contract;
    ammContract?: ethers.Contract;
    thalesRoyaleContract?: ethers.Contract;
    thalesExchangerContract?: ethers.Contract;
    opThalesTokenContract?: ethers.Contract;
    lpStakingRewardsContract?: ethers.Contract;
    gelatoContract?: ethers.Contract;
    setContractSettings: (contractSettings: Config) => void;
};

// @ts-ignore
const snxJSConnector: SnxJSConnector = {
    initialized: false,

    setContractSettings: function (contractSettings: Config) {
        this.initialized = true;
        this.snxJS = synthetix(contractSettings);
        this.signer = contractSettings.signer;
        this.provider = contractSettings.provider;
        this.binaryOptionsMarketDataContract = initializeContract(binaryOptionsMarketDataContract, contractSettings);
        this.binaryOptionsMarketManagerContract = initializeContract(
            binaryOptionsMarketManagerContract,
            contractSettings
        );
        this.retroAirdropContract = conditionalInitializeContract(airdrop, contractSettings);
        this.vestingEscrowContract = conditionalInitializeContract(vestingEscrow, contractSettings);
        this.ongoingAirdropContract = conditionalInitializeContract(ongoingAirdrop, contractSettings);
        this.stakingThalesContract = conditionalInitializeContract(stakingThales, contractSettings);
        this.thalesTokenContract = conditionalInitializeContract(thalesContract, contractSettings);
        this.escrowThalesContract = conditionalInitializeContract(escrowThales, contractSettings);
        this.priceFeedContract = conditionalInitializeContract(priceFeedContract, contractSettings);
        this.limitOrderProtocol1inchContract = conditionalInitializeContract(
            limitOrderProtocol1inchContract,
            contractSettings
        );
        this.ammContract = conditionalInitializeContract(ammContract, contractSettings);
        this.thalesRoyaleContract = conditionalInitializeContract(thalesRoyaleContract, contractSettings);
        this.thalesExchangerContract = conditionalInitializeContract(thalesExchangerContract, contractSettings);
        this.opThalesTokenContract = conditionalInitializeContract(opThalesContract, contractSettings);
        this.lpStakingRewardsContract = conditionalInitializeContract(lpStakingRewardsContract, contractSettings);
        this.gelatoContract = conditionalInitializeContract(gelatoContract, contractSettings);
    },
};

const initializeContract = (contract: any, contractSettings: Config) =>
    new ethers.Contract(contract.addresses[contractSettings.networkId || 1], contract.abi, snxJSConnector.provider);

const conditionalInitializeContract = (contract: any, contractSettings: Config) =>
    contract.addresses[contractSettings.networkId || 1] !== 'TBD'
        ? new ethers.Contract(
              contract.addresses[contractSettings.networkId || 1],
              contract.abi,
              snxJSConnector.provider
          )
        : undefined;

export default snxJSConnector;

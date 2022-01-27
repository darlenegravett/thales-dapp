import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import snxJSConnector from '../../utils/snxJSConnector';
import { NetworkId } from '../../utils/network';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { MigratedReward } from 'types/token';
import ongoingAirdropMigrationHashes from 'utils/json/OngoingAirdropMigration.json';

const BALANCE_THRESHOLD = 0.0001;

const useMigratedRewardsQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<MigratedReward>
) => {
    return useQuery<MigratedReward>(
        QUERY_KEYS.Token.MigratedRewards(walletAddress, networkId),
        async () => {
            const [paused, period, lastPeriodTimeStamp, durationPeriod, rewards] = await Promise.all([
                (snxJSConnector as any).ongoingAirdropContract.paused(),
                (snxJSConnector as any).ongoingAirdropContract.period(),
                (snxJSConnector as any).stakingThalesContract.lastPeriodTimeStamp(),
                (snxJSConnector as any).stakingThalesContract.durationPeriod(),
                (snxJSConnector as any).stakingThalesContract.getRewardsAvailable(walletAddress),
            ]);

            const ongoingAirdropHash = ongoingAirdropMigrationHashes.find(
                (airdrop: any) => airdrop.address.toLowerCase() === walletAddress.toLowerCase()
            );

            const migratedRewards: MigratedReward = {
                isClaimPaused: paused,
                hasClaimRights: ongoingAirdropHash !== undefined && ongoingAirdropHash.balance !== '0',
                claimed: true,
                period: period,
                closingDate: Number(lastPeriodTimeStamp) * 1000 + Number(durationPeriod) * 1000,
                hasStakingRewardsToClaim: bigNumberFormatter(rewards) > 0,
            };
            if (ongoingAirdropHash) {
                const balance = bigNumberFormatter(ongoingAirdropHash.balance);
                const previousBalance = bigNumberFormatter(ongoingAirdropHash.previousBalance || 0);
                const stakingBalance = bigNumberFormatter(ongoingAirdropHash.stakingBalance || 0);
                const snxBalance =
                    bigNumberFormatter(ongoingAirdropHash.balance) -
                    bigNumberFormatter(ongoingAirdropHash.stakingBalance || 0) -
                    bigNumberFormatter(ongoingAirdropHash.previousBalance || 0);
                migratedRewards.reward = {
                    rawBalance: ongoingAirdropHash.balance,
                    balance,
                    previousBalance,
                    stakingBalance,
                    snxBalance: snxBalance < BALANCE_THRESHOLD ? 0 : snxBalance,
                    index: ongoingAirdropHash.index,
                    proof: ongoingAirdropHash.proof,
                };
                migratedRewards.claimed = !(await (snxJSConnector as any).ongoingAirdropContract.canClaim(
                    ongoingAirdropHash.index
                ));
            }

            return migratedRewards;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useMigratedRewardsQuery;

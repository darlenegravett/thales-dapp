import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import snxJSConnector from '../../utils/snxJSConnector';
import { NetworkId } from '../../utils/network';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { Airdrop } from 'types/token';
import { getRetroAirdropHashesURL } from 'utils/token';

const useRetroAirdropQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<Airdrop>) => {
    return useQuery<Airdrop>(
        QUERY_KEYS.WalletBalances.RetroAirdrop(walletAddress, networkId),
        async () => {
            const retroAirdropHashesResponse = await fetch(getRetroAirdropHashesURL());
            const retroAirdropHashes = await retroAirdropHashesResponse.json();
            const retroAirdropHash = retroAirdropHashes.find(
                (airdrop: any) => airdrop.address.toLowerCase() === walletAddress.toLowerCase()
            );

            const airdrop: Airdrop = {
                isClaimPaused: false,
                hasClaimRights: retroAirdropHash !== undefined,
                claimed: true,
            };

            if (retroAirdropHash) {
                airdrop.accountInfo = {
                    rawBalance: retroAirdropHash.balance,
                    balance: bigNumberFormatter(retroAirdropHash.balance),
                    index: retroAirdropHash.index,
                    proof: retroAirdropHash.proof,
                };
                try {
                    await (snxJSConnector as any).retroAirdropContract.claimed(retroAirdropHash.index);
                    airdrop.claimed = false;
                } catch {}
            }
            return airdrop;
        },
        options
    );
};

export default useRetroAirdropQuery;

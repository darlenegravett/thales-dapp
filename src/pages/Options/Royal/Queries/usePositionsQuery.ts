import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'utils/network';
import QUERY_KEYS from 'constants/queryKeys';
import thalesData from 'thales-data';
import { ethers } from 'ethers';
import snxJSConnector from 'utils/snxJSConnector';

export type Positions = {
    up: number;
    down: number;
};

type GraphPosition = {
    game: string;
    id: string;
    player: string;
    position: number;
    round: number;
    timestamp: number;
};

const usePositionsQuery = (networkId: NetworkId, options?: UseQueryOptions<Positions>) => {
    return useQuery<Positions>(
        QUERY_KEYS.Royale.Positions(networkId),
        async () => {
            console.log('Positions Query');
            const positions = await thalesData.binaryOptions.thalesRoyalePositions({ network: networkId });
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const { thalesRoyaleContract } = snxJSConnector;
            const thalesRoyaleContractAddress = thalesRoyaleContract ? thalesRoyaleContract.address : '';
            const thalesRoyaleContractAbi = thalesRoyaleContract ? thalesRoyaleContract.abi : '';
            const RoyalContract = new ethers.Contract(thalesRoyaleContractAddress, thalesRoyaleContractAbi, provider);
            const round = await RoyalContract.round();
            console.log(round);
            return (
                positions.reduce(
                    (prev: Positions, curr: GraphPosition) => {
                        if (curr.round === Number(round)) {
                            if (curr.position === 2) {
                                prev.up++;
                            } else if (curr.position === 1) {
                                prev.down++;
                            }
                        }
                        return prev;
                    },
                    { up: 0, down: 0 }
                ) || { up: 0, down: 0 }
            );
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default usePositionsQuery;

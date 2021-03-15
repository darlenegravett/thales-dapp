import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { bigNumberFormatter, parseBytes32String } from 'utils/formatters';
import snxJSConnector from 'utils/snxJSConnector';

export type Rates = Record<CurrencyKey, number>;

const useExchangeRatesQuery = (options?: UseQueryOptions<Rates>) => {
    return useQuery<Rates>(
        QUERY_KEYS.Rates.ExchangeRates,
        async () => {
            const { synthSummaryUtilContract } = snxJSConnector;

            const exchangeRates: Rates = {};

            const [synths, rates] = await synthSummaryUtilContract.synthsRates();
            synths.forEach((synth: CurrencyKey, idx: number) => {
                const synthName = parseBytes32String(synth);
                exchangeRates[synthName] = bigNumberFormatter(rates[idx]);
            });

            return exchangeRates;
        },
        options
    );
};

export default useExchangeRatesQuery;

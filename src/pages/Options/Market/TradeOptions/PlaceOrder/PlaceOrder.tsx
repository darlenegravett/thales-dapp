import useBinaryOptionsAccountMarketInfoQuery from 'queries/options/useBinaryOptionsAccountMarketInfoQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Grid, Header, Segment } from 'semantic-ui-react';
import { AccountMarketInfo, OptionSide } from 'types/options';
import { useMarketContext } from '../../contexts/MarketContext';
import PlaceOrderSide from './PlaceOrderSide';

type PlaceOrderProps = {
    optionSide: OptionSide;
};

const PlaceOrder: React.FC<PlaceOrderProps> = ({ optionSide }) => {
    const { t } = useTranslation();
    const optionsMarket = useMarketContext();
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const baseToken = optionSide === 'long' ? optionsMarket.longAddress : optionsMarket.shortAddress;

    const accountMarketInfoQuery = useBinaryOptionsAccountMarketInfoQuery(optionsMarket.address, walletAddress, {
        enabled: isAppReady && isWalletConnected,
    });

    let optBalances = {
        long: 0,
        short: 0,
    };

    if (isWalletConnected && accountMarketInfoQuery.isSuccess && accountMarketInfoQuery.data) {
        const { balances } = accountMarketInfoQuery.data as AccountMarketInfo;
        optBalances = balances;
    }
    const tokenBalance = optionSide === 'long' ? optBalances.long : optBalances.short;

    return (
        <>
            <Segment color={optionSide === 'long' ? 'green' : 'red'}>
                <Header as="h2">{t(`options.market.trade-options.place-order.${optionSide}.title`)}</Header>
                <Grid centered>
                    <Grid.Column width={8}>
                        <PlaceOrderSide baseToken={baseToken} orderSide="buy" tokenBalance={tokenBalance} />
                    </Grid.Column>
                    <Grid.Column width={8}>
                        <PlaceOrderSide baseToken={baseToken} orderSide="sell" tokenBalance={tokenBalance} />
                    </Grid.Column>
                </Grid>
            </Segment>
        </>
    );
};

export default PlaceOrder;

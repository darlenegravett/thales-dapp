import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MarketWidgetHeader from '../components/MarketWidget/MarketWidgetHeader';
import { COLORS, MarketWidgetKey } from '../../../../constants/ui';
import { FlexDivCentered, FlexDivRow, FlexDivRowCentered } from '../../../../theme/common';
import { ReactComponent as WalletIcon } from '../../../../assets/images/wallet-dark.svg';
import {
    Container,
    CurrencyLabel,
    FilterButton,
    InputLabel,
    ReactSelect,
    ShortInputContainer,
    SliderContainer,
    SliderRange,
    SubmitButton,
    SubmitButtonContainer,
    Wallet,
    WalletContainer,
} from '../components';
import { formatCurrencyWithKey } from '../../../../utils/formatters/number';
import { OPTIONS_CURRENCY_MAP, SYNTHS_MAP, USD_SIGN } from '../../../../constants/currency';
import { EMPTY_VALUE } from '../../../../constants/placeholder';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from '../../../../redux/modules/wallet';
import useSynthsBalancesQuery from '../../../../queries/walletBalances/useSynthsBalancesQuery';
import { getCurrencyKeyBalance } from '../../../../utils/balances';
import { getIsAppReady } from '../../../../redux/modules/app';
import { AccountMarketInfo, OptionSide, OrderSide } from '../../../../types/options';
import useBinaryOptionsAccountMarketInfoQuery from '../../../../queries/options/useBinaryOptionsAccountMarketInfoQuery';
import { useMarketContext } from '../contexts/MarketContext';
import { useTranslation } from 'react-i18next';
import { OrderSideOptionType } from '../TradeOptions/PlaceOrder/PlaceOrder';
import NumericInput from '../components/NumericInput';
import { BuySlider, SellSlider } from '../../CreateMarket/components';
import ValidationMessage from 'components/ValidationMessage';
import onboardConnector from 'utils/onboardConnector';
import erc20Contract from 'utils/contracts/erc20Contract';
import { ethers } from 'ethers';
import snxJSConnector from 'utils/snxJSConnector';
import { APPROVAL_EVENTS } from 'constants/events';
import { bigNumberFormatter, getAddress } from 'utils/formatters/ethers';
import { formatGasLimit } from 'utils/network';

const AMM: React.FC = () => {
    const { t } = useTranslation();
    const optionsMarket = useMarketContext();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const orderSideOptions = [
        {
            value: 'buy' as OrderSide,
            label: t('common.buy'),
        },
        {
            value: 'sell' as OrderSide,
            label: t('common.sell'),
        },
    ];
    const [orderSide, setOrderSide] = useState<OrderSideOptionType>(orderSideOptions[0]);
    const [optionSide, setOptionSide] = useState<OptionSide>('long');
    const [amount, setAmount] = useState<number | string>('');
    const [price /*, setPrice*/] = useState<number | string>('');
    const [total /*, setTotal*/] = useState<number | string>('');
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isSubmitting /*, setIsSubmitting*/] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
    const [insufficientLiquidity /*, setInsufficientLiquidity*/] = useState<boolean>(false);
    const [isAmountValid /*, setIsAmountValid*/] = useState<boolean>(true);

    const accountMarketInfoQuery = useBinaryOptionsAccountMarketInfoQuery(optionsMarket.address, walletAddress, {
        enabled: isAppReady && isWalletConnected,
    });
    let optBalances = {
        long: 0,
        short: 0,
    };
    if (isWalletConnected && accountMarketInfoQuery.isSuccess && accountMarketInfoQuery.data) {
        optBalances = accountMarketInfoQuery.data as AccountMarketInfo;
    }
    const tokenBalance = optionSide === 'long' ? optBalances.long : optBalances.short;

    const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const walletBalancesMap =
        synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
            ? { synths: synthsWalletBalancesQuery.data }
            : null;
    const sUSDBalance = getCurrencyKeyBalance(walletBalancesMap, SYNTHS_MAP.sUSD) || 0;

    const {
        contracts: { SynthsUSD },
    } = snxJSConnector.snxJS as any;
    const isBuy = orderSide.value === 'buy';
    const isLong = optionSide === 'long';
    const isAmountEntered = Number(amount) > 0;
    const isPriceEntered = Number(price) > 0;

    const insufficientBalance = isBuy
        ? sUSDBalance < Number(total) || !sUSDBalance
        : tokenBalance < Number(amount) || !tokenBalance;

    const isButtonDisabled =
        !isPriceEntered || !isAmountEntered || isSubmitting || !isWalletConnected || insufficientBalance;

    const sellToken = isBuy ? SynthsUSD.address : isLong ? optionsMarket.longAddress : optionsMarket.shortAddress;
    const sellTokenCurrencyKey = isBuy ? SYNTHS_MAP.sUSD : OPTIONS_CURRENCY_MAP[optionSide];

    useEffect(() => {
        const erc20Instance = new ethers.Contract(sellToken, erc20Contract.abi, snxJSConnector.signer);
        const { ammContract } = snxJSConnector;
        const addressToApprove = ammContract ? ammContract.address : '';

        const getAllowance = async () => {
            try {
                const allowance = await erc20Instance.allowance(walletAddress, addressToApprove);
                setAllowance(!!bigNumberFormatter(allowance));
            } catch (e) {
                console.log(e);
            }
        };

        const registerAllowanceListener = () => {
            erc20Instance.on(APPROVAL_EVENTS.APPROVAL, (owner: string, spender: string) => {
                if (owner === walletAddress && spender === getAddress(addressToApprove)) {
                    setAllowance(true);
                    setIsAllowing(false);
                }
            });
        };
        if (isWalletConnected) {
            getAllowance();
            registerAllowanceListener();
        }
        return () => {
            erc20Instance.removeAllListeners(APPROVAL_EVENTS.APPROVAL);
        };
    }, [walletAddress, isWalletConnected, isBuy, optionSide, hasAllowance]);

    const handleAllowance = async () => {
        const erc20Instance = new ethers.Contract(sellToken, erc20Contract.abi, snxJSConnector.signer);
        const { ammContract } = snxJSConnector;
        const addressToApprove = ammContract ? ammContract.address : '';

        try {
            setIsAllowing(true);
            const gasEstimate = await erc20Instance.estimateGas.approve(addressToApprove, ethers.constants.MaxUint256);
            const tx = (await erc20Instance.approve(addressToApprove, ethers.constants.MaxUint256, {
                gasLimit: formatGasLimit(gasEstimate, networkId),
            })) as ethers.ContractTransaction;
            const txResult = await tx.wait();
            if (txResult && txResult.transactionHash) {
                setAllowance(true);
                setIsAllowing(false);
            }
        } catch (e) {
            console.log(e);
            setIsAllowing(false);
        }
    };

    const handleSubmitOrder = async () => {};

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton isBuy={isBuy} onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        if (insufficientBalance) {
            return (
                <SubmitButton disabled={true} isBuy={isBuy}>
                    {t(`common.errors.insufficient-balance`)}
                </SubmitButton>
            );
        }
        if (!isAmountEntered) {
            return (
                <SubmitButton disabled={true} isBuy={isBuy}>
                    {t(`common.errors.enter-amount`)}
                </SubmitButton>
            );
        }
        if (insufficientLiquidity) {
            return (
                <SubmitButton disabled={true} isBuy={isBuy}>
                    {t(`common.errors.insufficient-liquidity`)}
                </SubmitButton>
            );
        }
        if (!hasAllowance) {
            return (
                <SubmitButton disabled={isAllowing} onClick={handleAllowance} isBuy={isBuy}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: sellTokenCurrencyKey })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: sellTokenCurrencyKey,
                          })}
                </SubmitButton>
            );
        }
        return (
            <SubmitButton disabled={isButtonDisabled} onClick={handleSubmitOrder} isBuy={isBuy}>
                {!isSubmitting
                    ? t(`options.market.trade-options.place-order.swap-confirm-button.${orderSide.value}.label`)
                    : t(
                          `options.market.trade-options.place-order.swap-confirm-button.${orderSide.value}.progress-label`
                      )}
            </SubmitButton>
        );
    };

    return (
        <AMMWrapper>
            <Widget>
                <MarketWidgetHeader widgetKey={MarketWidgetKey.AMM}>
                    <FlexDivCentered>
                        <WalletIcon />
                        <WalletContainer>
                            {isWalletConnected ? (
                                <>
                                    <Wallet>{formatCurrencyWithKey(SYNTHS_MAP.sUSD, sUSDBalance)}</Wallet>
                                    <Wallet>
                                        {formatCurrencyWithKey(OPTIONS_CURRENCY_MAP[optionSide], tokenBalance)}
                                    </Wallet>
                                </>
                            ) : (
                                EMPTY_VALUE
                            )}
                        </WalletContainer>
                    </FlexDivCentered>
                </MarketWidgetHeader>
                <Container>
                    <FlexDivRow>
                        <ShortInputContainer>
                            <ReactSelect
                                formatOptionLabel={(option: any) => option.label}
                                options={orderSideOptions}
                                value={orderSide}
                                onChange={(option: any) => setOrderSide(option)}
                                isSearchable={false}
                                isUppercase
                                // isDisabled={isSubmitting}
                                // className={isSubmitting ? 'disabled' : ''}
                            />
                            <InputLabel>{t('options.market.trade-options.place-order.order-type-label')}</InputLabel>
                        </ShortInputContainer>
                        <ShortInputContainer>
                            <UnusableInput value={50} onChange={() => {}} disabled={true} />
                            <UnusableInputLabel>Higher Than</UnusableInputLabel>
                            <UnusableCurrencyLabel>{'USD'}</UnusableCurrencyLabel>
                        </ShortInputContainer>
                    </FlexDivRow>
                    <FlexDivRowCentered>
                        <ShortInputContainer>
                            <OptionsContainer>
                                <OptionButton
                                    onClick={() => setOptionSide('long')}
                                    className={optionSide === 'long' ? 'selected' : ''}
                                >
                                    LONG
                                </OptionButton>
                                <OptionButton
                                    onClick={() => setOptionSide('short')}
                                    className={optionSide === 'short' ? 'selected' : ''}
                                >
                                    SHORT
                                </OptionButton>
                            </OptionsContainer>
                        </ShortInputContainer>
                        <ShortInputContainer>
                            <UnusableInput value={50} onChange={() => {}} disabled={true} />
                            <UnusableInputLabel>Strike Date</UnusableInputLabel>
                        </ShortInputContainer>
                    </FlexDivRowCentered>
                    <FlexDivRow>
                        <ShortInputContainer>
                            <NumericInput
                                value={amount}
                                onChange={(_, value) => setAmount(value)}
                                className={isAmountValid && !insufficientLiquidity ? '' : 'error'}
                                disabled={isSubmitting}
                            />
                            <InputLabel>
                                {t('options.market.trade-options.place-order.amount-label', {
                                    orderSide: orderSide.value,
                                })}
                            </InputLabel>
                            <CurrencyLabel className={isSubmitting ? 'disabled' : ''}>
                                {OPTIONS_CURRENCY_MAP[optionSide]}
                            </CurrencyLabel>
                        </ShortInputContainer>
                        <ShortInputContainer>
                            <FlexDivRow style={{ width: 'calc(100% - 10px)' }}>
                                <ShortInputContainer>
                                    <UnusableInput value={50} onChange={() => {}} disabled={true} />
                                    <UnusableInputLabel>Slippage</UnusableInputLabel>
                                </ShortInputContainer>
                                <ShortInputContainer>
                                    <UnusableInput value={50} onChange={() => {}} disabled={true} />
                                    <UnusableInputLabel>Price per option</UnusableInputLabel>
                                </ShortInputContainer>
                            </FlexDivRow>
                        </ShortInputContainer>
                    </FlexDivRow>
                    <FlexDivRow>
                        <BuySellSliderContainer>
                            {isBuy ? (
                                <BuySlider
                                    value={Number(0)}
                                    step={0.01}
                                    max={1}
                                    min={0}
                                    // onChange={(_, value) => {
                                    //     setIsPriceValid(Number(value) <= 1);
                                    //     setPrice(Number(value));
                                    // }}
                                    // disabled={isSubmitting}
                                />
                            ) : (
                                <SellSlider
                                    value={Number(0)}
                                    step={0.01}
                                    max={1}
                                    min={0}
                                    // onChange={(_, value) => {
                                    //     setIsPriceValid(Number(value) <= 1);
                                    //     setPrice(Number(value));
                                    // }}
                                    // disabled={isSubmitting}
                                />
                            )}
                            <FlexDivRow>
                                <SliderRange color={isBuy ? COLORS.BUY : COLORS.SELL}>{`${USD_SIGN}0`}</SliderRange>
                                <SliderRange color={isBuy ? COLORS.BUY : COLORS.SELL}>{`${USD_SIGN}1`}</SliderRange>
                            </FlexDivRow>
                        </BuySellSliderContainer>
                    </FlexDivRow>
                </Container>
                <SubmitButtonContainer>{getSubmitButton()}</SubmitButtonContainer>
                <ValidationMessage
                    showValidation={txErrorMessage !== null}
                    message={txErrorMessage}
                    onDismiss={() => setTxErrorMessage(null)}
                />
            </Widget>
            <Info>
                <Container>
                    <h1>WHAT IS AMM TRADING</h1>
                    <p>
                        You could think of an automated market maker as a robot that’s always willing to quote you a
                        price between two assets. Some use a simple formula like Uniswap, while Curve, Balancer and
                        others use more complicated ones.
                    </p>
                    <p>
                        Not only can you trade trustlessly using an AMM, but you can also become the house by providing
                        liquidity to a liquidity pool. This allows essentially anyone to become a market maker on an
                        exchange and earn fees for providing liquidity.
                    </p>
                    <p>
                        AMMs have really carved out their niche in the DeFi space due to how simple and easy they are to
                        use. Decentralizing market making this way is intrinsic to the vision of crypt
                    </p>
                </Container>
            </Info>
        </AMMWrapper>
    );
};

const AMMWrapper = styled.div`
    display: flex;
    height: 100%;
    margin-top: 20px !important;
`;

const Widget = styled.div`
    flex: 1;
    overflow: auto;
    border-radius: 23px;
    background: linear-gradient(90deg, #3936c7 -8.53%, #2d83d2 52.71%, #23a5dd 105.69%, #35dadb 127.72%);
`;

const OptionsContainer = styled(FlexDivRowCentered)``;

const OptionButton = styled(FilterButton)`
    width: 120px;
`;

const Info = styled.div`
    flex: 1;
    overflow: auto;
    padding: 10px;
    color: #fefefe;
    & p {
        padding-top: 20px;
        font-size: 16px;
        line-height: 24px;
    }
`;

const UnusableInput = styled(NumericInput)`
    background: #b8c6e5;
    color: #0c1c68;
    border: none;
    &:disabled {
        opacity: 1;
        cursor: default;
    }
`;

const UnusableInputLabel = styled(InputLabel)`
    color: #0c1c68;
`;

const UnusableCurrencyLabel = styled(CurrencyLabel)`
    color: #0c1c68;
`;

const BuySellSliderContainer = styled(SliderContainer)`
    margin-right: 10px;
    margin-top: 0;
    padding: 0 10px;
`;

export default AMM;

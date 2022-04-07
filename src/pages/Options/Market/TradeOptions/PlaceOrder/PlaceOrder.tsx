import { OPTIONS_CURRENCY_MAP, SYNTHS_MAP, USD_SIGN } from 'constants/currency';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { AccountMarketInfo, OptionSide, OrderSide } from 'types/options';
import { getCurrencyKeyBalance } from 'utils/balances';
import { formatCurrencyWithKey, truncToDecimals } from 'utils/formatters/number';
import snxJSConnector from 'utils/snxJSConnector';
import erc20Contract from 'utils/contracts/erc20Contract';
import { BigNumber, ethers } from 'ethers';
import { checkAllowance, formatGasLimit } from 'utils/network';
import {
    AMOUNT_PERCENTAGE,
    ORDER_PERIOD_IN_SECONDS,
    ORDER_PERIOD_ITEMS_MAP,
    OrderPeriod,
    OrderPeriodItem,
} from 'constants/options';
import { useMarketContext } from 'pages/Options/Market/contexts/MarketContext';
import { DEFAULT_OPTIONS_DECIMALS } from 'constants/defaults';
import useBinaryOptionsAccountMarketInfoQuery from 'queries/options/useBinaryOptionsAccountMarketInfoQuery';
import {
    AmountButton,
    AmountButtonContainer,
    BuySellSliderContainer,
    Container,
    CurrencyLabel,
    InputLabel,
    ReactSelect,
    ShortInputContainer,
    SliderRange,
    SubmitButton,
    SubmitButtonContainer,
    SummaryContainer,
    SummaryContent,
    SummaryItem,
    SummaryLabel,
} from 'pages/Options/Market/components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'theme/common';
import NumericInput from '../../components/NumericInput';
import onboardConnector from 'utils/onboardConnector';
import { BuySlider, SellSlider } from 'pages/Options/CreateMarket/components';
import { COLORS } from 'constants/ui';
import FieldValidationMessage from 'components/FieldValidationMessage';
import ValidationMessage from 'components/ValidationMessage';
import ExpirationDropdown from '../components/ExpirationDropdown';
import styled from 'styled-components';
import { createOneInchLimitOrder, ONE_INCH_CONTRACTS } from 'utils/1inch';
import { dispatchMarketNotification } from 'utils/options';
import { refetchOrderbook, refetchOrders } from 'utils/queryConnector';
import ApprovalModal from 'components/ApprovalModal';

type PlaceOrderProps = {
    optionSide: OptionSide;
    market?: any;
    defaultOrderSide?: OrderSide;
    defaultPrice?: number | string;
    defaultAmount?: number | string;
    onPlaceOrder?: any;
};

export type OrderSideOptionType = { value: OrderSide; label: string };

const PlaceOrder: React.FC<PlaceOrderProps> = ({
    optionSide,
    market,
    defaultOrderSide,
    defaultPrice,
    defaultAmount,
    onPlaceOrder,
}) => {
    const { t } = useTranslation();
    const optionsMarket = market || useMarketContext();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [price, setPrice] = useState<number | string>(defaultPrice || '');
    const [amount, setAmount] = useState<number | string>(defaultAmount || '');
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
    const [isPriceValid, setIsPriceValid] = useState(true);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isExpirationAfterMaturity, setIsExpirationAfterMaturity] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
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
    const defaultOrderSideOption = orderSideOptions.find((option) => option.value === defaultOrderSide);
    const [orderSide, setOrderSide] = useState<OrderSideOptionType>(defaultOrderSideOption || orderSideOptions[0]);

    const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const walletBalancesMap =
        synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
            ? { synths: synthsWalletBalancesQuery.data }
            : null;
    const sUSDBalance = getCurrencyKeyBalance(walletBalancesMap, SYNTHS_MAP.sUSD) || 0;

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
    const baseToken = optionSide === 'long' ? optionsMarket.longAddress : optionsMarket.shortAddress;
    const isBuy = orderSide.value === 'buy';

    const {
        contracts: { SynthsUSD },
    } = snxJSConnector.snxJS as any;

    const makerToken = isBuy ? SynthsUSD.address : baseToken;
    const makerAmount = isBuy ? Number(price) * Number(amount) : amount;
    const makerTokenCurrencyKey = isBuy ? SYNTHS_MAP.sUSD : OPTIONS_CURRENCY_MAP[optionSide];
    const takerToken = isBuy ? baseToken : SynthsUSD.address;
    const addressToApprove = ONE_INCH_CONTRACTS[networkId] || '';

    const expirationOptions = ORDER_PERIOD_ITEMS_MAP.map((period: OrderPeriodItem) => {
        return {
            value: period.value,
            label: t(period.i18nLabel),
        };
    });

    const [expiration, setExpiration] = useState<OrderPeriod | undefined>(OrderPeriod.ONE_DAY);
    const [customHoursExpiration, setCustomHoursExpiration] = useState<number | string>('');

    const isPriceEntered = Number(price) > 0;
    const isAmountEntered = Number(amount) > 0;
    const isExpirationEntered = expiration !== undefined;
    const insufficientBalance = isBuy
        ? sUSDBalance < Number(price) * Number(amount) || !sUSDBalance
        : tokenBalance < Number(amount) || !tokenBalance;

    const isButtonDisabled =
        !isPriceEntered ||
        !isAmountEntered ||
        !isExpirationEntered ||
        isSubmitting ||
        !isWalletConnected ||
        insufficientBalance ||
        !isPriceValid ||
        !hasAllowance;

    const getOrderEndDate = () => {
        let orderEndDate = 0;
        if (expiration) {
            orderEndDate =
                expiration === OrderPeriod.TRADING_END
                    ? Math.round(optionsMarket.timeRemaining / 1000)
                    : expiration === OrderPeriod.CUSTOM
                    ? Math.round(new Date().getTime() / 1000) +
                      Math.round(Number(customHoursExpiration) * ORDER_PERIOD_IN_SECONDS[OrderPeriod.ONE_HOUR])
                    : Math.round(new Date().getTime() / 1000) + ORDER_PERIOD_IN_SECONDS[expiration as OrderPeriod];
        }
        return orderEndDate;
    };

    const checkIfPeriodEndsAfterMarketMaturity = useCallback(
        (periodDurationInSeconds: number, suppressNotification?: boolean) => {
            const now = new Date().getTime() / 1000;
            if (now + periodDurationInSeconds >= optionsMarket.maturityDate / 1000) {
                if (!suppressNotification) {
                    // dispatchMarketNotification('Order expiration cannot be after market maturity', 'error');
                    setIsExpirationAfterMaturity(true);
                    setTimeout(() => {
                        setIsExpirationAfterMaturity(false);
                    }, 5000);
                }
                return true;
            }
            return false;
        },
        [optionsMarket]
    );

    const setExpirationCallback = useCallback(
        (period: OrderPeriod | undefined, suppressNotification?: boolean) => {
            if (period && checkIfPeriodEndsAfterMarketMaturity(ORDER_PERIOD_IN_SECONDS[period], suppressNotification)) {
                setExpiration(OrderPeriod.TRADING_END);
            } else {
                setExpiration(period);
            }
        },
        [setExpiration, optionsMarket]
    );

    const setCustomHoursExpirationCallback = useCallback(
        (hours: number | string) => {
            if (checkIfPeriodEndsAfterMarketMaturity(Number(hours) * ORDER_PERIOD_IN_SECONDS[OrderPeriod.ONE_HOUR])) {
                setCustomHoursExpiration('');
                setExpiration(OrderPeriod.TRADING_END);
            } else {
                setCustomHoursExpiration(hours);
            }
        },
        [setCustomHoursExpiration, setExpiration]
    );

    useEffect(() => {
        const erc20Instance = new ethers.Contract(makerToken, erc20Contract.abi, snxJSConnector.signer);
        const getAllowance = async () => {
            try {
                const parsedMakerAmount = ethers.utils.parseEther(Number(makerAmount).toString());
                const allowance = await checkAllowance(
                    parsedMakerAmount,
                    erc20Instance,
                    walletAddress,
                    addressToApprove
                );
                setAllowance(allowance);
            } catch (e) {
                console.log(e);
            }
        };
        if (isWalletConnected) {
            getAllowance();
        }
    }, [walletAddress, isWalletConnected, isBuy, optionSide, hasAllowance, makerAmount, isAllowing]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const erc20Instance = new ethers.Contract(makerToken, erc20Contract.abi, snxJSConnector.signer);
        try {
            setIsAllowing(true);
            const gasEstimate = await erc20Instance.estimateGas.approve(addressToApprove, approveAmount);
            const tx = (await erc20Instance.approve(addressToApprove, approveAmount, {
                gasLimit: formatGasLimit(gasEstimate, networkId),
            })) as ethers.ContractTransaction;
            setOpenApprovalModal(false);
            const txResult = await tx.wait();
            if (txResult && txResult.transactionHash) {
                setIsAllowing(false);
            }
        } catch (e) {
            console.log(e);
            setIsAllowing(false);
            setOpenApprovalModal(false);
        }
    };

    const handleSubmitOrder = async () => {
        setTxErrorMessage(null);
        setIsSubmitting(true);

        const newMakerAmount = isBuy ? Number(amount) * Number(price) : amount;
        const newTakerAmount = isBuy ? amount : Number(amount) * Number(price);
        const expiry = getOrderEndDate();

        try {
            await createOneInchLimitOrder(
                walletAddress,
                networkId,
                makerToken,
                takerToken,
                newMakerAmount,
                newTakerAmount,
                expiry
            );
            dispatchMarketNotification(
                t('options.market.trade-options.place-order.confirm-button.confirmation-message')
            );
            refetchOrderbook(baseToken);
            refetchOrders(networkId);
            resetForm();
            onPlaceOrder && onPlaceOrder();
        } catch (e) {
            console.log(e);
            setTxErrorMessage(t('common.errors.unknown-error-try-again'));
        }
        setIsSubmitting(false);
    };

    const calculateAmount = (percentage: number) => {
        if (isBuy && price === '') return;
        const maxsOPTBalance = isBuy ? sUSDBalance / Number(price) : tokenBalance;
        const newAmount = (maxsOPTBalance * percentage) / 100;
        setAmount(truncToDecimals(newAmount, DEFAULT_OPTIONS_DECIMALS));
    };

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
        if (!isPriceEntered) {
            return (
                <SubmitButton disabled={true} isBuy={isBuy}>
                    {t(`common.errors.enter-price`)}
                </SubmitButton>
            );
        }
        if (isPriceEntered && !isPriceValid) {
            return (
                <SubmitButton disabled={true} isBuy={isBuy}>
                    {t(`common.errors.invalid-price`)}
                </SubmitButton>
            );
        }
        if (!isExpirationEntered) {
            return (
                <SubmitButton disabled={true} isBuy={isBuy}>
                    {t(`common.errors.enter-expiration`)}
                </SubmitButton>
            );
        }
        if (!hasAllowance) {
            return (
                <SubmitButton disabled={isAllowing} onClick={() => setOpenApprovalModal(true)} isBuy={isBuy}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: makerTokenCurrencyKey })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: makerTokenCurrencyKey,
                          })}
                </SubmitButton>
            );
        }
        return (
            <SubmitButton disabled={isButtonDisabled} onClick={handleSubmitOrder} isBuy={isBuy}>
                {!isSubmitting
                    ? t(`options.market.trade-options.place-order.confirm-button.label`)
                    : t(`options.market.trade-options.place-order.confirm-button.progress-label`)}
            </SubmitButton>
        );
    };

    const resetForm = () => {
        setAmount(defaultAmount || '');
        setPrice(defaultPrice || '');
        setExpirationCallback(OrderPeriod.ONE_DAY, true);
        setCustomHoursExpiration('');
        const defaultOrderSideOption = orderSideOptions.find((option) => option.value === defaultOrderSide);
        setOrderSide(defaultOrderSideOption || orderSideOptions[0]);
        setIsPriceValid(true);
        setIsAmountValid(true);
    };

    useEffect(() => {
        resetForm();
    }, [optionSide]);

    useEffect(() => {
        const total = Number(price) * Number(amount);
        setIsAmountValid(
            Number(amount) === 0 ||
                (Number(amount) > 0 &&
                    (isBuy
                        ? (Number(total) > 0 && Number(total) <= sUSDBalance) ||
                          (Number(total) === 0 && sUSDBalance > 0)
                        : Number(amount) <= tokenBalance))
        );
    }, [amount, price, isBuy, sUSDBalance, tokenBalance]);

    return (
        <Container className="limitTab">
            {!defaultOrderSide && (
                <FlexDivRow>
                    <ShortInputContainer className="limitTab__select">
                        <ReactSelect
                            formatOptionLabel={(option: any) => option.label}
                            options={orderSideOptions}
                            value={orderSide}
                            onChange={(option: any) => setOrderSide(option)}
                            isSearchable={false}
                            isUppercase
                            isDisabled={isSubmitting}
                            className={isSubmitting ? 'disabled' : ''}
                        />
                        <InputLabel>{t('options.market.trade-options.place-order.order-type-label')}</InputLabel>
                    </ShortInputContainer>
                    <ShortInputContainer></ShortInputContainer>
                </FlexDivRow>
            )}
            <FlexDiv className="limitTab__slider">
                <BuySellSliderContainer>
                    {isBuy ? (
                        <BuySlider
                            value={Number(price)}
                            step={0.01}
                            max={1}
                            min={0}
                            onChange={(_, value) => {
                                setIsPriceValid(Number(value) <= 1);
                                setPrice(Number(value));
                            }}
                            disabled={isSubmitting}
                        />
                    ) : (
                        <SellSlider
                            value={Number(price)}
                            step={0.01}
                            max={1}
                            min={0}
                            onChange={(_, value) => {
                                setIsPriceValid(Number(value) <= 1);
                                setPrice(Number(value));
                            }}
                            disabled={isSubmitting}
                        />
                    )}
                    <FlexDivRow>
                        <SliderRange color={isBuy ? COLORS.BUY : COLORS.SELL}>{`${USD_SIGN}0`}</SliderRange>
                        <SliderRange color={isBuy ? COLORS.BUY : COLORS.SELL}>{`${USD_SIGN}1`}</SliderRange>
                    </FlexDivRow>
                </BuySellSliderContainer>
                <ShortInputContainer>
                    <NumericInput
                        value={price}
                        onChange={(_, value) => {
                            setIsPriceValid(Number(value) <= 1);
                            setPrice(value);
                        }}
                        step="0.01"
                        className={isPriceValid ? '' : 'error'}
                        disabled={isSubmitting}
                    />
                    <InputLabel>
                        {t('options.market.trade-options.place-order.price-label', {
                            currencyKey: OPTIONS_CURRENCY_MAP[optionSide],
                        })}
                    </InputLabel>
                    <CurrencyLabel className={isSubmitting ? 'disabled' : ''}>{SYNTHS_MAP.sUSD}</CurrencyLabel>
                    <FieldValidationMessage
                        showValidation={!isPriceValid}
                        message={t(`common.errors.invalid-price-max`, { max: 1 })}
                    />
                </ShortInputContainer>
            </FlexDiv>
            <FlexDiv className="limitTab__slider">
                <ShortInputContainer>
                    <NumericInput
                        value={amount}
                        onChange={(_, value) => setAmount(value)}
                        className={isAmountValid ? '' : 'error'}
                        disabled={isSubmitting}
                    />
                    <InputLabel>
                        {t('options.market.trade-options.place-order.amount-label', { orderSide: orderSide.value })}
                    </InputLabel>
                    <CurrencyLabel className={isSubmitting ? 'disabled' : ''}>
                        {OPTIONS_CURRENCY_MAP[optionSide]}
                    </CurrencyLabel>
                    <FieldValidationMessage
                        showValidation={!isAmountValid}
                        message={t(`common.errors.insufficient-balance-wallet`, {
                            currencyKey: isBuy ? SYNTHS_MAP.sUSD : OPTIONS_CURRENCY_MAP[optionSide],
                        })}
                    />
                </ShortInputContainer>
                <ShortInputContainer>
                    <ExpirationDropdown
                        expirationOptions={expirationOptions}
                        onChange={(option: any) => setExpirationCallback(option)}
                        value={expiration}
                        customValue={customHoursExpiration}
                        onCustomChange={(value: string | number) => setCustomHoursExpirationCallback(value)}
                        disabled={isSubmitting}
                    />
                    <InputLabel>{t('options.market.trade-options.place-order.expiration-label')}</InputLabel>
                    <FieldValidationMessage
                        showValidation={!isExpirationEntered}
                        message={t(`common.errors.insufficient-balance-wallet`)}
                    />
                    <FieldValidationMessage
                        showValidation={isExpirationAfterMaturity}
                        message={t('options.market.trade-options.place-order.errors.order-after-maturity')}
                    />
                </ShortInputContainer>
            </FlexDiv>
            <AmountButtonContainer>
                {AMOUNT_PERCENTAGE.map((percentage: number) => (
                    <AmountButton
                        key={percentage}
                        onClick={() => calculateAmount(percentage)}
                        disabled={!isWalletConnected || (isBuy && price === '') || isSubmitting}
                    >
                        {`${percentage}%`}
                    </AmountButton>
                ))}
            </AmountButtonContainer>
            <SummaryContainer className="marketTab__summary">
                <SummaryItem>
                    <SummaryLabel style={{ minWidth: 80 }}>
                        {t('options.market.trade-options.place-order.total-label-susd')}
                    </SummaryLabel>
                    <SummaryContent>
                        {formatCurrencyWithKey(SYNTHS_MAP.sUSD, Number(price) * Number(amount))}
                    </SummaryContent>
                </SummaryItem>
            </SummaryContainer>
            <SubmitButtonContainer>
                <FlexDivCentered>{getSubmitButton()}</FlexDivCentered>
            </SubmitButtonContainer>
            <ValidationMessage
                showValidation={txErrorMessage !== null}
                message={txErrorMessage}
                onDismiss={() => setTxErrorMessage(null)}
            />
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={makerAmount}
                    tokenSymbol={makerTokenCurrencyKey}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Container>
    );
};

export const UseLegacySigningContainer = styled.div`
    margin-top: 12px;
    margin-left: 10px;
`;

export default PlaceOrder;

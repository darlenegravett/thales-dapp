/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useInterval from 'hooks/useInterval';

import Input from './components/Input';
import Button from 'components/Button';
import RangeSlider from 'components/RangeSlider';
import Switch from 'components/SwitchInput/SwitchInputNew';
import Slippage from './components/Slippage';
import Divider from './styled-components/Divider';
import NetworkFees from './components/NetworkFees';
import ApprovalModal from 'components/ApprovalModal';
import AlertMessage from '../AlertMessage';

import { useMarketContext } from 'pages/AMMTrading/contexts/MarketContext';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { getIsAppReady } from 'redux/modules/app';
import snxJSConnector from 'utils/snxJSConnector';
import { dispatchMarketNotification } from 'utils/options';

import useBinaryOptionsAccountMarketInfoQuery from 'queries/options/useBinaryOptionsAccountMarketInfoQuery';
import useAmmMaxLimitsQuery, { AmmMaxLimits } from 'queries/options/useAmmMaxLimitsQuery';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import { getCurrencyKeyBalance } from 'utils/balances';
import erc20Contract from 'utils/contracts/erc20Contract';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { refetchAmmData, refetchTrades, refetchUserTrades } from 'utils/queryConnector';
import { formatCurrencyWithKey, formatPercentage } from '../../../../utils/formatters/number';
import onboardConnector from 'utils/onboardConnector';

import { AccountMarketInfo, OrderSide, OptionSide } from 'types/options';
import { OPTIONS_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { MAX_L2_GAS_LIMIT, MINIMUM_AMM_LIQUIDITY, MIN_SCEW_IMPACT, SIDE, SLIPPAGE_PERCENTAGE } from 'constants/options';
import { checkAllowance, formatGasLimit, getIsOVM, getL1FeeInWei } from 'utils/network';

import { useTranslation } from 'react-i18next';

export type OrderSideOptionType = { value: OrderSide; label: string };

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
    const [price, setPrice] = useState<number | string>('');
    const [basePrice, setBasePrice] = useState<number | string>('');
    const [total, setTotal] = useState<number | string>('');
    const [priceImpact, setPriceImpact] = useState<number | string>('');
    const [basePriceImpact, setBasePriceImpact] = useState<number | string>('');
    const [potentialReturn, setPotentialReturn] = useState<number | string>('');
    const [potentialBaseReturn, setPotentialBaseReturn] = useState<number | string>('');
    const [isPotentialReturnAvailable, setIsPotentialReturnAvailable] = useState<boolean>(true);
    const [slippage, setSlippage] = useState<number | string>(SLIPPAGE_PERCENTAGE[1]);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isGettingQuote, setIsGettingQuote] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [gasLimit, setGasLimit] = useState<number | null>(null);
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
    const [isPriceChanged, setIsPriceChanged] = useState<boolean>(false);
    const [maxLimitExceeded, setMaxLimitExceeded] = useState<boolean>(false);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isSlippageValid, setIsSlippageValid] = useState<boolean>(true);
    const [insufficientLiquidity, setInsufficientLiquidity] = useState<boolean>(false);
    const [maxLimit, setMaxLimit] = useState<number>(0);
    const [l1Fee, setL1Fee] = useState<number | null>(null);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const isL2 = getIsOVM(networkId);

    const accountMarketInfoQuery = useBinaryOptionsAccountMarketInfoQuery(optionsMarket?.address, walletAddress, {
        enabled: isAppReady && isWalletConnected && !!optionsMarket?.address,
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

    const ammMaxLimitsQuery = useAmmMaxLimitsQuery(optionsMarket?.address, {
        enabled: isAppReady && !!optionsMarket?.address,
    });
    const ammMaxLimits =
        ammMaxLimitsQuery.isSuccess && ammMaxLimitsQuery.data ? (ammMaxLimitsQuery.data as AmmMaxLimits) : undefined;

    const {
        contracts: { SynthsUSD },
    } = snxJSConnector.snxJS as any;
    const isBuy = orderSide.value === 'buy';
    const isLong = optionSide === 'long';
    const isAmountEntered = Number(amount) > 0;
    const isPriceEntered = Number(price) > 0;
    const isTotalEntered = Number(total) > 0;
    const isAmmTradingDisabled = ammMaxLimits && !ammMaxLimits.isMarketInAmmTrading;

    const insufficientBalance = isBuy
        ? sUSDBalance < Number(total) || !sUSDBalance
        : tokenBalance < Number(amount) || !tokenBalance;

    const isButtonDisabled =
        !isTotalEntered ||
        !isPriceEntered ||
        !isAmountEntered ||
        !isSlippageValid ||
        isSubmitting ||
        !isWalletConnected ||
        insufficientBalance ||
        maxLimitExceeded ||
        isGettingQuote ||
        isAmmTradingDisabled ||
        !hasAllowance;

    const sellToken = isBuy ? SynthsUSD.address : isLong ? optionsMarket?.longAddress : optionsMarket?.shortAddress;
    const sellAmount = isBuy ? total : amount;
    const sellTokenCurrencyKey = isBuy ? SYNTHS_MAP.sUSD : OPTIONS_CURRENCY_MAP[optionSide];

    const formatBuySellArguments = () => {
        const marketAddress = optionsMarket?.address;
        const side = SIDE[optionSide];
        const parsedAmount = ethers.utils.parseEther(amount.toString());
        const parsedTotal = ethers.utils.parseEther(total.toString());
        const parsedSlippage = ethers.utils.parseEther((Number(slippage) / 100).toString());
        return { marketAddress, side, parsedAmount, parsedTotal, parsedSlippage };
    };

    useEffect(() => {
        const erc20Instance = new ethers.Contract(sellToken, erc20Contract.abi, snxJSConnector.signer);
        const { ammContract } = snxJSConnector;
        const addressToApprove = ammContract ? ammContract.address : '';

        const getAllowance = async () => {
            try {
                const parsedSellAmount = ethers.utils.parseEther(Number(sellAmount).toString());
                const allowance = await checkAllowance(
                    parsedSellAmount,
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
    }, [walletAddress, isWalletConnected, isBuy, optionSide, hasAllowance, sellAmount, isAllowing]);

    const fetchL1Fee = async (
        ammContractWithSigner: any,
        marketAddress: string,
        side: any,
        parsedAmount: any,
        parsedTotal: any,
        parsedSlippage: any
    ) => {
        const txRequest = isBuy
            ? await ammContractWithSigner.populateTransaction.buyFromAMM(
                  marketAddress,
                  side,
                  parsedAmount,
                  parsedTotal,
                  parsedSlippage
              )
            : await ammContractWithSigner.populateTransaction.sellToAMM(
                  marketAddress,
                  side,
                  parsedAmount,
                  parsedTotal,
                  parsedSlippage
              );
        return getL1FeeInWei(txRequest);
    };

    const fetchGasLimit = async (
        marketAddress: string,
        side: any,
        parsedAmount: any,
        parsedTotal: any,
        parsedSlippage: any
    ) => {
        try {
            const { ammContract } = snxJSConnector as any;
            const ammContractWithSigner = ammContract.connect((snxJSConnector as any).signer);

            if (isL2) {
                const l1FeeInWei = await fetchL1Fee(
                    ammContractWithSigner,
                    marketAddress,
                    side,
                    parsedAmount,
                    parsedTotal,
                    parsedSlippage
                );
                setGasLimit(MAX_L2_GAS_LIMIT);
                setL1Fee(l1FeeInWei);
                return MAX_L2_GAS_LIMIT;
            } else {
                setGasLimit(MAX_L2_GAS_LIMIT);
                return MAX_L2_GAS_LIMIT;
            }
        } catch (e) {
            console.log(e);
            setGasLimit(null);
            return null;
        }
    };

    useEffect(() => {
        if (isButtonDisabled) return;
        const { marketAddress, side, parsedAmount, parsedTotal, parsedSlippage } = formatBuySellArguments();
        fetchGasLimit(marketAddress, side, parsedAmount, parsedTotal, parsedSlippage);
    }, [isWalletConnected, hasAllowance, slippage]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const erc20Instance = new ethers.Contract(sellToken, erc20Contract.abi, snxJSConnector.signer);
        const { ammContract } = snxJSConnector;
        const addressToApprove = ammContract ? ammContract.address : '';

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
        }
    };

    const resetData = () => {
        setPrice('');
        setTotal('');
        setPriceImpact('');
        setPotentialReturn('');
        setGasLimit(null);
        setIsPotentialReturnAvailable(isBuy);
    };

    const fetchAmmPriceData = async (isRefresh: boolean, isSubmit = false) => {
        let priceChanged = false;
        let latestGasLimit = null;
        if (!isRefresh && !isSubmit) {
            setIsGettingQuote(true);
        }
        if (isAmountEntered) {
            try {
                const { ammContract } = snxJSConnector as any;
                const ammContractWithSigner = ammContract.connect((snxJSConnector as any).signer);

                const parsedAmount = ethers.utils.parseEther(amount.toString());
                const [ammQuote, ammPriceImpact] = await Promise.all([
                    isBuy
                        ? ammContractWithSigner.buyFromAmmQuote(optionsMarket.address, SIDE[optionSide], parsedAmount)
                        : ammContractWithSigner.sellToAmmQuote(optionsMarket.address, SIDE[optionSide], parsedAmount),
                    isBuy
                        ? ammContractWithSigner.buyPriceImpact(optionsMarket.address, SIDE[optionSide], parsedAmount)
                        : ammContractWithSigner.sellPriceImpact(optionsMarket.address, SIDE[optionSide], parsedAmount),
                ]);
                const ammPrice = bigNumberFormatter(ammQuote) / Number(amount);
                setPrice(ammPrice);
                setTotal(bigNumberFormatter(ammQuote));
                setPriceImpact(ammPrice > 0 ? bigNumberFormatter(ammPriceImpact) - MIN_SCEW_IMPACT : 0);
                setPotentialReturn(ammPrice > 0 && isBuy ? 1 / ammPrice - 1 : 0);
                setIsPotentialReturnAvailable(isBuy);

                const parsedSlippage = ethers.utils.parseEther((Number(slippage) / 100).toString());
                const isQuoteChanged = ammPrice !== price || total !== bigNumberFormatter(ammQuote);

                if (isSubmit) {
                    latestGasLimit = await fetchGasLimit(
                        optionsMarket.address,
                        SIDE[optionSide],
                        parsedAmount,
                        ammQuote,
                        parsedSlippage
                    );
                } else {
                    if (
                        ammPrice > 0 &&
                        bigNumberFormatter(ammQuote) > 0 &&
                        isSlippageValid &&
                        isQuoteChanged &&
                        hasAllowance
                    ) {
                        fetchGasLimit(optionsMarket.address, SIDE[optionSide], parsedAmount, ammQuote, parsedSlippage);
                    }
                }
                priceChanged = ammPrice !== price;
            } catch (e) {
                console.log(e);
                resetData();
                priceChanged = true;
            }
        } else {
            resetData();
        }
        if (!isRefresh && !isSubmit) {
            setIsGettingQuote(false);
        }
        return { priceChanged, latestGasLimit };
    };

    useDebouncedEffect(() => {
        fetchAmmPriceData(false);
    }, [amount, isBuy, isLong, walletAddress, isAmountEntered]);

    useInterval(async () => {
        fetchAmmPriceData(true);
    }, 5000);

    const handleSubmit = async () => {
        setTxErrorMessage(null);
        setIsSubmitting(true);
        setIsPriceChanged(false);

        const { priceChanged, latestGasLimit } = await fetchAmmPriceData(true, true);
        if (priceChanged) {
            setIsPriceChanged(true);
            setIsSubmitting(false);
            return;
        }
        try {
            const { ammContract } = snxJSConnector as any;
            const ammContractWithSigner = ammContract.connect((snxJSConnector as any).signer);

            const { marketAddress, side, parsedAmount, parsedTotal, parsedSlippage } = formatBuySellArguments();

            const tx = (isBuy
                ? await ammContractWithSigner.buyFromAMM(
                      marketAddress,
                      side,
                      parsedAmount,
                      parsedTotal,
                      parsedSlippage,
                      {
                          gasLimit: latestGasLimit !== null ? latestGasLimit : gasLimit,
                      }
                  )
                : await ammContractWithSigner.sellToAMM(
                      marketAddress,
                      side,
                      parsedAmount,
                      parsedTotal,
                      parsedSlippage,
                      {
                          gasLimit: latestGasLimit !== null ? latestGasLimit : gasLimit,
                      }
                  )) as ethers.ContractTransaction;
            const txResult = await tx.wait();

            if (txResult && txResult.transactionHash) {
                dispatchMarketNotification(
                    t(
                        `options.market.trade-options.place-order.swap-confirm-button.${orderSide.value}.confirmation-message`
                    )
                );
                refetchAmmData(walletAddress, optionsMarket?.address, networkId);
                refetchTrades(optionsMarket?.address);
                refetchUserTrades(optionsMarket?.address, walletAddress);
                setIsSubmitting(false);
                resetData();
                setAmount('');
            }
        } catch (e) {
            console.log(e);
            setTxErrorMessage(t('common.errors.unknown-error-try-again'));
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let max = 0;
        let base = 0;
        let baseImpact = 0;
        if (ammMaxLimits) {
            max = isLong
                ? isBuy
                    ? ammMaxLimits.maxBuyLong
                    : ammMaxLimits.maxSellLong
                : isBuy
                ? ammMaxLimits.maxBuyShort
                : ammMaxLimits.maxSellShort;
            base = isLong
                ? isBuy
                    ? ammMaxLimits.buyLongPrice
                    : ammMaxLimits.sellLongPrice
                : isBuy
                ? ammMaxLimits.buyShortPrice
                : ammMaxLimits.sellShortPrice;
            baseImpact = isLong
                ? isBuy
                    ? ammMaxLimits.buyLongPriceImpact
                    : ammMaxLimits.sellLongPriceImpact
                : isBuy
                ? ammMaxLimits.buyShortPriceImpact
                : ammMaxLimits.sellShortPriceImpact;
        }
        setMaxLimit(max);
        setBasePrice(base);
        setBasePriceImpact(baseImpact);
        setPotentialBaseReturn(base > 0 && isBuy ? 1 / Number(base) - 1 : 0);
        setInsufficientLiquidity(max < MINIMUM_AMM_LIQUIDITY);
    }, [ammMaxLimits, isLong, isBuy]);

    useEffect(() => {
        setIsSlippageValid(Number(slippage) > 0 && Number(slippage) <= 100);
    }, [slippage]);

    useEffect(() => {
        setIsAmountValid(
            Number(amount) === 0 ||
                (Number(amount) > 0 &&
                    (isBuy
                        ? (Number(total) > 0 && Number(total) <= sUSDBalance) ||
                          (Number(total) === 0 && sUSDBalance > 0)
                        : Number(amount) <= tokenBalance))
        );
    }, [amount, total, isBuy, sUSDBalance, tokenBalance]);

    useEffect(() => {
        setMaxLimitExceeded(Number(amount) > maxLimit);
    }, [amount, maxLimit]);

    const getSubmitButton = () => {
        if (isAmmTradingDisabled) {
            return (
                <Button disabled={true} padding={'5px 0px'}>
                    {t('amm.amm-disabled')}
                </Button>
            );
        }
        if (!isWalletConnected) {
            return (
                <Button padding={'5px 0px'} onClickHandler={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        if (insufficientLiquidity) {
            return (
                <Button padding={'5px 0px'} disabled={true}>
                    {t(`common.errors.insufficient-liquidity`)}
                </Button>
            );
        }
        if (insufficientBalance) {
            return (
                <Button padding={'5px 0px'} disabled={true}>
                    {t(`common.errors.insufficient-balance`)}
                </Button>
            );
        }
        if (!isAmountEntered) {
            return (
                <Button padding={'5px 0px'} disabled={true}>
                    {t(`common.errors.enter-amount`)}
                </Button>
            );
        }
        if (!isSlippageValid) {
            return (
                <Button padding={'5px 0px'} disabled={true}>
                    {t(`common.errors.invalid-slippage`)}
                </Button>
            );
        }
        if (maxLimitExceeded) {
            return (
                <Button padding={'5px 0px'} disabled={true}>
                    {t(`common.errors.insufficient-liquidity`)}
                </Button>
            );
        }
        if (!hasAllowance) {
            return (
                <Button padding={'5px 0px'} disabled={isAllowing} onClickHandler={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: sellTokenCurrencyKey })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: sellTokenCurrencyKey,
                          })}
                </Button>
            );
        }
        return (
            <Button padding={'5px 0px'} disabled={isButtonDisabled || !gasLimit} onClickHandler={handleSubmit}>
                {!isSubmitting
                    ? t(`options.market.trade-options.place-order.swap-confirm-button.${orderSide.value}.label`)
                    : t(
                          `options.market.trade-options.place-order.swap-confirm-button.${orderSide.value}.progress-label`
                      )}
            </Button>
        );
    };

    const getPriceImpactColor = (priceImpactPercentage: number) => {
        if (priceImpactPercentage >= 0.03 || Number(priceImpactPercentage) <= -0.03) {
            return '#FF9548;';
        }
        if (priceImpactPercentage >= 0.01 || Number(priceImpactPercentage) <= -0.01) {
            return '#FFCC00';
        }
        return '#00F152';
    };

    const formDisabled = isSubmitting || isAmmTradingDisabled;
    return (
        <Wrapper>
            <Switch
                active={orderSide.value !== 'buy'}
                width={'94px'}
                height={'32px'}
                dotSize={'22px'}
                label={{
                    firstLabel: orderSideOptions[0].label.toUpperCase(),
                    secondLabel: orderSideOptions[1].label.toUpperCase(),
                    fontSize: '25px',
                }}
                shadow={true}
                dotBackground={'var(--amm-switch-circle)'}
                handleClick={() =>
                    orderSide.value == 'buy' ? setOrderSide(orderSideOptions[1]) : setOrderSide(orderSideOptions[0])
                }
            />
            <ButtonWrapper>
                <Button
                    width={'48%'}
                    active={optionSide == 'long'}
                    padding={'5px 0px'}
                    onClickHandler={() => setOptionSide('long')}
                >
                    {'LONG'}
                </Button>
                <Button
                    width={'48%'}
                    active={optionSide == 'short'}
                    padding={'5px 0px'}
                    onClickHandler={() => setOptionSide('short')}
                >
                    {'Short'}
                </Button>
            </ButtonWrapper>
            <Input
                title={t('options.market.trade-options.place-order.amount-label', {
                    orderSide: OPTIONS_CURRENCY_MAP[optionSide],
                })}
                value={amount}
                valueType={'number'}
                subValue={OPTIONS_CURRENCY_MAP[optionSide]}
                valueChange={(value) => setAmount(value)}
                borderColor={!isAmountValid ? '#C3244A' : undefined}
                displayTooltip={!isAmountValid || maxLimitExceeded}
                tooltipText={t(
                    !isAmountValid ? 'common.errors.insufficient-balance-wallet' : 'common.errors.max-limit-exceeded',
                    {
                        currencyKey: isBuy ? SYNTHS_MAP.sUSD : OPTIONS_CURRENCY_MAP[optionSide],
                    }
                )}
            />
            <RangeSlider
                min={1}
                max={maxLimit}
                showFooter={true}
                step={1}
                footerText={t('amm.max-amount', {
                    amount: formatCurrencyWithKey(OPTIONS_CURRENCY_MAP[optionSide], maxLimit),
                })}
                defaultValue={Number(amount)}
                onChangeEventHandler={(value) => setAmount(value)}
            />
            <Input
                title={t('options.market.trade-options.place-order.price-label', {
                    currencyKey: orderSide.value.toUpperCase(),
                })}
                value={
                    isGettingQuote
                        ? '...'
                        : Number(price) > 0 || Number(basePrice) > 0
                        ? formatCurrencyWithKey(SYNTHS_MAP.sUSD, Number(price) > 0 ? price : basePrice)
                        : '-'
                }
                subValue={SYNTHS_MAP.sUSD}
                valueEditDisable={true}
            />
            <Input
                title={t('amm.total-buy-label')}
                value={isGettingQuote ? '...' : Number(price) > 0 ? formatCurrencyWithKey(SYNTHS_MAP.sUSD, total) : '-'}
                subValue={SYNTHS_MAP.sUSD}
                valueEditDisable={true}
            />
            <Input
                title={t('amm.return-label')}
                value={
                    isGettingQuote
                        ? '...'
                        : Number(price) > 0
                        ? isPotentialReturnAvailable
                            ? `${formatCurrencyWithKey(SYNTHS_MAP.sUSD, Number(potentialReturn) * Number(total))}`
                            : '-'
                        : '-'
                }
                valueColor={isPotentialReturnAvailable ? getPriceImpactColor(Number(priceImpact)) : undefined}
                subValue={
                    isPotentialReturnAvailable
                        ? `${formatPercentage(potentialBaseReturn)}`
                        : isBuy && Number(basePrice) > 0 && Number(potentialBaseReturn) > 0
                        ? formatPercentage(potentialReturn)
                        : ''
                }
                subValueColor={isPotentialReturnAvailable ? getPriceImpactColor(Number(priceImpact)) : undefined}
                valueEditDisable={true}
            />
            <Input
                title={t('amm.skew-label')}
                value={
                    isGettingQuote
                        ? '-'
                        : Number(price) > 0 || Number(basePrice) > 0
                        ? formatPercentage(Number(price) > 0 ? priceImpact : basePriceImpact)
                        : '-'
                }
                valueColor={
                    Number(price) > 0 || Number(basePrice) > 0
                        ? getPriceImpactColor(Number(price) > 0 ? Number(priceImpact) : Number(basePriceImpact))
                        : undefined
                }
                valueEditDisable={true}
            />
            <Slippage
                fixed={SLIPPAGE_PERCENTAGE}
                defaultValue={Number(slippage)}
                onChangeHandler={(value) => setSlippage(value)}
            />
            <Divider />
            <NetworkFees gasLimit={gasLimit} disabled={formDisabled} l1Fee={l1Fee} />
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={sellAmount}
                    tokenSymbol={sellTokenCurrencyKey}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
            {isPriceChanged && <AlertMessage>{t('amm.price-changed-warning')}</AlertMessage>}
            {txErrorMessage && (
                <AlertMessage onClose={() => setTxErrorMessage(null)}>{t('amm.price-changed-warning')}</AlertMessage>
            )}
            {getSubmitButton()}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    border: 2px solid var(--input-border-color);
    border-radius: 15px;
    padding: 30px;
    margin-right: 27px;
    width: 30%;
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;
    margin-top: 28px;
`;

export default AMM;

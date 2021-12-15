import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MarketWidgetHeader from '../components/MarketWidget/MarketWidgetHeader';
import { COLORS, MarketWidgetKey } from '../../../../constants/ui';
import { FlexDivCentered, FlexDivColumn, FlexDivEnd, FlexDivRow, FlexDivRowCentered } from '../../../../theme/common';
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
    SummaryContainer,
    Divider,
    LightTooltip,
} from '../components';
import { formatCurrencyWithKey, formatPercentage } from '../../../../utils/formatters/number';
import { OPTIONS_CURRENCY_MAP, SYNTHS_MAP } from '../../../../constants/currency';
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
import useAmmMaxLimitsQuery, { AmmMaxLimits } from 'queries/options/useAmmMaxLimitsQuery';
import NetworkFees from 'pages/Options/components/NetworkFees';
import { formatGasLimit, getIsOVM, getL1FeeInWei } from 'utils/network';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { SIDE, SLIPPAGE_PERCENTAGE } from 'constants/options';
import FieldValidationMessage from 'components/FieldValidationMessage';
import {
    QuestionMarkIcon,
    PercentageLabel,
    SlippageButton,
    SlippageContainer,
    SlippageInput,
    SlippageLabel,
} from '../TradeOptions/TokenSwap/TokenSwap';
import { dispatchMarketNotification } from 'utils/options';
import SimpleLoader from './SimpleLoader';

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
    const [total, setTotal] = useState<number | string>('');
    const [priceImpact, setPriceImpact] = useState<number | string>('');
    const [potentialReturn, setPotentialReturn] = useState<number | string>('');
    const [slippage, setSlippage] = useState<number | string>(SLIPPAGE_PERCENTAGE[1]);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isGettingQuote, setIsGettingQuote] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [gasLimit, setGasLimit] = useState<number | null>(null);
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
    const [maxLimitExceeded, setMaxLimitExceeded] = useState<boolean>(false);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isSlippageValid, setIsSlippageValid] = useState<boolean>(true);
    const [maxLimit, setMaxLimit] = useState<number>(0);
    const [l1Fee, setL1Fee] = useState<number | null>(null);
    const isL2 = getIsOVM(networkId);

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

    const ammMaxLimitsQuery = useAmmMaxLimitsQuery(optionsMarket.address, {
        enabled: isAppReady,
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
        maxLimitExceeded;

    const sellToken = isBuy ? SynthsUSD.address : isLong ? optionsMarket.longAddress : optionsMarket.shortAddress;
    const sellTokenCurrencyKey = isBuy ? SYNTHS_MAP.sUSD : OPTIONS_CURRENCY_MAP[optionSide];

    const formatBuySellArguments = () => {
        const marketAddress = optionsMarket.address;
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

    useEffect(() => {
        const fetchL1Fee = async (ammContractWithSigner: any) => {
            const { marketAddress, side, parsedAmount, parsedTotal, parsedSlippage } = formatBuySellArguments();

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

        const fetchGasLimit = async () => {
            try {
                const { ammContract } = snxJSConnector as any;
                const ammContractWithSigner = ammContract.connect((snxJSConnector as any).signer);

                const { marketAddress, side, parsedAmount, parsedTotal, parsedSlippage } = formatBuySellArguments();

                console.log(amount, total, slippage);

                if (isL2) {
                    const [gasEstimate, l1FeeInWei] = await Promise.all([
                        isBuy
                            ? ammContractWithSigner.estimateGas.buyFromAMM(
                                  marketAddress,
                                  side,
                                  parsedAmount,
                                  parsedTotal,
                                  parsedSlippage
                              )
                            : ammContractWithSigner.estimateGas.sellToAMM(
                                  marketAddress,
                                  side,
                                  parsedAmount,
                                  parsedTotal,
                                  parsedSlippage
                              ),
                        fetchL1Fee(ammContractWithSigner),
                    ]);
                    setGasLimit(formatGasLimit(gasEstimate, networkId));
                    setL1Fee(l1FeeInWei);
                } else {
                    const gasEstimate = await (isBuy
                        ? ammContractWithSigner.estimateGas.buyFromAMM(
                              marketAddress,
                              side,
                              parsedAmount,
                              parsedTotal,
                              parsedSlippage
                          )
                        : ammContractWithSigner.estimateGas.sellToAMM(
                              optionsMarket.address,
                              SIDE[optionSide],
                              parsedAmount,
                              parsedTotal,
                              parsedSlippage
                          ));
                    setGasLimit(formatGasLimit(gasEstimate, networkId));
                }
            } catch (e) {
                console.log(e);
                setGasLimit(null);
            }
        };
        if (isButtonDisabled) return;
        fetchGasLimit();
    }, [isButtonDisabled, hasAllowance, isBuy, isLong, /*amount, */ slippage, total]);

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

    const resetData = () => {
        setPrice('');
        setTotal('');
        setPriceImpact('');
        setPotentialReturn('');
        setGasLimit(null);
    };

    useDebouncedEffect(() => {
        const fetchAmmPriceData = async () => {
            setIsGettingQuote(true);
            if (isAmountEntered) {
                try {
                    const { ammContract } = snxJSConnector as any;
                    const ammContractWithSigner = ammContract.connect((snxJSConnector as any).signer);

                    const parsedAmount = ethers.utils.parseEther(amount.toString());
                    const [ammQuote, ammPriceImpact] = await Promise.all([
                        isBuy
                            ? ammContractWithSigner.buyFromAmmQuote(
                                  optionsMarket.address,
                                  SIDE[optionSide],
                                  parsedAmount
                              )
                            : ammContractWithSigner.sellToAmmQuote(
                                  optionsMarket.address,
                                  SIDE[optionSide],
                                  parsedAmount
                              ),
                        isBuy
                            ? ammContractWithSigner.buyPriceImpact(
                                  optionsMarket.address,
                                  SIDE[optionSide],
                                  parsedAmount
                              )
                            : ammContractWithSigner.sellPriceImpact(
                                  optionsMarket.address,
                                  SIDE[optionSide],
                                  parsedAmount
                              ),
                    ]);
                    const ammPrice = bigNumberFormatter(ammQuote) / Number(amount);
                    setPrice(ammPrice);
                    setTotal(bigNumberFormatter(ammQuote));
                    setPriceImpact(bigNumberFormatter(ammPriceImpact));
                    setPotentialReturn(ammPrice > 0 ? 1 / ammPrice - 1 : 0);
                } catch (e) {
                    console.log(e);
                    console.log('out');
                    resetData();
                }
            } else {
                resetData();
            }
            setIsGettingQuote(false);
        };
        fetchAmmPriceData();
    }, [amount, isBuy, isLong, walletAddress, isAmountEntered]);

    const handleSubmit = async () => {
        setTxErrorMessage(null);
        setIsSubmitting(true);
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
                          gasLimit,
                      }
                  )
                : await ammContractWithSigner.sellToAMM(
                      marketAddress,
                      side,
                      parsedAmount,
                      parsedTotal,
                      parsedSlippage,
                      {
                          gasLimit,
                      }
                  )) as ethers.ContractTransaction;
            const txResult = await tx.wait();

            if (txResult && txResult.transactionHash) {
                dispatchMarketNotification('Swap succesfull');
                setIsSubmitting(false);
            }
        } catch (e) {
            console.log(e);
            setTxErrorMessage(t('common.errors.unknown-error-try-again'));
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let max = 0;
        if (ammMaxLimits) {
            max = isLong
                ? isBuy
                    ? ammMaxLimits.maxBuyLong
                    : ammMaxLimits.maxSellLong
                : isBuy
                ? ammMaxLimits.maxBuyShort
                : ammMaxLimits.maxSellShort;
        }
        setMaxLimit(max);
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
        if (!isSlippageValid) {
            return (
                <SubmitButton disabled={true} isBuy={isBuy}>
                    {t(`common.errors.invalid-slippage`)}
                </SubmitButton>
            );
        }
        if (maxLimitExceeded) {
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
            <SubmitButton disabled={isButtonDisabled} onClick={handleSubmit} isBuy={isBuy}>
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
                                isDisabled={isSubmitting}
                                className={isSubmitting ? 'disabled' : ''}
                            />
                            <InputLabel>{t('options.market.trade-options.place-order.order-type-label')}</InputLabel>
                        </ShortInputContainer>
                        <ShortInputContainer>
                            <SummaryContent>
                                {isGettingQuote ? <SimpleLoader /> : formatCurrencyWithKey(SYNTHS_MAP.sUSD, price)}
                            </SummaryContent>
                            <SummaryLabel>
                                {t('options.market.trade-options.place-order.price-label', {
                                    currencyKey: OPTIONS_CURRENCY_MAP[optionSide],
                                })}
                            </SummaryLabel>
                        </ShortInputContainer>
                    </FlexDivRow>
                    <FlexDivRowCentered>
                        <ShortInputContainer>
                            <OptionsContainer>
                                <OptionButton
                                    onClick={() => setOptionSide('long')}
                                    className={optionSide === 'long' ? 'selected' : ''}
                                    disabled={isSubmitting}
                                >
                                    LONG
                                </OptionButton>
                                <OptionButton
                                    onClick={() => setOptionSide('short')}
                                    className={optionSide === 'short' ? 'selected' : ''}
                                    disabled={isSubmitting}
                                >
                                    SHORT
                                </OptionButton>
                            </OptionsContainer>
                        </ShortInputContainer>
                        <ShortInputContainer>
                            <SummaryContent>
                                {isGettingQuote ? <SimpleLoader /> : formatCurrencyWithKey(SYNTHS_MAP.sUSD, total)}
                            </SummaryContent>
                            <SummaryLabel>Total</SummaryLabel>
                        </ShortInputContainer>
                    </FlexDivRowCentered>
                    <FlexDivRow>
                        <ShortInputContainer>
                            <NumericInput
                                value={amount}
                                onChange={(_, value) => setAmount(value)}
                                className={isAmountValid && !maxLimitExceeded ? '' : 'error'}
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
                            <FieldValidationMessage
                                showValidation={!isAmountValid || maxLimitExceeded}
                                message={t(
                                    !isAmountValid
                                        ? 'common.errors.insufficient-balance-wallet'
                                        : 'common.errors.max-limit-exceeded',
                                    {
                                        currencyKey: isBuy ? SYNTHS_MAP.sUSD : OPTIONS_CURRENCY_MAP[optionSide],
                                    }
                                )}
                            />
                        </ShortInputContainer>
                        <ShortInputContainer>
                            <SummaryContent>
                                {isGettingQuote ? <SimpleLoader /> : formatPercentage(potentialReturn)}
                            </SummaryContent>
                            <SummaryLabel>Potential return</SummaryLabel>
                        </ShortInputContainer>
                    </FlexDivRow>
                    <FlexDivRow>
                        <BuySellSliderContainer>
                            {isBuy ? (
                                <BuySlider
                                    value={Number(amount)}
                                    step={1}
                                    max={maxLimit}
                                    min={0}
                                    onChange={(_, value) => {
                                        setAmount(Number(value));
                                    }}
                                    disabled={isSubmitting}
                                />
                            ) : (
                                <SellSlider
                                    value={Number(amount)}
                                    step={1}
                                    max={maxLimit}
                                    min={0}
                                    onChange={(_, value) => {
                                        setAmount(Number(value));
                                    }}
                                    disabled={isSubmitting}
                                />
                            )}
                            <FlexDivRow>
                                <SliderRange color={isBuy ? COLORS.BUY : COLORS.SELL}>{`${formatCurrencyWithKey(
                                    OPTIONS_CURRENCY_MAP[optionSide],
                                    0
                                )}`}</SliderRange>
                                <SliderRange color={isBuy ? COLORS.BUY : COLORS.SELL}>{`${formatCurrencyWithKey(
                                    OPTIONS_CURRENCY_MAP[optionSide],
                                    maxLimit
                                )}`}</SliderRange>
                            </FlexDivRow>
                        </BuySellSliderContainer>
                        <ShortInputContainer>
                            <SummaryContent>
                                {isGettingQuote ? <SimpleLoader /> : formatPercentage(priceImpact)}
                            </SummaryContent>
                            <SummaryLabel>Skew impact</SummaryLabel>
                        </ShortInputContainer>
                    </FlexDivRow>
                    <SummaryContainer>
                        <FlexDivRow>
                            <FlexDivColumn>
                                <SlippageLabel>
                                    {t('options.market.trade-options.place-order.slippage-label')}
                                    <LightTooltip
                                        title={t('options.market.trade-options.place-order.slippage-tooltip')}
                                    >
                                        <QuestionMarkIcon />
                                    </LightTooltip>
                                </SlippageLabel>
                            </FlexDivColumn>
                            <FlexDivColumn>
                                <FlexDivEnd>
                                    {SLIPPAGE_PERCENTAGE.map((percentage: number) => (
                                        <SlippageButton
                                            className={percentage === slippage ? 'selected' : ''}
                                            key={percentage}
                                            onClick={() => setSlippage(percentage)}
                                            disabled={isSubmitting}
                                        >
                                            {`${percentage}%`}
                                        </SlippageButton>
                                    ))}
                                    <SlippageContainer>
                                        <SlippageInput
                                            value={slippage}
                                            onChange={(_: any, value: any) => setSlippage(value)}
                                            disabled={isSubmitting}
                                        />
                                        <PercentageLabel className={isSubmitting ? 'disabled' : ''}>%</PercentageLabel>
                                    </SlippageContainer>
                                </FlexDivEnd>
                                <FieldValidationMessage
                                    showValidation={!isSlippageValid}
                                    message={t(`common.errors.enter-valid-slippage`)}
                                    arrowPosition="right"
                                    marginLeft="40px"
                                />
                            </FlexDivColumn>
                        </FlexDivRow>
                    </SummaryContainer>
                    <Divider />
                    <SummaryContainer>
                        <NetworkFees gasLimit={gasLimit} disabled={isSubmitting} l1Fee={l1Fee} />
                    </SummaryContainer>
                    <SubmitButtonContainer>{getSubmitButton()}</SubmitButtonContainer>
                    <ValidationMessage
                        showValidation={txErrorMessage !== null}
                        message={txErrorMessage}
                        onDismiss={() => setTxErrorMessage(null)}
                    />
                </Container>
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

const SummaryContent = styled.div`
    background: #b8c6e5;
    border-radius: 12px;
    height: 64px;
    padding: 31px 68px 0 22px;
    color: #0c1c68;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.25px;
`;

const SummaryLabel = styled(InputLabel)`
    color: #0c1c68;
`;

const BuySellSliderContainer = styled(SliderContainer)`
    margin-right: 10px;
    padding: 0 10px 0 10px;
`;

export default AMM;

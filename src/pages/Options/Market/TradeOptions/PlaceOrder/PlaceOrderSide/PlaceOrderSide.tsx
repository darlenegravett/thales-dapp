import {
    generatePseudoRandomSalt,
    NULL_ADDRESS,
    NULL_BYTES,
    Order,
    signatureUtils,
    ZERO_AMOUNT,
} from '@0x/order-utils';
import { LimitOrder, SignatureType, ZERO } from '@0x/protocol-utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import DatePicker from 'components/Input/DatePicker';
import { DECIMALS } from 'constants/0x';
import { SYNTHS_MAP } from 'constants/currency';
import { EMPTY_VALUE } from 'constants/placeholder';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import {
    getCustomGasPrice,
    getGasSpeed,
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Form, Input, Segment, Button, Message, Header } from 'semantic-ui-react';
import { OrderSide } from 'types/options';
import { get0xBaseURL, isV4 } from 'utils/0x';
import { getCurrencyKeyBalance } from 'utils/balances';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import snxJSConnector from 'utils/snxJSConnector';
import { ReactComponent as WalletIcon } from 'assets/images/wallet.svg';
import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import erc20Contract from 'utils/contracts/erc20Contract';
import { ethers } from 'ethers';
import { MaxUint256 } from 'ethers/constants';
import { gasPriceInWei, normalizeGasLimit } from 'utils/network';
import { APPROVAL_EVENTS } from 'constants/events';
import { bigNumberFormatter, getAddress } from 'utils/formatters/ethers';

declare const window: any;

type PlaceOrderSideProps = {
    baseToken: string;
    orderSide: OrderSide;
    tokenBalance: number;
};

const PlaceOrderSide: React.FC<PlaceOrderSideProps> = ({ baseToken, orderSide, tokenBalance }) => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const gasSpeed = useSelector((state: RootState) => getGasSpeed(state));
    const customGasPrice = useSelector((state: RootState) => getCustomGasPrice(state));
    const [price, setPrice] = useState<number | string>('');
    const [amount, setAmount] = useState<number | string>('');
    const [orderEndDate, setOrderEndDate] = useState<Date | null | undefined>(null);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);

    const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const walletBalancesMap =
        synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
            ? { synths: synthsWalletBalancesQuery.data }
            : null;
    const sUSDBalance = getCurrencyKeyBalance(walletBalancesMap, SYNTHS_MAP.sUSD) || 0;

    const ethGasPriceQuery = useEthGasPriceQuery();
    const gasPrice = useMemo(
        () =>
            customGasPrice !== null
                ? customGasPrice
                : ethGasPriceQuery.data != null
                ? ethGasPriceQuery.data[gasSpeed]
                : null,
        [customGasPrice, ethGasPriceQuery.data, gasSpeed]
    );
    const {
        snxJS: { sUSD },
        contractWrappers0x,
    } = snxJSConnector as any;
    const isBuy = orderSide === 'buy';
    // const isSell = orderSide === 'sell';
    // const isLong = optionSide === 'long';
    // const isShort = optionSide === 'short';

    const isButtonDisabled = isSubmitting || !isWalletConnected || (isBuy ? !sUSDBalance : !tokenBalance);
    const makerToken = isBuy ? sUSD.contract.address : baseToken;
    const takerToken = isBuy ? baseToken : sUSD.contract.address;
    const erc20Instance = new ethers.Contract(makerToken, erc20Contract.abi, snxJSConnector.signer);
    const addressToApprove: string = isV4(networkId)
        ? contractWrappers0x.exchangeProxy.address
        : '0xf1ec01d6236d3cd881a0bf0130ea25fe4234003e';

    useEffect(() => {
        const getAllowance = async () => {
            const allowance = await erc20Instance.allowance(walletAddress, addressToApprove);
            setAllowance(!!bigNumberFormatter(allowance));
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
    }, [walletAddress, isWalletConnected]);

    const handleAllowance = async () => {
        if (gasPrice !== null) {
            try {
                setIsAllowing(true);
                const gasEstimate = await erc20Instance.estimate.approve(addressToApprove, MaxUint256);
                await erc20Instance.approve(addressToApprove, MaxUint256, {
                    gasLimit: normalizeGasLimit(Number(gasEstimate)),
                    gasPrice: gasPriceInWei(gasPrice),
                });
            } catch (e) {
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    const handleSubmitOrder = async () => {
        setTxErrorMessage(null);
        setIsSubmitting(true);

        const baseUrl = get0xBaseURL(networkId);
        const placeOrderUrl = `${baseUrl}order`;

        const makerAmount = Web3Wrapper.toBaseUnitAmount(
            new BigNumber(isBuy ? Number(amount) * Number(price) : amount),
            DECIMALS
        );
        const takerAmount = Web3Wrapper.toBaseUnitAmount(
            new BigNumber(isBuy ? amount : Number(amount) * Number(price)),
            DECIMALS
        );
        const expiry = new BigNumber(Math.round((orderEndDate as Date).getTime() / 1000));
        const salt = generatePseudoRandomSalt();

        if (isV4(networkId)) {
            try {
                const createSignedOrderV4Async = async () => {
                    const order = new LimitOrder({
                        makerToken,
                        takerToken,
                        makerAmount,
                        takerAmount,
                        maker: walletAddress,
                        sender: NULL_ADDRESS,
                        expiry,
                        salt,
                        chainId: networkId,
                        verifyingContract: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
                    });

                    const signature = await order.getSignatureWithProviderAsync(window.ethereum, SignatureType.EIP712);
                    return { ...order, signature };
                };

                const signedOrder = await createSignedOrderV4Async();

                try {
                    await axios({
                        method: 'POST',
                        url: placeOrderUrl,
                        data: signedOrder,
                    });
                } catch (err) {
                    console.error(JSON.stringify(err.response.data));
                    setTxErrorMessage(t('common.errors.unknown-error-try-again'));
                } finally {
                    setIsSubmitting(false);
                }
            } catch (e) {
                console.error(e);
                setTxErrorMessage(t('common.errors.unknown-error-try-again'));
            } finally {
                setIsSubmitting(false);
            }
        } else {
            const makerAssetData = await contractWrappers0x.devUtils.encodeERC20AssetData(makerToken).callAsync();
            const takerAssetData = await contractWrappers0x.devUtils.encodeERC20AssetData(takerToken).callAsync();

            const order: Order = {
                chainId: networkId,
                exchangeAddress: '0x4eacd0af335451709e1e7b570b8ea68edec8bc97',
                makerAddress: walletAddress,
                takerAddress: NULL_ADDRESS,
                senderAddress: NULL_ADDRESS,
                feeRecipientAddress: NULL_ADDRESS,
                expirationTimeSeconds: expiry,
                salt,
                makerAssetAmount: makerAmount,
                takerAssetAmount: takerAmount,
                makerAssetData,
                takerAssetData,
                makerFeeAssetData: NULL_BYTES,
                takerFeeAssetData: NULL_BYTES,
                makerFee: ZERO,
                takerFee: ZERO_AMOUNT,
            };
            try {
                const signedOrder = await signatureUtils.ecSignOrderAsync(
                    window.web3.currentProvider,
                    order,
                    walletAddress
                );

                try {
                    await axios({
                        method: 'POST',
                        url: placeOrderUrl,
                        data: signedOrder,
                    });
                } catch (err) {
                    console.error(JSON.stringify(err.response.data));
                    setTxErrorMessage(t('common.errors.unknown-error-try-again'));
                } finally {
                    setIsSubmitting(false);
                }
            } catch (e) {
                console.error(e);
                setTxErrorMessage(t('common.errors.unknown-error-try-again'));
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Segment>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Header as="h3">{t(`options.market.trade-options.place-order.${orderSide}.title`)}</Header>
                <span>
                    <WalletIcon />
                    {isWalletConnected
                        ? isBuy
                            ? formatCurrencyWithKey(SYNTHS_MAP.sUSD, sUSDBalance)
                            : formatCurrencyWithKey('sOPT', tokenBalance)
                        : EMPTY_VALUE}
                </span>
            </div>
            <Form>
                <Form.Field>
                    <label style={{ textTransform: 'none' }}>
                        {t('options.market.trade-options.place-order.amount-label', { orderSide })}
                    </label>
                    <Input
                        fluid
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        label="sOPT"
                        id="amount"
                        type="number"
                        min="0"
                    />
                </Form.Field>
                <Form.Field>
                    <label style={{ textTransform: 'none' }}>
                        {t('options.market.trade-options.place-order.price-label')}
                    </label>
                    <Input
                        fluid
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        label={SYNTHS_MAP.sUSD}
                        id="price"
                        type="number"
                        min="0"
                    />
                </Form.Field>
                <Form.Field>
                    <label style={{ textTransform: 'none' }}>
                        {t('options.market.trade-options.place-order.order-end-date')}
                    </label>
                    <DatePicker
                        id="order-end-date"
                        dateFormat="MMM d, yyyy h:mm aa"
                        selected={orderEndDate}
                        showTimeSelect={true}
                        onChange={(d: Date) => setOrderEndDate(d)}
                        minDate={new Date()}
                    />
                </Form.Field>
            </Form>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
                {hasAllowance ? (
                    <Button color={isBuy ? 'green' : 'red'} disabled={isButtonDisabled} onClick={handleSubmitOrder}>
                        {!isSubmitting
                            ? t('options.market.trade-options.place-order.confirm-button.label')
                            : t('options.market.trade-options.place-order.confirm-button.progress-label')}
                    </Button>
                ) : (
                    <Button
                        color={isBuy ? 'green' : 'red'}
                        disabled={isAllowing || !isWalletConnected}
                        onClick={handleAllowance}
                    >
                        {!isAllowing
                            ? t('common.enable-wallet-access.label')
                            : t('common.enable-wallet-access.progress-label')}
                    </Button>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                {txErrorMessage && <Message content={txErrorMessage} onDismiss={() => setTxErrorMessage(null)} />}
            </div>
        </Segment>
    );
};

export default PlaceOrderSide;

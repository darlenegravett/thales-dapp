import ApprovalModal from 'components/ApprovalModal';
import SimpleLoader from 'components/SimpleLoader';
import { ValidationMessage } from 'components/ValidationMessage/ValidationMessage';
import { SYNTHS_MAP, USD_SIGN } from 'constants/currency';
import { BigNumber, ethers } from 'ethers';
import { get } from 'lodash';
import useEthGasPriceEip1559Query from 'queries/network/useEthGasPriceEip1559Query';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getTheme } from 'redux/modules/ui';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered, LoaderContainer } from 'theme/common';
import erc20Contract from 'utils/contracts/erc20Contract';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { checkAllowance, getIsOVM, getTransactionPrice } from 'utils/network';
import { dispatchMarketNotification } from 'utils/options';
import { refetchUserBalance } from 'utils/queryConnector';
import useApproveSpender from './queries/useApproveSpender';
import useQuoteTokensQuery from './queries/useQuoteTokensQuery';
import useSwapTokenQuery from './queries/useSwapTokenQuery';
import SwapDialog from './styled-components';
import { ETH_Dai, ETH_Eth, ETH_sUSD, ETH_USDC, ETH_USDT, OP_Dai, OP_Eth, OP_sUSD, OP_USDC, OP_USDT } from './tokens';

const Swap: React.FC<any> = ({ handleClose, royaleTheme }) => {
    const { t } = useTranslation();
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const theme = useSelector((state: RootState) => getTheme(state));
    const [preLoadTokens, setPreLoadTokens] = useState([] as any);
    const isL2 = getIsOVM(networkId);
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const [fromToken, _setFromToken] = useState(isL2 ? OP_Eth : ETH_Eth);
    const [toToken, _setToToken] = useState(isL2 ? OP_sUSD : ETH_sUSD);
    const [amount, setAmount] = useState('');
    const [previewData, setPreviewData] = useState(undefined);
    const [allowance, setAllowance] = useState(false);
    const [balance, setBalance] = useState('0');
    const [isLoading, setLoading] = useState(false);
    const [showSceleton, setShowSceleton] = useState(false);
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);

    const ethGasPriceEip1559Query = useEthGasPriceEip1559Query(networkId, { enabled: isAppReady });
    const gasPrice = ethGasPriceEip1559Query.isSuccess ? ethGasPriceEip1559Query.data.proposeGasPrice ?? null : null;

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, { enabled: isAppReady });
    const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
    const ethRate = get(exchangeRates, SYNTHS_MAP.sETH, null);

    const approveSpenderQuery = useApproveSpender(networkId, {
        enabled: false,
    });

    const quoteQuery = useQuoteTokensQuery(
        networkId,
        fromToken,
        toToken,
        ethers.utils.parseUnits(amount ? amount.toString() : '0', fromToken.decimals),
        { enabled: false }
    );

    const swapQuery = useSwapTokenQuery(
        networkId,
        fromToken,
        toToken,
        walletAddress ? walletAddress : '',
        ethers.utils.parseUnits(amount ? amount.toString() : '0', fromToken.decimals),
        {
            enabled: false,
        }
    );

    useEffect(() => {
        if (fromToken && Number(amount) > 0) {
            setShowSceleton(true);
            quoteQuery.refetch().then((resp) => {
                setPreviewData(resp.data as any);
                setShowSceleton(false);
            });
        } else if (fromToken) {
            Number(amount) !== 0 ? setAmount('') : '';
            setPreviewData(undefined);
            setShowSceleton(false);
        }
    }, [fromToken, amount]);

    useEffect(() => {
        isL2
            ? (setPreLoadTokens([OP_Eth, OP_Dai, OP_USDC, OP_USDT]), _setToToken(OP_sUSD))
            : (setPreLoadTokens([ETH_Eth, ETH_Dai, ETH_USDC, ETH_USDT]), _setToToken(ETH_sUSD));
    }, [networkId]);

    useEffect(() => {
        updateBalanceAndAllowance(fromToken);
    }, [fromToken, amount, isAllowing]);

    const updateBalanceAndAllowance = async (token: any) => {
        if (token) {
            if (token === ETH_Eth || token === OP_Eth) {
                setAllowance(true);
                signer
                    .getBalance()
                    .then((data: any) => setBalance(ethers.utils.formatUnits(data, (token as any).decimals)));
            } else {
                const erc20Instance = new ethers.Contract((token as any).address, erc20Contract.abi, signer);

                const spender = await approveSpenderQuery.refetch().then((resp: any) => {
                    return resp.data.address;
                });

                const parsedAmount = ethers.utils.parseEther(Number(amount).toString());
                const allowance = await checkAllowance(parsedAmount, erc20Instance, walletAddress, spender as string);
                setAllowance(allowance);

                erc20Instance
                    .balanceOf(walletAddress)
                    .then((data: any) => setBalance(ethers.utils.formatUnits(data, (token as any).decimals)));
            }
        }
    };

    const approve = async (approveAmount: BigNumber) => {
        const erc20Instance = new ethers.Contract((fromToken as any).address, erc20Contract.abi, signer);
        try {
            setIsAllowing(true);
            setLoading(true);
            const req = await approveSpenderQuery.refetch();
            const tx = await erc20Instance.approve(req.data?.address, approveAmount);
            setOpenApprovalModal(false);
            await tx.wait();
            setLoading(false);
            setIsAllowing(false);
            return {
                data: (req.data as any).data,
                to: (req.data as any).to,
            };
        } catch (e) {
            console.log('failed: ', e);
            setIsAllowing(false);
        }
    };

    const swapTx = async () => {
        setLoading(true);
        try {
            const req = await swapQuery.refetch();
            if (req.isSuccess) {
                const data = req.data as any;
                const transactionData = {
                    data: data.tx.data,
                    from: data.tx.from,
                    to: data.tx.to,
                    value: BigNumber.from(data.tx.value).toHexString(),
                };
                const tx = await signer.sendTransaction(transactionData);
                await tx.wait();
                refetchUserBalance(walletAddress as any, networkId);
                setLoading(false);
                dispatchMarketNotification(t('options.swap.tx-success'));
                return {
                    data: (data as any).tx.data,
                    from: (data as any).tx.from,
                    to: (data as any).tx.to,
                    value:
                        Number((data as any).tx.value) > 0
                            ? ethers.utils.parseUnits(amount.toString(), fromToken.decimals)
                            : undefined,
                };
            }
        } catch (e: any) {
            setLoading(false);
            setTxErrorMessage(e.code === 4001 ? t('options.swap.tx-user-rejected') : t('options.swap.tx-failed'));
            console.log('failed: ', e);
        }
    };

    const getButton = (royaleTheme: boolean) => {
        if (!fromToken)
            return (
                <SwapDialog.ConfirmButton royaleTheme={royaleTheme} disabled={true} className="disabled primary">
                    {t('options.swap.select-token')}
                </SwapDialog.ConfirmButton>
            );

        if (fromToken && !allowance)
            return (
                <SwapDialog.ConfirmButton
                    royaleTheme={royaleTheme}
                    disabled={!fromToken || isAllowing}
                    className={!fromToken || isAllowing ? 'disabled primary' : 'primary'}
                    onClick={() => setOpenApprovalModal(true)}
                >
                    {t('options.swap.approve', { currency: (fromToken as any).symbol })}
                </SwapDialog.ConfirmButton>
            );

        if (fromToken && allowance && Number(amount) <= 0)
            return (
                <SwapDialog.ConfirmButton royaleTheme={royaleTheme} className="disabled primary" disabled={true}>
                    {t('options.swap.enter-amount')}
                </SwapDialog.ConfirmButton>
            );

        if (fromToken && allowance && Number(amount) > 0)
            return (
                <SwapDialog.ConfirmButton
                    royaleTheme={royaleTheme}
                    className={Number(amount) > Number(balance) ? 'disabled primary' : 'primary'}
                    onClick={async () => {
                        await swapTx();
                        updateBalanceAndAllowance(fromToken);
                        handleClose(this, false);
                    }}
                    disabled={Number(amount) > Number(balance)}
                >
                    {Number(amount) > Number(balance) ? t('options.swap.insufficient-balance') : t('options.swap.swap')}
                </SwapDialog.ConfirmButton>
            );
    };

    return (
        <OutsideClickHandler onOutsideClick={handleClose.bind(this, false)}>
            {networkId !== 1 && networkId !== 10 ? (
                <SwapDialog
                    royaleTheme={royaleTheme}
                    contentType="unsupported"
                    className={theme == 0 ? 'light' : 'dark'}
                >
                    <SwapDialog.CloseButton royaleTheme={royaleTheme} onClick={handleClose.bind(this, false)} />{' '}
                    <SwapDialog.ErrorMessage royaleTheme={royaleTheme}>
                        {t('options.swap.not-supported')}
                    </SwapDialog.ErrorMessage>
                </SwapDialog>
            ) : (
                <SwapDialog
                    royaleTheme={royaleTheme}
                    contentType={` ${isLoading ? 'loading' : ''} ${txErrorMessage !== null ? 'error' : ''}`}
                    className={theme == 0 ? 'light' : 'dark'}
                >
                    <SwapDialog.CloseButton royaleTheme={royaleTheme} onClick={handleClose.bind(this, false)} />
                    <SwapDialog.SectionWrapper royaleTheme={royaleTheme}>
                        <FlexDivRowCentered>
                            <SwapDialog.Text royaleTheme={royaleTheme}>{t('options.swap.from')}:</SwapDialog.Text>
                            <FlexDivRow>
                                <SwapDialog.Text
                                    royaleTheme={royaleTheme}
                                    style={{ alignSelf: 'center', marginRight: 5, cursor: 'pointer' }}
                                    onClick={() => {
                                        setAmount(Number(Number(balance).toFixed(4)).toString());
                                    }}
                                >
                                    {t('options.swap.balance')}: {Number(balance).toFixed(4)}
                                </SwapDialog.Text>
                                <SwapDialog.MaxButton
                                    royaleTheme={royaleTheme}
                                    onClick={() => {
                                        setAmount(Number(Number(balance).toFixed(4)).toString());
                                    }}
                                >
                                    {t('options.swap.max')}
                                </SwapDialog.MaxButton>
                            </FlexDivRow>
                        </FlexDivRowCentered>
                        <FlexDivRowCentered>
                            <SwapDialog.TokenSelect
                                royaleTheme={royaleTheme}
                                options={preLoadTokens}
                                formatOptionLabel={(option: any) => {
                                    return (
                                        <FlexDivRowCentered>
                                            <SwapDialog.TokenLogo src={option.logoURI}></SwapDialog.TokenLogo>
                                            <FlexDivColumnCentered>
                                                <SwapDialog.Text
                                                    screenWidth={window.innerWidth}
                                                    royaleTheme={royaleTheme}
                                                    contentSize="large"
                                                >
                                                    {option.name}
                                                </SwapDialog.Text>
                                                <SwapDialog.Text royaleTheme={royaleTheme} contentSize="large">
                                                    {option.symbol}
                                                </SwapDialog.Text>
                                            </FlexDivColumnCentered>
                                        </FlexDivRowCentered>
                                    );
                                }}
                                value={fromToken}
                                onChange={(option: any) => {
                                    _setFromToken(option);
                                }}
                            ></SwapDialog.TokenSelect>

                            <SwapDialog.NumInput
                                royaleTheme={royaleTheme}
                                screenWidth={window.innerWidth}
                                placeholder="0"
                                value={amount !== '' ? Number(amount) : ''}
                                onChange={(_: any, value: any) => {
                                    setAmount(value);
                                }}
                            ></SwapDialog.NumInput>
                        </FlexDivRowCentered>
                    </SwapDialog.SectionWrapper>
                    <SwapDialog.SceletonWrapper royaleTheme={royaleTheme} className={showSceleton ? 'visible' : ''}>
                        <FlexDivRowCentered>
                            <SwapDialog.TextSceleton royaleTheme={royaleTheme} contentType="small" />
                            <SwapDialog.TextSceleton royaleTheme={royaleTheme} contentType="large" />
                        </FlexDivRowCentered>
                        <FlexDivRowCentered>
                            <FlexDivCentered>
                                <SwapDialog.ImageSceleton royaleTheme={royaleTheme} />
                                <SwapDialog.TextSceleton royaleTheme={royaleTheme} contentType="medium" />
                            </FlexDivCentered>
                            <SwapDialog.TextSceleton royaleTheme={royaleTheme} contentType="medium" />
                        </FlexDivRowCentered>
                    </SwapDialog.SceletonWrapper>
                    <SwapDialog.SectionWrapper royaleTheme={royaleTheme} className={showSceleton ? 'hide' : ''}>
                        <FlexDivRowCentered>
                            <SwapDialog.Text royaleTheme={royaleTheme}>{t('options.swap.to')}:</SwapDialog.Text>
                            <SwapDialog.Text royaleTheme={royaleTheme}>
                                {t('options.swap.estimated-gas')}:{' '}
                                {previewData
                                    ? formatCurrencyWithSign(
                                          USD_SIGN,
                                          getTransactionPrice(
                                              gasPrice,
                                              Number((previewData as any).estimatedGas),
                                              ethRate
                                          )
                                      )
                                    : 'n/a'}
                            </SwapDialog.Text>
                        </FlexDivRowCentered>
                        <FlexDivRowCentered>
                            <SwapDialog.TokenSelect
                                royaleTheme={royaleTheme}
                                options={preLoadTokens}
                                formatOptionLabel={(option: any) => {
                                    return (
                                        <FlexDivRowCentered>
                                            <SwapDialog.TokenLogo src={option.logoURI}></SwapDialog.TokenLogo>
                                            <FlexDivColumnCentered>
                                                <SwapDialog.Text royaleTheme={royaleTheme} contentSize="large">
                                                    {option.name}
                                                </SwapDialog.Text>
                                                <SwapDialog.Text royaleTheme={royaleTheme} contentSize="large">
                                                    {option.symbol}
                                                </SwapDialog.Text>
                                            </FlexDivColumnCentered>
                                        </FlexDivRowCentered>
                                    );
                                }}
                                isDisabled={true}
                                value={toToken}
                                onChange={(option: any) => {
                                    _setToToken(option);
                                }}
                            ></SwapDialog.TokenSelect>
                            <SwapDialog.NumericText royaleTheme={royaleTheme}>
                                {previewData
                                    ? Number(
                                          ethers.utils.formatUnits(
                                              (previewData as any).toTokenAmount,
                                              (previewData as any).toToken.decimals
                                          )
                                      ).toFixed(4)
                                    : 'n/a'}
                            </SwapDialog.NumericText>
                        </FlexDivRowCentered>
                    </SwapDialog.SectionWrapper>
                    {getButton(royaleTheme)}
                    {isLoading && (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    )}
                    <ValidationMessage
                        showValidation={txErrorMessage !== null}
                        message={txErrorMessage}
                        onDismiss={() => setTxErrorMessage(null)}
                    />

                    {openApprovalModal && (
                        <ApprovalModal
                            defaultAmount={amount}
                            tokenSymbol={fromToken.symbol}
                            isAllowing={isAllowing}
                            onSubmit={approve}
                            onClose={() => setOpenApprovalModal(false)}
                            isRoyale={royaleTheme}
                        />
                    )}
                </SwapDialog>
            )}
        </OutsideClickHandler>
    );
};

export default Swap;

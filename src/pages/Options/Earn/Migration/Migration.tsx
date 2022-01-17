import ValidationMessage from 'components/ValidationMessage';
import { ethers } from 'ethers';
import {
    CurrencyLabel,
    DefaultSubmitButton,
    Divider,
    InputContainer,
    InputLabel,
    SubmitButtonContainer,
} from 'pages/Options/Market/components';
import NumericInput from 'pages/Options/Market/components/NumericInput';
import React, { useEffect, useMemo, useState } from 'react';
import { dispatchMarketNotification } from 'utils/options';
import snxJSConnector from 'utils/snxJSConnector';
import { useTranslation } from 'react-i18next';
import { getIsWalletConnected, getNetwork, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { bigNumberFormatter, getAddress } from 'utils/formatters/ethers';
import { APPROVAL_EVENTS } from 'constants/events';
import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import { formatGasLimit, NetworkId, SUPPORTED_NETWORKS_NAMES } from 'utils/network';
import onboardConnector from 'utils/onboardConnector';
import { THALES_CURRENCY } from 'constants/currency';
import NetworkFees from 'pages/Options/components/NetworkFees';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivCentered, FlexDivRowCentered, FlexDiv } from 'theme/common';
import { L1_TO_L2_NETWORK_MAPPER } from 'constants/network';
import { ReactComponent as ArrowDown } from 'assets/images/arrow-down-blue.svg';
import useThalesBalanceQuery from 'queries/walletBalances/useThalesBalanceQuery';
import { getIsAppReady } from 'redux/modules/app';
import { formatCurrencyWithKey, truncToDecimals } from 'utils/formatters/number';

const Migration: React.FC = () => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const network = useSelector((state: RootState) => getNetwork(state));
    const [amount, setAmount] = useState<number | string>('');
    const [thalesBalance, setThalesBalance] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [gasLimit, setGasLimit] = useState<number | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>('migrate');

    const isAmountEntered = Number(amount) > 0;
    const insufficientBalance = Number(thalesBalance) < Number(amount) || Number(thalesBalance) === 0;

    const isButtonDisabled = isSubmitting || !isWalletConnected || !isAmountEntered || insufficientBalance;

    const thalesBalanceQuery = useThalesBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (thalesBalanceQuery.isSuccess && thalesBalanceQuery.data) {
            setThalesBalance(Number(thalesBalanceQuery.data.balance));
        }
    }, [thalesBalanceQuery.isSuccess, thalesBalanceQuery.data]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const optionsTabContent: Array<{
        id: string;
        name: string;
    }> = useMemo(
        () => [
            {
                id: 'migrate',
                name: t(`migration.tabs.migrate`),
            },
            {
                id: 'withdraw',
                name: t(`migration.tabs.withdraw`),
            },
            {
                id: 'swap',
                name: t(`migration.tabs.swap`),
            },
        ],
        [t]
    );

    useEffect(() => {
        const { thalesTokenContract, thalesExchangerContract } = snxJSConnector as any;

        if (thalesTokenContract && thalesExchangerContract) {
            const thalesTokenContractWithSigner = thalesTokenContract.connect((snxJSConnector as any).signer);
            const addressToApprove = thalesExchangerContract.address;

            const getAllowance = async () => {
                try {
                    const allowance = await thalesTokenContractWithSigner.allowance(walletAddress, addressToApprove);
                    setAllowance(!!bigNumberFormatter(allowance));
                } catch (e) {
                    console.log(e);
                }
            };

            const registerAllowanceListener = () => {
                thalesTokenContractWithSigner.on(APPROVAL_EVENTS.APPROVAL, (owner: string, spender: string) => {
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
                thalesTokenContractWithSigner.removeAllListeners(APPROVAL_EVENTS.APPROVAL);
            };
        }
    }, [walletAddress, isWalletConnected, hasAllowance]);

    useEffect(() => {
        const fetchGasLimit = async () => {
            const { thalesExchangerContract } = snxJSConnector as any;

            if (thalesExchangerContract) {
                try {
                    const thalesExchangerContractWithSigner = thalesExchangerContract.connect(
                        (snxJSConnector as any).signer
                    );
                    const parsedAmount = ethers.utils.parseEther(amount.toString());
                    const gasEstimate = await thalesExchangerContractWithSigner.estimateGas.exchangeThalesToL2OpThales(
                        parsedAmount
                    );
                    setGasLimit(formatGasLimit(gasEstimate, networkId));
                } catch (e) {
                    console.log(e);
                    setGasLimit(null);
                }
            }
        };
        if (isButtonDisabled) return;
        fetchGasLimit();
    }, [isButtonDisabled, amount, hasAllowance, walletAddress]);

    const handleAllowance = async () => {
        const { thalesTokenContract, thalesExchangerContract } = snxJSConnector as any;

        if (thalesTokenContract && thalesExchangerContract) {
            const thalesTokenContractWithSigner = thalesTokenContract.connect((snxJSConnector as any).signer);
            const addressToApprove = thalesExchangerContract.address;

            try {
                setIsAllowing(true);
                const gasEstimate = await thalesTokenContractWithSigner.estimateGas.approve(
                    addressToApprove,
                    ethers.constants.MaxUint256
                );
                const tx = (await thalesTokenContractWithSigner.approve(addressToApprove, ethers.constants.MaxUint256, {
                    gasLimit: formatGasLimit(gasEstimate, networkId),
                })) as ethers.ContractTransaction;

                const txResult = await tx.wait();
                if (txResult && txResult.transactionHash) {
                    setAllowance(true);
                    setIsAllowing(false);
                }
            } catch (e) {
                console.log(e);
                setTxErrorMessage(t('common.errors.unknown-error-try-again'));
                setIsAllowing(false);
            }
        }
    };

    const handleSubmit = async () => {
        setTxErrorMessage(null);
        setIsSubmitting(true);

        try {
            const { thalesExchangerContract } = snxJSConnector as any;
            const thalesExchangerContractWithSigner = thalesExchangerContract.connect((snxJSConnector as any).signer);

            const parsedAmount = ethers.utils.parseEther(amount.toString());
            const tx = await thalesExchangerContractWithSigner.exchangeThalesToL2OpThales(parsedAmount);
            const txResult = await tx.wait();

            if (txResult && txResult.transactionHash) {
                dispatchMarketNotification(t('migration.migration-confirmation-message'));
                setIsSubmitting(false);
            }
        } catch (e) {
            console.log(e);
            setTxErrorMessage(t('common.errors.unknown-error-try-again'));
            setIsSubmitting(false);
        }
    };

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <DefaultSubmitButton onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </DefaultSubmitButton>
            );
        }
        if (insufficientBalance) {
            return <DefaultSubmitButton disabled={true}>{t(`common.errors.insufficient-balance`)}</DefaultSubmitButton>;
        }
        if (!isAmountEntered) {
            return <DefaultSubmitButton disabled={true}>{t(`common.errors.enter-amount`)}</DefaultSubmitButton>;
        }
        if (!hasAllowance) {
            return (
                <DefaultSubmitButton disabled={isAllowing} onClick={handleAllowance}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: THALES_CURRENCY })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: THALES_CURRENCY,
                          })}
                </DefaultSubmitButton>
            );
        }
        return (
            <DefaultSubmitButton disabled={isButtonDisabled || !gasLimit} onClick={handleSubmit}>
                {!isSubmitting ? t('migration.migration-button.label') : t('migration.migration-button.progress-label')}
            </DefaultSubmitButton>
        );
    };

    const onMaxClick = () => {
        setAmount(truncToDecimals(thalesBalance));
    };

    return (
        <Wrapper>
            <Container>
                <OptionsTabContainer>
                    {optionsTabContent.map((tab, index) => (
                        <OptionsTab
                            isActive={tab.id === selectedTab}
                            key={index}
                            index={index}
                            onClick={() => {
                                setSelectedTab(tab.id);
                            }}
                            className={`${tab.id === selectedTab ? 'selected' : ''}`}
                        >
                            {tab.name}
                        </OptionsTab>
                    ))}
                </OptionsTabContainer>
                <InputContainer>
                    <NumericInput value={amount} onChange={(_, value) => setAmount(value)} />
                    <InputLabel>
                        {t('migration.from-label')}
                        <NetworkLabel>{network.networkName}</NetworkLabel>
                    </InputLabel>
                    <CurrencyLabel>{THALES_CURRENCY}</CurrencyLabel>
                    <ThalesWalletAmountLabel>
                        {formatCurrencyWithKey(THALES_CURRENCY, thalesBalance)}
                        <MaxButton>
                            <InnerButton onClick={onMaxClick}>{t('common.max')}</InnerButton>
                        </MaxButton>
                    </ThalesWalletAmountLabel>
                </InputContainer>
                <ArrowContainer>
                    <ArrowDown />
                </ArrowContainer>
                <MigrationResultContainer>
                    <MigrationResult>{amount}</MigrationResult>
                    <InputLabel>
                        {t('migration.to-label')}
                        <NetworkLabel>
                            {SUPPORTED_NETWORKS_NAMES[L1_TO_L2_NETWORK_MAPPER[networkId] as NetworkId]}
                        </NetworkLabel>
                    </InputLabel>
                    <CurrencyLabel>{THALES_CURRENCY}</CurrencyLabel>
                </MigrationResultContainer>
                <Divider />
                <NetworkFees gasLimit={gasLimit} disabled={isSubmitting} />
                <SubmitButtonContainer>{getSubmitButton()}</SubmitButtonContainer>
                <ValidationMessage
                    showValidation={txErrorMessage !== null}
                    message={txErrorMessage}
                    onDismiss={() => setTxErrorMessage(null)}
                />
            </Container>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumnCentered)`
    grid-column: span 10;
    align-items: center;
`;

const Container = styled(FlexDivColumn)`
    margin: 60px 10px 50px 10px;
    background: #04045a;
    box-shadow: -2px -2px 10px 4px rgba(100, 217, 254, 0.25), 2px 2px 10px 4px rgba(100, 217, 254, 0.25);
    border-radius: 30px;
    padding: 30px 60px 40px 60px;
    max-width: 500px;
    @media (max-width: 767px) {
        padding: 30px 20px 40px 20px;
    }
`;

const NetworkLabel = styled(InputLabel)`
    color: #00f9ff;
    padding: 0 0 0 4px;
    white-space: nowrap;
`;

const MigrationResultContainer = styled(InputContainer)`
    background: linear-gradient(190.01deg, #516aff -17.89%, #8208fc 90.41%);
    border-radius: 10px;
    padding: 1px;
`;

const MigrationResult = styled.div`
    background: #04045a;
    border-radius: 10px;
    border: none;
    height: 64px;
    padding: 31px 0 0 22px;
    font-size: 16px;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.25px;
    color: #f6f6fe;
    outline: none;
    user-select: none;
`;

const ArrowContainer = styled(FlexDivCentered)`
    margin-bottom: 15px;
    margin-top: -5px;
`;

const ThalesWalletAmountLabel = styled(InputLabel)`
    right: 0px;
    top: 0px;
    padding: 8px 14px 0 0;
`;

const MaxButton = styled(DefaultSubmitButton)`
    background: linear-gradient(190.01deg, #516aff -17.89%, #8208fc 90.41%);
    border: none;
    border-radius: 5px;
    width: 53px;
    min-height: 17px;
    text-transform: uppercase;
    padding: 1px;
    color: #f6f6fe;
    &:hover:not(:disabled) {
        cursor: pointer;
        background: #00f9ff;
        color: #00f9ff;
    }
    margin-left: 4px;
    pointer-events: auto;
`;

const InnerButton = styled(FlexDivRowCentered)`
    font-weight: bold;
    font-size: 10px;
    line-height: 15px;
    letter-spacing: 1px;
    text-transform: uppercase;
    background: #0a2e66;
    border-radius: 5px;
    text-align: center;
    padding-left: 12px;
    padding-right: 12px;
`;

const OptionsTabContainer = styled(FlexDiv)`
    margin-bottom: 40px;
`;

const OptionsTab = styled(FlexDivCentered)<{ isActive: boolean; index: number }>`
    font-weight: 600;
    font-size: 20px;
    line-height: 32px;
    letter-spacing: 0.5px;
    color: #748bc6;
    user-select: none;
    margin-left: 10px;
    margin-right: 20px;
    &.selected {
        transition: 0.2s;
        color: #00f9ff;
    }
    &:hover:not(.selected) {
        cursor: pointer;
        color: #f6f6fe;
    }
`;

export default Migration;

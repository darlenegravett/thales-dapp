import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { getIsAppReady } from 'redux/modules/app';
import snxJSConnector from 'utils/snxJSConnector';
import ValidationMessage from 'components/ValidationMessage/ValidationMessage';
import { ethers } from 'ethers';
import { StakingReward } from 'types/token';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP, THALES_CURRENCY } from 'constants/currency';
import { refetchTokenQueries, refetchUserTokenTransactions } from 'utils/queryConnector';
import { ButtonContainer, ClaimMessage, EarnSection, SectionHeader, StyledMaterialTooltip } from '../../components';
import { formatGasLimit, getIsOVM, getL1FeeInWei } from 'utils/network';
import NetworkFees from 'pages/Options/components/NetworkFees';
import { dispatchMarketNotification } from 'utils/options';
import TimeRemaining from 'pages/Options/components/TimeRemaining';
import {
    GridContainer,
    StakingRewardsContent,
    StakingRewardsItem,
    StakingRewardsLabel,
    GridAction,
    StakingRewardsNotice,
    StakingRewardsHeaderLabel,
    BonusInfo,
    BonusCurrent,
    BonusCurrentLabel,
    BonusCurrentContent,
    BonusNeeded,
    BonusNeededLabel,
    BonusNeededContent,
    MaxBonusNotice,
    BonusRewardButton,
    BonusRewardInnerButton,
} from '../../gridComponents';
import useStakingRewardsQuery from 'queries/token/useStakingRewardsQuery';
import { LINKS } from 'constants/links';
import { ReactComponent as InfoIcon } from 'assets/images/info-circle-blue.svg';
import styled from 'styled-components';
import SnxStakingTooltip from './components/SnxStakingTooltip';
import AmmTooltip from './components/AmmTooltip';
import ThalesRoyaleTooltip from './components/ThalesRoyaleTooltip';
import { DefaultSubmitButton } from 'pages/Options/Market/components';
import onboardConnector from 'utils/onboardConnector';

const StakingRewards: React.FC = () => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
    const [stakingRewards, setStakingRewards] = useState<StakingReward | undefined>(undefined);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isClosingPeriod, setIsClosingPeriod] = useState(false);
    const [gasLimit, setGasLimit] = useState<number | null>(null);
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const [l1Fee, setL1Fee] = useState<number | null>(null);
    const isL2 = getIsOVM(networkId);
    const { stakingThalesContract } = snxJSConnector as any;

    const stakingRewardsQuery = useStakingRewardsQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected && !!stakingThalesContract,
    });

    useEffect(() => {
        if (stakingRewardsQuery.isSuccess && stakingRewardsQuery.data) {
            setStakingRewards(stakingRewardsQuery.data);
        }
    }, [stakingRewardsQuery.isSuccess, stakingRewardsQuery.data]);

    const isClaimAvailable =
        stakingRewards &&
        stakingRewards.hasClaimRights &&
        !stakingRewards.claimed &&
        !stakingRewards.isClaimPaused &&
        isWalletConnected &&
        !!stakingThalesContract &&
        !isClaiming &&
        !isClosingPeriod;

    const isClosingPeriodAvailable = isWalletConnected && !!stakingThalesContract && !isClaiming && !isClosingPeriod;

    useEffect(() => {
        const fetchL1Fee = async (stakingThalesContractWithSigner: any) => {
            const txRequest = await stakingThalesContractWithSigner.populateTransaction.claimReward();
            return getL1FeeInWei(txRequest);
        };

        const fetchGasLimit = async () => {
            if (stakingRewards) {
                try {
                    const stakingThalesContractWithSigner = stakingThalesContract.connect(
                        (snxJSConnector as any).signer
                    );
                    if (isL2) {
                        const [gasEstimate, l1FeeInWei] = await Promise.all([
                            stakingThalesContractWithSigner.estimateGas.claimReward(),
                            fetchL1Fee(stakingThalesContractWithSigner),
                        ]);
                        setGasLimit(formatGasLimit(gasEstimate, networkId));
                        setL1Fee(l1FeeInWei);
                    } else {
                        const gasEstimate = await stakingThalesContractWithSigner.estimateGas.claimReward();
                        setGasLimit(formatGasLimit(gasEstimate, networkId));
                    }
                } catch (e) {
                    console.log(e);
                    setGasLimit(null);
                }
            }
        };
        if (!isClaimAvailable) return;
        fetchGasLimit();
    }, [walletAddress, isClaimAvailable]);

    const handleClaimStakingRewards = async () => {
        setShowTooltip(false);
        if (isClaimAvailable && stakingRewards) {
            try {
                setTxErrorMessage(null);
                setIsClaiming(true);
                const stakingThalesContractWithSigner = stakingThalesContract.connect((snxJSConnector as any).signer);
                const tx = (await stakingThalesContractWithSigner.claimReward()) as ethers.ContractTransaction;
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    dispatchMarketNotification(t('options.earn.thales-staking.staking-rewards.confirmation-message'));
                    refetchTokenQueries(walletAddress, networkId);
                    refetchUserTokenTransactions(walletAddress, networkId);
                    setIsClaiming(false);
                }
            } catch (e) {
                console.log(e);
                setTxErrorMessage(t('common.errors.unknown-error-try-again'));
                setIsClaiming(false);
            }
        }
    };

    const handleClosePeriod = async () => {
        if (stakingRewards && stakingRewards.canClosePeriod) {
            try {
                setTxErrorMessage(null);
                setIsClosingPeriod(true);
                const stakingThalesContractWithSigner = stakingThalesContract.connect((snxJSConnector as any).signer);
                const tx = (await stakingThalesContractWithSigner.closePeriod()) as ethers.ContractTransaction;
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    dispatchMarketNotification(
                        t('options.earn.thales-staking.staking-rewards.close-period.confirmation-message')
                    );
                    refetchTokenQueries(walletAddress, networkId);
                    setIsClosingPeriod(false);
                }
            } catch (e) {
                console.log(e);
                setTxErrorMessage(t('common.errors.unknown-error-try-again'));
                setIsClosingPeriod(false);
            }
        }
    };

    const getClaimButton = () => {
        if (!isWalletConnected) {
            return (
                <DefaultSubmitButton onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </DefaultSubmitButton>
            );
        }

        return (
            <StyledMaterialTooltip
                arrow
                title={t('options.earn.thales-staking.staking-rewards.button-tooltip') as string}
                open={showTooltip}
            >
                <DefaultSubmitButton
                    onMouseOver={() => {
                        setShowTooltip(true);
                    }}
                    onMouseOut={() => {
                        setShowTooltip(false);
                    }}
                    onClick={handleClaimStakingRewards}
                    disabled={!isClaimAvailable}
                >
                    {isClaiming
                        ? t('options.earn.thales-staking.staking-rewards.claiming') +
                          ` ${formatCurrencyWithKey(THALES_CURRENCY, rewards)}...`
                        : t('options.earn.thales-staking.staking-rewards.claim') +
                          ` ${formatCurrencyWithKey(THALES_CURRENCY, rewards)}`}
                </DefaultSubmitButton>
            </StyledMaterialTooltip>
        );
    };

    const rewards = isClaimAvailable && stakingRewards ? stakingRewards.rewards : 0;
    const baseRewards = isClaimAvailable && stakingRewards ? stakingRewards.baseRewards : 0;
    const snxBonus = isClaimAvailable && stakingRewards ? stakingRewards.snxBonus : 0;
    const ammBonus = isClaimAvailable && stakingRewards ? stakingRewards.ammBonus : 0;
    const thalesRoyaleBonus = isClaimAvailable && stakingRewards ? stakingRewards.thalesRoyaleBonus : 0;
    const maxSnxBonus = isClaimAvailable && stakingRewards ? stakingRewards.maxSnxBonus : 0;
    const maxAmmBonus = isClaimAvailable && stakingRewards ? stakingRewards.maxAmmBonus : 0;
    const maxThalesRoyaleBonus = isClaimAvailable && stakingRewards ? stakingRewards.maxThalesRoyaleBonus : 0;
    const maxSnxBonusPercentage = stakingRewards ? stakingRewards.maxSnxBonusPercentage : 0;
    const maxAmmBonusPercentage = stakingRewards ? stakingRewards.maxAmmBonusPercentage : 0;
    const maxThalesRoyaleBonusPercentage = stakingRewards ? stakingRewards.maxThalesRoyaleBonusPercentage : 0;
    const ammVolumeRewardsMultiplier = stakingRewards ? stakingRewards.ammVolumeRewardsMultiplier : 0;
    const snxVolumeRewardsMultiplier = stakingRewards ? stakingRewards.snxVolumeRewardsMultiplier : 0;
    const baseRewardsPool = stakingRewards ? stakingRewards.baseRewardsPool : 0;
    const bonusRewardsPool = stakingRewards ? stakingRewards.bonusRewardsPool : 0;
    const snxStaked = stakingRewards ? stakingRewards.snxStaked : 0;
    const ammVolume = stakingRewards ? stakingRewards.ammVolume : 0;

    const maxSnxStaked = baseRewards * snxVolumeRewardsMultiplier;
    const additionalSnxStaked = maxSnxStaked - snxStaked > 0 ? maxSnxStaked - snxStaked : 0;

    const maxAmmVolume = baseRewards * ammVolumeRewardsMultiplier;
    const additionalAmmVolume = maxAmmVolume - ammVolume > 0 ? maxAmmVolume - ammVolume : 0;

    const snxStakedMaxBonus = additionalSnxStaked === 0 && baseRewards > 0;
    const ammVolumeMaxBonus = additionalAmmVolume === 0 && baseRewards > 0;
    const participatedInRoyale = thalesRoyaleBonus > 0;

    return (
        <EarnSection
            orderOnMobile={3}
            orderOnTablet={3}
            style={{ gridColumn: 'span 10', gridRow: 'span 2', padding: 0, border: '0', background: 'transparent' }}
        >
            <SectionHeader>
                <div>{t('options.earn.thales-staking.staking-rewards.title')}</div>
                <div>
                    {t('options.earn.thales-staking.staking-rewards.period')}:{' '}
                    {stakingRewards ? (
                        <TimeRemaining end={stakingRewards.closingDate} fontSize={20} showFullCounter />
                    ) : (
                        '-'
                    )}
                    {stakingRewards && stakingRewards.canClosePeriod && (
                        <DefaultSubmitButton
                            onClick={handleClosePeriod}
                            disabled={!isClosingPeriodAvailable}
                            className="primary"
                            style={{ marginLeft: 10, padding: '6px 20px', minHeight: 0 }}
                        >
                            {isClosingPeriod
                                ? t('options.earn.thales-staking.staking-rewards.close-period.progress-label')
                                : t('options.earn.thales-staking.staking-rewards.close-period.label')}
                        </DefaultSubmitButton>
                    )}
                </div>
            </SectionHeader>
            <GridContainer>
                <StakingRewardsItem style={{ padding: 15 }}>
                    <StakingRewardsHeaderLabel>
                        {t('options.earn.thales-staking.staking-rewards.weekly-base-rewards')}
                    </StakingRewardsHeaderLabel>
                    <StakingRewardsNotice>
                        {formatCurrencyWithKey(THALES_CURRENCY, baseRewardsPool, 0, true)}
                    </StakingRewardsNotice>
                </StakingRewardsItem>
                <StakingRewardsItem style={{ gridColumn: 'span 9', padding: 15 }}>
                    <StakingRewardsHeaderLabel>
                        {t('options.earn.thales-staking.staking-rewards.weekly-bonus-rewards')}
                    </StakingRewardsHeaderLabel>
                    <StakingRewardsNotice>
                        {formatCurrencyWithKey(THALES_CURRENCY, bonusRewardsPool, 0, true)}
                    </StakingRewardsNotice>
                </StakingRewardsItem>
                <StakingRewardsItem>
                    <StakingRewardsLabel color="#64D9FE">
                        {t('options.earn.thales-staking.staking-rewards.thales-staking-label')}
                    </StakingRewardsLabel>
                    <StakingRewardsContent>{formatCurrencyWithKey(THALES_CURRENCY, baseRewards)}</StakingRewardsContent>
                </StakingRewardsItem>
                <StakingRewardsItem>
                    <StakingRewardsLabel color="linear-gradient(154.67deg, #1AAB9B 17.5%, #64D9FE 95.42%)">
                        {t('options.earn.thales-staking.staking-rewards.snx-staking-label')}
                        <StyledMaterialTooltip
                            arrow
                            interactive
                            title={
                                <SnxStakingTooltip
                                    maxPercentage={maxSnxBonusPercentage}
                                    snxVolumeRewardsMultiplier={snxVolumeRewardsMultiplier}
                                    snxStakedMaxBonus={snxStakedMaxBonus}
                                />
                            }
                        >
                            <BonusInfoIcon />
                        </StyledMaterialTooltip>
                    </StakingRewardsLabel>
                    <StakingRewardsNotice>
                        {t('options.earn.thales-staking.staking-rewards.max-reward-label', {
                            max: formatCurrencyWithKey(THALES_CURRENCY, maxSnxBonus),
                        })}
                    </StakingRewardsNotice>
                    <StakingRewardsContent>{formatCurrencyWithKey(THALES_CURRENCY, snxBonus)}</StakingRewardsContent>
                    <BonusInfo>
                        <BonusCurrent>
                            <BonusCurrentLabel>
                                {t('options.earn.thales-staking.staking-rewards.bonus-info.current-snx-staking-label')}:
                            </BonusCurrentLabel>
                            <BonusCurrentContent>
                                {formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.SNX, snxStaked)}
                            </BonusCurrentContent>
                        </BonusCurrent>
                        {additionalSnxStaked > 0 && (
                            <BonusNeeded>
                                <BonusNeededLabel>
                                    {t(
                                        'options.earn.thales-staking.staking-rewards.bonus-info.additional-snx-staking-label'
                                    )}
                                    :
                                </BonusNeededLabel>
                                <BonusNeededContent>
                                    {formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.SNX, additionalSnxStaked)}
                                </BonusNeededContent>
                            </BonusNeeded>
                        )}
                    </BonusInfo>
                    {snxStakedMaxBonus ? (
                        <MaxBonusNotice>
                            {t('options.earn.thales-staking.staking-rewards.bonus-info.max-bonus-notice')}
                        </MaxBonusNotice>
                    ) : (
                        <BonusRewardButton target="_blank" rel="noreferrer" href={LINKS.Token.Bonus.SnxStaking}>
                            <BonusRewardInnerButton>
                                {t('options.earn.thales-staking.staking-rewards.bonus-button.snx-staking-label')}
                            </BonusRewardInnerButton>
                        </BonusRewardButton>
                    )}
                </StakingRewardsItem>
                <StakingRewardsItem>
                    <StakingRewardsLabel color="linear-gradient(87.09deg, #FFB636 -1%, #F55C05 106%)">
                        {t('options.earn.thales-staking.staking-rewards.amm-label')}
                        <StyledMaterialTooltip
                            arrow
                            interactive
                            title={
                                <AmmTooltip
                                    maxPercentage={maxAmmBonusPercentage}
                                    ammVolumeRewardsMultiplier={ammVolumeRewardsMultiplier}
                                    ammVolumeMaxBonus={ammVolumeMaxBonus}
                                />
                            }
                        >
                            <BonusInfoIcon />
                        </StyledMaterialTooltip>
                    </StakingRewardsLabel>
                    <StakingRewardsNotice>
                        {t('options.earn.thales-staking.staking-rewards.max-reward-label', {
                            max: formatCurrencyWithKey(THALES_CURRENCY, maxAmmBonus),
                        })}
                    </StakingRewardsNotice>
                    <StakingRewardsContent>{formatCurrencyWithKey(THALES_CURRENCY, ammBonus)}</StakingRewardsContent>
                    <BonusInfo>
                        <BonusCurrent>
                            <BonusCurrentLabel>
                                {t('options.earn.thales-staking.staking-rewards.bonus-info.current-amm-label')}:
                            </BonusCurrentLabel>

                            <BonusCurrentContent>
                                {formatCurrencyWithKey(SYNTHS_MAP.sUSD, ammVolume)}
                            </BonusCurrentContent>
                        </BonusCurrent>
                        {additionalAmmVolume > 0 && (
                            <BonusNeeded>
                                <BonusNeededLabel>
                                    {t('options.earn.thales-staking.staking-rewards.bonus-info.additional-amm-label')}:
                                </BonusNeededLabel>
                                <BonusNeededContent>
                                    {formatCurrencyWithKey(SYNTHS_MAP.sUSD, additionalAmmVolume)}
                                </BonusNeededContent>
                            </BonusNeeded>
                        )}
                    </BonusInfo>
                    {ammVolumeMaxBonus ? (
                        <MaxBonusNotice>
                            {t('options.earn.thales-staking.staking-rewards.bonus-info.max-bonus-notice')}
                        </MaxBonusNotice>
                    ) : (
                        <BonusRewardButton target="_blank" rel="noreferrer" href={LINKS.Token.Bonus.AMM}>
                            <BonusRewardInnerButton>
                                {t('options.earn.thales-staking.staking-rewards.bonus-button.amm-label')}
                            </BonusRewardInnerButton>
                        </BonusRewardButton>
                    )}
                </StakingRewardsItem>
                <StakingRewardsItem>
                    <StakingRewardsLabel color="linear-gradient(87.09deg, #9AB676 -1%, #0F803C 106.68%)">
                        {t('options.earn.thales-staking.staking-rewards.thales-royale-label')}
                        <StyledMaterialTooltip
                            arrow
                            interactive
                            title={
                                <ThalesRoyaleTooltip
                                    maxPercentage={maxThalesRoyaleBonusPercentage}
                                    participatedInRoyale={participatedInRoyale}
                                />
                            }
                        >
                            <BonusInfoIcon />
                        </StyledMaterialTooltip>
                    </StakingRewardsLabel>
                    <StakingRewardsNotice>
                        {t('options.earn.thales-staking.staking-rewards.max-reward-label', {
                            max: formatCurrencyWithKey(THALES_CURRENCY, maxThalesRoyaleBonus),
                        })}
                    </StakingRewardsNotice>
                    <StakingRewardsContent>
                        {formatCurrencyWithKey(THALES_CURRENCY, thalesRoyaleBonus)}
                    </StakingRewardsContent>
                    <BonusInfo>
                        <BonusCurrent>
                            <BonusCurrentLabel>
                                {t(
                                    'options.earn.thales-staking.staking-rewards.bonus-info.current-thales-royale-label'
                                )}
                                :
                            </BonusCurrentLabel>
                            <BonusCurrentContent>
                                {t(
                                    `options.earn.thales-staking.staking-rewards.bonus-info.thales-royale-participation-${
                                        participatedInRoyale ? 'yes' : 'no'
                                    }`
                                )}
                            </BonusCurrentContent>
                        </BonusCurrent>
                    </BonusInfo>
                    {participatedInRoyale ? (
                        <MaxBonusNotice>
                            {t('options.earn.thales-staking.staking-rewards.bonus-info.max-bonus-notice')}
                        </MaxBonusNotice>
                    ) : (
                        <BonusRewardButton target="_blank" rel="noreferrer" href={LINKS.Token.Bonus.ThalesRoyale}>
                            <BonusRewardInnerButton>
                                {t('options.earn.thales-staking.staking-rewards.bonus-button.thales-royale-label')}
                            </BonusRewardInnerButton>
                        </BonusRewardButton>
                    )}
                </StakingRewardsItem>
                <GridAction>
                    <NetworkFees gasLimit={gasLimit} disabled={isClaiming} l1Fee={l1Fee} />
                    <ButtonContainer>
                        {getClaimButton()}
                        {stakingRewards && stakingRewards.isClaimPaused && (
                            <ClaimMessage>
                                {t('options.earn.thales-staking.staking-rewards.paused-message')}
                            </ClaimMessage>
                        )}
                        {stakingRewards && !stakingRewards.isClaimPaused && stakingRewards.claimed && (
                            <ClaimMessage>
                                {t('options.earn.thales-staking.staking-rewards.claimed-message')}
                            </ClaimMessage>
                        )}
                        {stakingRewards &&
                            !stakingRewards.isClaimPaused &&
                            !stakingRewards.claimed &&
                            !stakingRewards.hasClaimRights && (
                                <ClaimMessage>
                                    {t('options.earn.thales-staking.staking-rewards.not-eligible-message')}
                                </ClaimMessage>
                            )}
                    </ButtonContainer>
                    <ValidationMessage
                        showValidation={txErrorMessage !== null}
                        message={txErrorMessage}
                        onDismiss={() => setTxErrorMessage(null)}
                    />
                </GridAction>
            </GridContainer>
        </EarnSection>
    );
};

const BonusInfoIcon = styled(InfoIcon)`
    min-width: 16px;
    min-height: 16px;
    margin-left: 4px;
    margin-bottom: -3px;
`;

export default StakingRewards;

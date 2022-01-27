import { ethers } from 'ethers';
import { OP_KOVAN_SUSD, OP_sUSD } from 'pages/Options/Home/Swap/tokens';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, Image, Text } from 'theme/common';
import erc20Contract from 'utils/contracts/erc20Contract';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { truncateAddress } from 'utils/formatters/string';
import { getIsOVM } from 'utils/network';
import snxJSConnector from 'utils/snxJSConnector';
import UserEditRoyaleDataDialog from '../../components/UserEditRoyaleDataDialog/UserEditRoyaleDataDialog';
import { signUp } from '../../getThalesRoyalData';
import { User, UserStatus } from '../../Queries/useRoyalePlayersQuery';
import useLatestRoyaleForUserInfo from './queries/useLastRoyaleForUserInfo';
import useUserRoyalQuery, { AnonimUser } from './queries/useUserRoyalQuery';

type UserCardProps = {
    selectedSeason: number;
};

export const UserCard: React.FC<UserCardProps> = ({ selectedSeason }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isL2 = getIsOVM(networkId);
    const userQuery = useUserRoyalQuery(walletAddress as any, networkId, selectedSeason, {
        enabled: isL2 && isAppReady,
    });
    const user = userQuery.isSuccess ? userQuery.data : AnonimUser;
    const royaleQuery = useLatestRoyaleForUserInfo(selectedSeason, { enabled: isL2 && isAppReady });
    const royaleData = royaleQuery.isSuccess ? royaleQuery.data : {};

    const [allowance, setAllowance] = useState(false);
    const [balance, setBalance] = useState('0');
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const buyInToken = isL2 ? (networkId === 10 ? OP_sUSD : OP_KOVAN_SUSD) : '';
    const truncateAddressNumberOfCharacters = window.innerWidth < 768 ? 2 : 5;

    useEffect(() => {
        if (selectedSeason !== 0) {
            royaleQuery.remove();
            userQuery.remove();
        }
    }, [selectedSeason]);

    const updateBalanceAndAllowance = async (token: any) => {
        if (token) {
            const erc20Instance = new ethers.Contract((token as any).address, erc20Contract.abi, snxJSConnector.signer);
            const { thalesRoyaleContract } = snxJSConnector;
            if (thalesRoyaleContract) {
                try {
                    const allowance = await erc20Instance.allowance(walletAddress, thalesRoyaleContract.address);
                    setAllowance(!!bigNumberFormatter(allowance));
                } catch (e) {
                    console.log(e);
                }

                try {
                    const balance = await erc20Instance.balanceOf(walletAddress);
                    setBalance(ethers.utils.formatUnits(balance, (token as any).decimals));
                } catch (e) {
                    console.log(e);
                }
            }
        }
    };

    const approve = async () => {
        const erc20Instance = new ethers.Contract(
            (buyInToken as any).address,
            erc20Contract.abi,
            snxJSConnector.signer
        );
        try {
            const { thalesRoyaleContract } = snxJSConnector;
            if (thalesRoyaleContract) {
                const tx = await erc20Instance.approve(thalesRoyaleContract.address, ethers.constants.MaxUint256);
                await tx.wait();
                setAllowance(true);
            }
        } catch (e) {
            console.log('failed: ', e);
        }
    };

    useEffect(() => {
        if (buyInToken && snxJSConnector.signer) updateBalanceAndAllowance(buyInToken).then();
    }, [buyInToken, snxJSConnector.signer]);

    const getFooter = (user: User | undefined, royaleData: any) => {
        if (!royaleData) return;
        if (!user) return;
        if (royaleData.season === selectedSeason) {
            if (royaleData.signUpPeriod > new Date()) {
                if (walletAddress && !user) {
                    if (allowance) {
                        const buyInAmount = royaleData.buyInAmount;
                        return (
                            <Button disabled={buyInAmount > Number(balance)} onClick={signUp}>
                                {t('options.royale.scoreboard.buy-in', { buyInAmount })}
                            </Button>
                        );
                    } else {
                        return (
                            <Button
                                onClick={async () => {
                                    await approve();
                                    updateBalanceAndAllowance(buyInToken);
                                }}
                            >
                                {t('options.royale.scoreboard.approve-susd')}
                            </Button>
                        );
                    }
                } else if (user) {
                    if (user.status === UserStatus.NOTSIGNED) {
                        if (allowance) {
                            const buyInAmount = royaleData.buyInAmount;
                            return (
                                <Button disabled={buyInAmount > Number(balance)} onClick={signUp}>
                                    {t('options.royale.scoreboard.buy-in', { buyInAmount })}
                                </Button>
                            );
                        } else {
                            return (
                                <Button
                                    onClick={async () => {
                                        await approve();
                                        updateBalanceAndAllowance(buyInToken);
                                    }}
                                >
                                    {t('options.royale.scoreboard.approve-susd')}
                                </Button>
                            );
                        }
                    }
                } else {
                    return <Text>Please connect your wallet to compete</Text>;
                }
            } else {
                if (user) {
                    if (user.status === UserStatus.RDY) {
                        if (user.isAlive) {
                            return <></>;
                        } else {
                            return (
                                <DeadText>
                                    <span>{t('options.royale.footer.you-were-eliminated-in')}</span>
                                    <span>
                                        {` ${t('options.royale.footer.rd')} `}
                                        {user.deathRound}
                                    </span>
                                </DeadText>
                            );
                        }
                    }
                }
                if (royaleData)
                    if (royaleData.seasonFinished || (!royaleData.seasonStarted && !royaleData.canStartNewSeason)) {
                        return (
                            <DeadText>
                                <i className="icon icon--clock" style={{ paddingRight: 10 }}></i>
                                {t('options.royale.scoreboard.season-finished')}
                            </DeadText>
                        );
                    } else {
                        return (
                            <DeadText>
                                <i className="icon icon--clock" style={{ paddingRight: 10 }}></i>
                                {t('options.royale.scoreboard.period-expired')}
                            </DeadText>
                        );
                    }
            }
        }
    };

    return (
        <UserWrapper>
            {!openEditDialog ?? (
                <OverlayForDropDown
                    onClick={() => {
                        if (openEditDialog) setOpenEditDialog(false);
                    }}
                ></OverlayForDropDown>
            )}

            <UserEditRoyaleDataDialog
                open={openEditDialog}
                handleClose={setOpenEditDialog.bind(this, false)}
                user={user}
                walletAddress={walletAddress}
            ></UserEditRoyaleDataDialog>
            <FlexDiv style={{ alignItems: 'center' }}>
                {user?.avatar ? (
                    <UserAvatar src={user.avatar} style={{ marginRight: 14 }} />
                ) : (
                    <i className="icon icon--user-avatar" style={{ fontSize: 44, marginRight: 14 }} />
                )}

                <UserLabel>
                    <Trans
                        i18nKey="options.royale.scoreboard.player-no"
                        components={{ sans: <span style={{ fontFamily: 'sans-serif !important' }} /> }}
                    />

                    {' #'}
                    {user?.number}
                </UserLabel>
            </FlexDiv>
            <FlexDivColumn style={{ margin: '20px 0' }}>
                <FlexContainer>
                    <UserLabel>{t('options.leaderboard.display-name')}:</UserLabel>
                    <InputWrapper>
                        {user.name}
                        <SearchIcon
                            onClick={setOpenEditDialog.bind(this, true)}
                            className="icon icon--user-avatar"
                            style={{
                                position: 'relative',
                                cursor: 'pointer',
                                top: '3.5px',
                                float: 'right',
                                marginTop: 'auto',
                                marginBottom: 'auto',
                                marginRight: '-5px',
                            }}
                        />
                    </InputWrapper>
                </FlexContainer>
                <FlexContainer>
                    <UserLabel>{t('options.leaderboard.address')}:</UserLabel>
                    <InputWrapper>
                        {truncateAddress(
                            walletAddress as any,
                            truncateAddressNumberOfCharacters,
                            truncateAddressNumberOfCharacters
                        )}
                    </InputWrapper>
                </FlexContainer>
            </FlexDivColumn>
            {getFooter(user, royaleData)}
        </UserWrapper>
    );
};

const UserAvatar = styled(Image)<{ winner?: boolean }>`
    width: 44px;
    height: 44px;
    border-radius: 50%50%;
    border: ${(props) => (props.winner ? '2px solid #FFE489' : 'none')};
    filter: ${(props) => (props.winner ? 'drop-shadow(0px 0px 15px rgba(255, 232, 155, 0.7))' : 'none')};
    @media (max-width: 1024px) {
        width: 40px;
        height: 40px;
    }
`;

const OverlayForDropDown = styled.div`
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
`;

const DeadText = styled(Text)`
    font-family: Sansation !important;
    font-style: normal;
    font-weight: bold;
    font-size: 23px;
    line-height: 26px;
    color: var(--color);
    text-shadow: 0px 0px 30px var(--color);
    text-align: center;
`;

const UserWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 295px;
    width: 100%;
    padding: 34px 70px;
    background: var(--color-wrapper);
    border: 5px solid var(--color);
    box-sizing: border-box;
    border-radius: 5px;
    margin-top: 14px;
    margin-bottom: 50px;
    @media (max-width: 1024px) {
        padding: 15px;
        height: auto;
    }
`;

const UserLabel = styled.p`
    font-family: Sansation !important;
    font-style: normal;
    font-size: 20px;
    color: var(--color);
`;

const Button = styled.button`
    align-items: center;
    cursor: pointer;
    display: flex;
    font-family: Sansation !important;
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 22px;
    background: var(--color);
    border: 1px solid var(--color);
    box-sizing: border-box;
    box-shadow: 0px 0px 30px var(--color);
    border-radius: 20px;
    padding: 6px 15px 6px 20px;
    color: var(--color-wrapper);
    margin: auto;
    &.disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const SearchIcon = styled.i`
    position: absolute;
    right: 10px;
    top: 4px;
    font-size: 17px;
    line-height: 20px;
    min-width: 17px !important;
`;

const InputWrapper = styled.div`
    width: 220px;
    border: 1.30233px solid var(--color);
    box-sizing: border-box;
    border-radius: 19.5349px;
    height: 28px;
    white-space: nowrap;
    overflow: hidden;
    font-family: Sansation !important;
    font-style: normal;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
    letter-spacing: -0.4px;
    color: var(--color);
    text-overflow: ellipsis;
    @media (max-width: 1024px) {
        width: 150px;
    }
`;

const FlexContainer = styled(FlexDivCentered)`
    justify-content: space-between;
    margin: 7px 0;
`;

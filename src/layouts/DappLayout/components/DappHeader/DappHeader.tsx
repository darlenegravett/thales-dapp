import React from 'react';
import styled from 'styled-components';
import UserCard from 'layouts/DappLayout/components/DappHeader/UserCard';
import DappHeaderItem from './DappHeaderItem';
import SPAAnchor from 'components/SPAAnchor';
import { useTranslation } from 'react-i18next';
import { RootState } from 'redux/rootReducer';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import logoSmallIcon from 'assets/images/logo-small-light.svg';
import logoIcon from 'assets/images/logo-light.svg';
import { useSelector } from 'react-redux';
import { getWalletAddress } from 'redux/modules/wallet';
import { useLocation } from 'react-router-dom';

const DappHeader: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));

    return (
        <Container>
            <PageTitle>{getTitle(t)}</PageTitle>
            <UserCard />
            <Sidebar>
                <ItemsContainer>
                    <SPAAnchor className="sidebar-logoSmall" href={buildHref(ROUTES.Home)}>
                        <LogoIcon width="38" height="42" src={logoSmallIcon} />
                    </SPAAnchor>
                    <SPAAnchor className="sidebar-logoBig" href={buildHref(ROUTES.Home)}>
                        <LogoIcon height="42" src={logoIcon} />
                    </SPAAnchor>

                    <DappHeaderItem
                        className={location.pathname === ROUTES.Options.Home ? 'selected' : ''}
                        href={buildHref(ROUTES.Options.Home)}
                        iconName="markets"
                        label={t('common.sidebar.markets')}
                    />

                    <Divider />
                    <DappHeaderItem
                        className={location.pathname === ROUTES.Options.Token ? 'selected' : ''}
                        href={buildHref(ROUTES.Options.Token)}
                        iconName="token"
                        label={t('common.sidebar.earn-label')}
                    />
                    <DappHeaderItem
                        className={location.pathname.includes(ROUTES.Governance.Home) ? 'selected' : ''}
                        href={buildHref(ROUTES.Governance.Home)}
                        iconName="governance"
                        label={t('common.sidebar.governance-label')}
                    />

                    <Divider />
                    <DappHeaderItem
                        className={location.pathname === ROUTES.Options.Royal ? 'selected' : ''}
                        href={buildHref(ROUTES.Options.Royal)}
                        iconName="thales-royale"
                        label={t('common.sidebar.royale-label')}
                    />
                    <DappHeaderItem
                        className={location.pathname === ROUTES.Options.Game ? 'selected' : '' + ' game'}
                        href={buildHref(ROUTES.Options.Game)}
                        iconName="game"
                        label={t('common.sidebar.game-label')}
                    />

                    {walletAddress && (
                        <DappHeaderItem
                            className={location.pathname === ROUTES.Options.Profile ? 'selected' : ''}
                            href={buildHref(ROUTES.Options.Profile)}
                            iconName="profile"
                            label={t('common.sidebar.profile-label')}
                        />
                    )}
                </ItemsContainer>
            </Sidebar>
        </Container>
    );
};

const getTitle = (t: any) => {
    if (location.pathname === ROUTES.Options.Home) return t('common.sidebar.markets');
    if (location.pathname.includes(ROUTES.Governance.Home)) return t('common.sidebar.governance-label');
    if (location.pathname === ROUTES.Options.Token) return t('common.sidebar.earn-label');
    if (location.pathname === ROUTES.Options.Profile) return t('options.trading-profile.title');
};

const Container = styled.div`
    height: 80px;
    width: 100%;
    flex: unset;
    position: relative;
`;

const PageTitle = styled.p`
    font-family: Roboto !important;
    font-style: normal;
    font-weight: 600;
    font-size: 35px;
    color: var(--primary-color);

    @media (max-width: 1024px) {
        margin-top: 20px;
        font-size: 32px;
    }

    @media (max-width: 568px) {
        display: none;
    }
`;

const Sidebar = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    width: 72px;
    height: 100vh;
    z-index: 100;
    background: linear-gradient(190.01deg, #516aff -17.89%, #8208fc 90.41%);
    padding: 35px 0;
    transition: width 0.3s ease;
    overflow: hidden;

    .sidebar-logoBig {
        display: none;
    }

    @media (min-width: 1024px) {
        &:hover {
            width: 300px;
            span {
                display: block;
            }
            i {
                display: block;
            }
            .sidebar-logoSmall {
                display: none;
            }
            .sidebar-logoBig {
                display: block;
            }
        }
    }

    @media (max-width: 1024px) {
        padding: 0;
        background: linear-gradient(270deg, #516aff 0%, #8208fc 100%);
        box-shadow: 0px 0px 30px 10px rgba(0, 0, 0, 0.25);
        border-radius: 30px;
        width: calc(100% - 40px);
        left: 20px;
        top: unset;
        bottom: 20px;
        height: 55px;

        .sidebar-logoSmall {
            display: none;
        }
        .sidebar-logoBig {
            display: none;
        }
        .game {
            display: none !important;
        }
    }
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const ItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    @media (max-width: 1024px) {
        flex-direction: row;
        justify-content: space-around;
        height: 100%;
    }
`;

const LogoIcon = styled.img`
    display: block;
    object-fit: contain;
    cursor: pointer;
    margin: auto;
    margin-top: 10px;
    margin-bottom: 60px;
`;

const Divider = styled.hr`
    width: 100%;
    border: none;
    border-top: 3px solid rgb(255, 255, 255, 0.5);
    @media (max-width: 1024px) {
        display: none;
    }
`;

export default DappHeader;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from 'components/LanguageSelector/V2';
import styled from 'styled-components';
import { Theme } from '../Home';
import Cookies from 'universal-cookie';
import { navigateTo } from 'utils/routes';
import ROUTES from 'constants/routes';
import { FlexDivSpaceBetween } from 'theme/common';

type HeaderInput = {
    theme: Theme;
    setTheme: (data: any) => void;
};

const cookies = new Cookies();

const Header: React.FC<HeaderInput> = ({ theme, setTheme }) => {
    const { t } = useTranslation();
    const [openBurger, setBurgerState] = useState(false);
    return (
        <Wrapper>
            <Logo className="icon-home icon-home--thales" />
            <Links>
                <Link target="_blank" rel="noreferrer" href="https://docs.thales.market/">
                    {t('header.links.docs')}
                </Link>
                <Link
                    target="_blank"
                    rel="noreferrer"
                    href="https://thalesmarket.medium.com/thales-tokenomics-introducing-thales-token-3aab321174e7"
                >
                    {t('header.links.tokenomics')}
                </Link>
                <Link target="_blank" rel="noreferrer">
                    {t('header.links.partners')}
                </Link>
                <Link target="_blank" rel="noreferrer" href="https://discord.com/invite/rB3AWKwACM">
                    {t('header.links.community')}
                </Link>

                <Link target="_blank" rel="noreferrer" href="https://thalesmarket.medium.com/">
                    {t('header.links.blog')}
                </Link>
            </Links>
            <ToggleContainer
                onClick={() => {
                    console.log('clicked');
                    cookies.set('home-theme', theme === Theme.Light ? Theme.Dark : Theme.Light);
                    setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light);
                }}
            >
                <ToggleIcon
                    className={`icon-home ${
                        theme === Theme.Light ? 'icon-home--toggle-white' : 'icon-home--toggle-dark'
                    }`}
                />
            </ToggleContainer>
            <DotsContainer
                onClick={() => {
                    setBurgerState(!openBurger);
                }}
            >
                <DotsIcon className="icon icon--three-dots" />
            </DotsContainer>
            <LanguageContainer>
                <LanguageSelector isLandingPage />
            </LanguageContainer>
            <ButtonContainer>
                <Link
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => navigateTo(ROUTES.Options.Home, false, false, 'show')}
                >
                    {t('landing-page.use-app')}
                </Link>
                <i className="icon-home icon-home--right" />
            </ButtonContainer>
            <BurgerContainer className={openBurger ? '' : 'hide'}>
                <Link target="_blank" rel="noreferrer" href="https://docs.thales.market/">
                    {t('header.links.docs')}
                </Link>
                <Link
                    target="_blank"
                    rel="noreferrer"
                    href="https://thalesmarket.medium.com/thales-tokenomics-introducing-thales-token-3aab321174e7"
                >
                    {t('header.links.tokenomics')}
                </Link>
                <Link target="_blank" rel="noreferrer">
                    {t('header.links.partners')}
                </Link>
                <Link target="_blank" rel="noreferrer" href="https://discord.com/invite/rB3AWKwACM">
                    {t('header.links.community')}
                </Link>

                <Link target="_blank" rel="noreferrer" href="https://thalesmarket.medium.com/">
                    {t('header.links.blog')}
                </Link>
                <FlexDivSpaceBetween>
                    <Text>{t('landing-page.language')}</Text>
                    <LanguageSelector isLandingPage />
                </FlexDivSpaceBetween>

                <ThalesButton>
                    <Logo
                        onClick={() => navigateTo(ROUTES.Options.Home, false, false, 'show')}
                        className="icon icon--logo"
                    />
                </ThalesButton>
            </BurgerContainer>
        </Wrapper>
    );
};

const ThalesButton = styled.div`
    background: #1b314f;
    &,
    & * {
        color: #f7f7f7 !important;
    }

    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.75em;
    padding: 20px 26px;
    height: 56px;
    align-self: center;
    margin-top: 40px;
`;
const Wrapper = styled.div`
    display: contents;
    @media (max-width: 1024px) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        top: 20px;
        width: 100vw;
        padding: 0 40px;
        z-index: 10;
    }
`;

const BurgerContainer = styled.div`
    &.hide {
        display: none;
    }
    position: absolute;
    top: -20px;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 100px 40px;
    width: 100%;
    background: var(--main-background);
    box-shadow: 0px 20px 30px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.i`
    grid-column-start: 4;
    grid-column-end: 9;
    grid-row-start: 3;
    grid-row-end: 4;
    font-size: 8.3em;
    line-height: 34px;
    color: var(--color);
    z-index: 2;
    flex: 1;
`;

const CenteredDiv = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
`;

const Links = styled(CenteredDiv)`
    grid-column-start: 14;
    grid-column-end: 39;
    grid-row-start: 3;
    grid-row-end: 4;
    justify-content: space-between;
    z-index: 2;
    @media (max-width: 1024px) {
        display: none;
    }
`;

const ToggleContainer = styled(CenteredDiv)`
    grid-column-start: 40;
    grid-column-end: 43;
    grid-row-start: 3;
    grid-row-end: 4;
    z-index: 2;
    cursor: pointer;
`;

const DotsContainer = styled(CenteredDiv)`
    display: none;
    grid-column-start: 45;
    grid-column-end: 47;
    grid-row-start: 3;
    grid-row-end: 4;
    z-index: 2;
    cursor: pointer;
    @media (max-width: 1024px) {
        display: block;
        margin-left: 20px;
    }
`;

const LanguageContainer = styled(CenteredDiv)`
    grid-column-start: 44;
    grid-column-end: 46;
    grid-row-start: 3;
    grid-row-end: 4;
    z-index: 1000;
    @media (max-width: 1024px) {
        display: none;
    }
`;

const ButtonContainer = styled(CenteredDiv)`
    grid-column-start: 47;
    grid-column-end: 50;
    grid-row-start: 3;
    grid-row-end: 4;
    color: var(--color);
    z-index: 2;
    @media (max-width: 1024px) {
        display: none;
    }
`;

const Text = styled.p`
    font-family: Nunito !important;
    font-style: normal;
    font-weight: 300;
    font-size: 1em;
    line-height: 91.91%;
    z-index: 2;
    text-align: center;
    text-transform: uppercase;
    color: var(--color);
`;

const Link = styled.a`
    font-family: Nunito !important;
    font-style: normal;
    font-weight: 300;
    font-size: 1em;
    line-height: 91.91%;
    z-index: 2;
    text-align: center;
    text-transform: uppercase;
    color: var(--color);
    @media (max-width: 1024px) {
        margin-bottom: 60px;
    }
`;

const ToggleIcon = styled.i`
    font-size: 3.4em;
    line-height: 26px;
    z-index: 2;
    color: var(--color);
`;

const DotsIcon = styled.i`
    font-size: 3em;
    line-height: 24px;
    z-index: 2;
    color: var(--color);
`;

export default Header;

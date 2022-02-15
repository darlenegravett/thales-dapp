import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Cookies from 'universal-cookie';
import Header from '../../components/Header/Header';
import { ReactComponent as Chart } from 'assets/images/landing-page/articles/governance.svg';
import { ReactComponent as ChartBlack } from 'assets/images/landing-page/articles/governance-black.svg';
import { Background, Theme } from '../../Home';
import Footer from 'pages/V2/components/Footer';
import { FlexDivCentered } from '../../../../theme/common';

const cookies = new Cookies();

const Governance: React.FC = () => {
    const [theme, setTheme] = useState(Number(cookies.get('home-theme')) === 0 ? Theme.Light : Theme.Dark);
    const { t } = useTranslation();

    useEffect(() => {
        const body = document.getElementsByTagName('body')[0];
        const html = document.documentElement;
        html.classList.remove(theme === Theme.Light ? 'dark' : 'light');
        html.classList.add(theme !== Theme.Light ? 'dark' : 'light');
        body.classList.remove(theme === Theme.Light ? 'dark' : 'light');
        body.classList.add(theme !== Theme.Light ? 'dark' : 'light');
    }, [theme]);

    return (
        <Background className={theme === Theme.Light ? 'light' : 'dark'}>
            <Wrapper>
                <Header theme={theme} setTheme={setTheme} />
                <Content>
                    <H1>{t('articles.governance.title')}</H1>
                    <ListWrapper>
                        <List>
                            <ListItem>{t('articles.governance.list.0')}</ListItem>
                            <NestedList>
                                <ListItem>
                                    <a href="#section1">{t('articles.governance.list.1')}</a>
                                </ListItem>
                                <ListItem>
                                    <a href="#section2">{t('articles.governance.list.2')}</a>
                                </ListItem>
                                <ListItem>
                                    <a href="#section3">{t('articles.governance.list.3')}</a>
                                </ListItem>
                                <ListItem>
                                    <a href="#section4">{t('articles.governance.list.4')}</a>
                                </ListItem>
                                <ListItem>
                                    <a href="#section5">{t('articles.governance.list.5')}</a>
                                </ListItem>
                            </NestedList>
                        </List>
                    </ListWrapper>

                    <Paragraph>
                        <Trans i18nKey="articles.governance.paragraphs.intro1" components={{ bold: <strong /> }} />
                    </Paragraph>
                    <ChartWrapper>{theme !== Theme.Dark ? <Chart /> : <ChartBlack />}</ChartWrapper>
                    <Paragraph>
                        <Trans i18nKey="articles.governance.paragraphs.intro2" components={{ bold: <strong /> }} />
                    </Paragraph>
                    <H2 id="section1">{t('articles.governance.list.1')}</H2>
                    <Paragraph>
                        <Trans
                            i18nKey="articles.governance.paragraphs.1"
                            components={{
                                bold: <strong />,
                            }}
                        />
                    </Paragraph>

                    <H2 id="section2">{t('articles.governance.list.2')}</H2>
                    <Paragraph>
                        <Trans
                            i18nKey="articles.governance.paragraphs.2"
                            components={{
                                bold: <strong />,
                                url: (
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href="https://github.com/thales-markets/thales-improvement-proposals/tree/main/TIPs"
                                    />
                                ),
                            }}
                        />
                    </Paragraph>

                    <H2 id="section3">{t('articles.governance.list.3')}</H2>
                    <Paragraph>
                        <Trans i18nKey="articles.governance.paragraphs.3" />
                    </Paragraph>

                    <H2 id="section4">{t('articles.governance.list.4')}</H2>
                    <Paragraph>
                        <Trans i18nKey="articles.governance.paragraphs.4" components={{ bold: <strong /> }} />
                    </Paragraph>

                    <H2 id="section5">{t('articles.governance.list.5')}</H2>
                    <Paragraph>
                        <Trans
                            i18nKey="articles.governance.paragraphs.5"
                            components={{
                                bold: <strong />,
                                url: <a target="_blank" rel="noreferrer" href="https://discord.com/invite/thales" />,
                            }}
                        />
                    </Paragraph>
                    <Footer className="article" theme={theme} setTheme={setTheme} />
                </Content>
            </Wrapper>
        </Background>
    );
};

const Wrapper = styled.div`
    display: grid;
    width: 100%;
    margin: auto;
    max-width: 1122px;
    grid-template-columns: repeat(51, 1fr);
    grid-template-rows: repeat(110, 2em);
`;

const Content = styled.div`
    grid-column-start: 7;
    grid-column-end: 48;
    grid-row-start: 8;
    grid-row-end: 80;
    width: 100%;
    @media (max-width: 1024px) {
        position: absolute;
        display: block;
        top: 140px;
        width: 100vw;
        padding: 0 40px;
        z-index: 9;
        grid-column-start: unset;
        grid-column-end: unset;
        grid-row-start: unset;
        grid-row-end: unset;
    }
`;

const H1 = styled.h1`
    font-family: Playfair Display !important;
    font-style: normal;
    font-weight: bold;
    font-size: 3.8em;
    line-height: 91.91%;
    text-align: justify;
    text-transform: uppercase;
    color: var(--color);
    margin-top: 1em;
    margin-bottom: 1.3em;
`;

const H2 = styled.h2`
    font-family: NunitoSemiBold !important;
    font-size: 1.4em;
    font-style: normal;
    font-weight: 700;
    line-height: 1em;
    letter-spacing: 0em;
    text-align: justified;
    color: var(--color);
    margin-top: 2em;
    margin-bottom: 1em;
`;
const Paragraph = styled.p`
    font-size: 1.4em;
    line-height: 1em;
    &,
    & * {
        color: var(--color);
        font-family: NunitoExtraLight !important;
        font-style: normal;
        font-weight: 300;
        letter-spacing: 0em;
        text-align: justified;
        white-space: pre-line;
    }
    strong {
        font-family: NunitoSemiBold !important;
    }
    a {
        font-family: NunitoSemiBold !important;
        text-decoration: underline;
    }
`;

const ListWrapper = styled.div`
    border: 1px solid var(--color);
    border-radius: 7px;
    width: 38em;
    margin-bottom: 4em;
    @media (max-width: 600px) {
        width: 100%;
    }
}
`;

const List = styled.ul`
    list-style: disc;
    color: var(--color);
    margin-left: 2em;
    padding: 1.5em;
    & > li {
        font-family: Nunito !important;
        font-style: normal;
        font-size: 1.4em;
        font-weight: 700;
        line-height: 170%;
        height: 2em;
    }
    @media (max-width: 600px) {
        margin-left: 1em;
    }
`;

const NestedList = styled.ul`
    list-style: none;
    color: var(--color);
    & li {
        &:before {
            content: '\\25BA \\0020';
            padding-right: 0.5em;
            vertical-align: text-top;
        }
        & > a {
            font-family: Nunito !important;
            font-style: normal;
            font-size: 1.4em;
            font-weight: 300;
            line-height: 170%;
            color: var(--color);
            &:hover {
                font-size: 1.6em;
                transition: 0.2s;
            }
        }
        @media (max-width: 450px) {
            &:nth-child(2),
            &:nth-child(3),
            &:nth-child(4),
            &:nth-child(5) {
                padding-bottom: 5em;
            }
        }
    }
`;

const ListItem = styled.li`
    height: 3em;
    color: var(--color);
`;

const ChartWrapper = styled(FlexDivCentered)`
    margin: 3em 0;
`;

export default Governance;

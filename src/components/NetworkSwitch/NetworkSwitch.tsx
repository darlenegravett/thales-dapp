import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router';
import OutsideClickHandler from 'react-outside-click-handler';
import { FlexDivCentered, FlexDiv, FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered } from 'theme/common';
import styled from 'styled-components';
import { ReactComponent as DownIcon } from 'assets/images/down.svg';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsOVM } from 'utils/network';
import { getNetworkId } from 'redux/modules/wallet';
import {
    L1_TO_L2_NETWORK_MAPPER,
    L2_TO_L1_NETWORK_MAPPER,
    OPTIMISM_NETWORKS,
    OPTIMISM_OPTIONS,
} from 'constants/network';
import { hexStripZeros } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { ReactComponent as ArrowHyperlinkIcon } from 'assets/images/arrow-hyperlink.svg';
import { NetworkId } from '@synthetixio/contracts-interface';
import ROUTES from '../../constants/routes';
import { buildHref, navigateTo } from '../../utils/routes';

export const NetworkSwitch: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isL2 = getIsOVM(networkId);
    const [optimismDropdownIsOpen, setOptimismDropdownIsOpen] = useState(false);
    const setDropdownIsOpen = (isOpen: boolean) => {
        if (!isOpen && !optimismDropdownIsOpen) {
            return;
        }
        setOptimismDropdownIsOpen(isOpen);
    };
    const location = useLocation();

    const switchOrAddOptimismNetwork = async () => {
        const switchTo = L1_TO_L2_NETWORK_MAPPER[networkId] ?? NetworkId['Mainnet-Ovm'];
        const optimismNetworkParms = OPTIMISM_NETWORKS[switchTo];

        if (typeof window.ethereum !== 'undefined') {
            try {
                await (window.ethereum as any).request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: optimismNetworkParms.chainId }],
                });
                if (matchPath(location.pathname, { path: ROUTES.Options.MarketMatch })) {
                    navigateTo(buildHref(ROUTES.Options.Home));
                }
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    try {
                        await (window.ethereum as any).request({
                            method: 'wallet_addEthereumChain',
                            params: [optimismNetworkParms],
                        });
                        await (window.ethereum as any).request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: optimismNetworkParms.chainId }],
                        });
                        if (matchPath(location.pathname, { path: ROUTES.Options.MarketMatch })) {
                            navigateTo(buildHref(ROUTES.Options.Home));
                        }
                    } catch (addError) {
                        console.log(addError);
                    }
                } else {
                    console.log(switchError);
                }
            }
        }
    };

    const switchToL1 = async () => {
        const formattedChainId = hexStripZeros(BigNumber.from(L2_TO_L1_NETWORK_MAPPER[networkId]).toHexString());

        if (typeof window.ethereum !== 'undefined') {
            try {
                await (window.ethereum as any).request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: formattedChainId }],
                });
                if (matchPath(location.pathname, { path: ROUTES.Options.MarketMatch })) {
                    navigateTo(buildHref(ROUTES.Options.Home));
                }
            } catch (switchError: any) {
                console.log(switchError);
            }
        }
    };

    return (
        <>
            <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
                <Container>
                    <OptimismButton
                        onClick={() => {
                            isL2 ? setDropdownIsOpen(!optimismDropdownIsOpen) : switchOrAddOptimismNetwork();
                        }}
                        isActive={optimismDropdownIsOpen}
                    >
                        <InnerButton isL2={isL2}>
                            <FlexDiv>{t(isL2 ? 'optimism.optimistic-l2' : 'optimism.switch-to-l2')}</FlexDiv>
                            {isL2 && <StyledDownIcon />}
                        </InnerButton>
                    </OptimismButton>
                    {optimismDropdownIsOpen && (
                        <DropdownContainer>
                            <DropDown>
                                <DropDownItem
                                    key="switch"
                                    onClick={() => {
                                        switchToL1();
                                        setDropdownIsOpen(false);
                                    }}
                                >
                                    <FlexDivCentered>
                                        <OptimismOption>{t('optimism.switch-to-l1')}</OptimismOption>
                                    </FlexDivCentered>
                                </DropDownItem>
                                {OPTIMISM_OPTIONS.map((option: any) => (
                                    <StyledLink key={option.label} href={option.link} target="_blank" rel="noreferrer">
                                        <DropDownItem
                                            onClick={() => {
                                                setDropdownIsOpen(false);
                                            }}
                                        >
                                            <OptimismOption>{t(option.label)}</OptimismOption>
                                            <ArrowIcon />
                                        </DropDownItem>
                                    </StyledLink>
                                ))}
                            </DropDown>
                        </DropdownContainer>
                    )}
                </Container>
            </OutsideClickHandler>
        </>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 170px;
    margin-right: 10px;
    @media (max-width: 767px) {
        width: 100%;
        margin-bottom: 20px;
    }
`;

const OptimismButton = styled.button<{ isActive: boolean }>`
    position: relative;
    width: 170px;
    height: 40px;
    border: none;
    background: linear-gradient(150.74deg, #ca91dc -7.89%, #6ac1d5 107.94%);
    padding: 1px;
    border-radius: 23px;
    color: #f6f6fe;
    path {
        fill: #f6f6fe;
    }
    &:hover {
        cursor: pointer;
        background: #00f9ff;
        color: #00f9ff;
        path {
            fill: #00f9ff;
        }
    }
    @media (max-width: 767px) {
        width: 100%;
    }
`;

const InnerButton = styled(FlexDivRowCentered)<{ isL2: boolean }>`
    background: #0e116a;
    border-radius: 23px;
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    text-align: center;
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
    justify-content: ${(props) => (props.isL2 ? 'space-between' : 'center')};
`;

const DropdownContainer = styled.div`
    position: relative;
    z-index: 1000;
`;

const DropDown = styled(FlexDivColumn)`
    background: linear-gradient(281.48deg, #04045a -16.58%, #141874 97.94%);
    border: 1px solid #4f759b;
    border-radius: 20px;
    position: absolute;
    margin-top: 2px;
    padding: 8px;
    width: 220px;
    @media (max-width: 767px) {
        width: 100%;
    }
`;

const DropDownItem = styled(FlexDivRowCentered)`
    padding: 8px 12px;
    cursor: pointer;
    &:hover {
        background: rgba(196, 196, 196, 0.1);
        border-radius: 12px;
    }
`;

const OptimismOption = styled.div`
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.35px;
    color: #f6f6fe;
    display: block;
`;

export const StyledLink = styled.a`
    color: #f6f6fe;
    &path {
        fill: #f6f6fe;
    }
`;

const ArrowIcon = styled(ArrowHyperlinkIcon)`
    width: 12px;
    height: 12px;
`;

const StyledDownIcon = styled(DownIcon)`
    height: 15px;
    width: 15px;
`;

export default NetworkSwitch;

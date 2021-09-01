import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered } from 'theme/common';

export const EarnSection = styled.section`
    padding-bottom: 0px;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    background: #04045a;
    border-radius: 15px;
    color: white;
    grid-column: span 5;
    grid-row: span 3;
    margin-bottom: 15px;
    border: solid 1px transparent;
    padding: 10px;
    &:before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: -1;
        margin: -3px;
        border-radius: inherit;
        background: linear-gradient(rgba(202, 145, 220, 0.6), rgba(106, 193, 213, 0.6));
    }
`;

export const SectionHeader = styled(FlexDivRowCentered)`
    font-weight: 600;
    font-size: 20px;
    letter-spacing: 0.15px;
    color: #f6f6fe;
    min-height: 50px;
    padding: 0px 20px 0 30px;
`;

export const SectionContent = styled(FlexDiv)`
    padding: 30px 30px 15px 30px;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
`;

export const ClaimDiv = styled(FlexDiv)`
    align-items: center;
`;

export const ClaimTitle = styled.span`
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.15px;
    padding-bottom: 20px;
`;

export const ClaimContent = styled.span`
    font-size: 16px;
`;

export const SectionContentContainer = styled(FlexDivColumn)`
    padding: 40px 30px 0 30px;
`;

export const ClaimItem = styled(FlexDivColumnCentered)`
    margin-bottom: 20px;
    align-items: center;
`;

export const ButtonContainer = styled(FlexDivColumnCentered)`
    margin-top: 40px;
    align-items: center;
`;

export const ClaimMessage = styled.div`
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.25px;
    color: #ffcc00;
    margin-top: 10px;
`;

export const FullRow = styled(FlexDiv)`
    flex-basis: 100%;
    display: flex;
    font-size: 20px;
    justify-content: center;
    margin-bottom: 10px;
`;

export const EarnSymbol = styled(FlexDivCentered)`
    color: #00f9ff;
    font-weight: 600;
    font-size: 39px;
    padding: 20px;
`;

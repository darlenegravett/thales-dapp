import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivCentered } from '../../../../theme/common';
import NetworkSwitch from 'components/NetworkSwitch';

type MigrationInfoProps = {
    messageKey: string;
};

const MigrationInfo: React.FC<MigrationInfoProps> = ({ messageKey }) => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Conatiner>
            <LPStakingTitle>{t(`migration.migration-messages.${messageKey}`)}</LPStakingTitle>
            <FlexDivCentered>
                <NetworkSwitch hideL2DropDown />
            </FlexDivCentered>
        </Conatiner>
    );
};

const Conatiner = styled.section`
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 15px;
    color: #f6f6fe;
    grid-column: span 10;
    padding: 30px;
    justify-content: center;
    @media (max-width: 767px) {
        padding: 5px;
    }
`;

const LPStakingTitle = styled(FlexDivCentered)`
    font-weight: 600;
    font-size: 30px;
    line-height: 44px;
    padding: 20px 0;
    text-align: center;
    @media (max-width: 767px) {
        font-size: 16px;
        line-height: 18px;
        padding: 30px 0;
    }
`;

export default MigrationInfo;

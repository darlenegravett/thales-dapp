import React, { CSSProperties } from 'react';
import CurrencyIcon from './CurrencyIcon';
import { CurrencyKey } from 'constants/currency';
import { getSynthName } from 'utils/currency';

type CurrencyNameProps = {
    currencyKey: CurrencyKey;
    showIcon?: boolean;
    iconProps?: Record<string, unknown>;
    synthIconStyle?: CSSProperties;
    spanStyle?: CSSProperties;
};

export const CurrencyName: React.FC<CurrencyNameProps> = ({
    synthIconStyle,
    currencyKey,
    showIcon = false,
    iconProps = {},
    spanStyle,
}) => (
    <span
        style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '15px',
            textAlign: 'left',
            fontFamily: 'Titillium Regular !important',
            ...spanStyle,
        }}
    >
        {showIcon && <CurrencyIcon currencyKey={currencyKey} synthIconStyle={synthIconStyle} {...iconProps} />}
        <span style={{ fontWeight: 300, textTransform: 'uppercase' }}>{getSynthName(currencyKey)}</span>
        <span style={{ fontWeight: 900, marginLeft: '3px' }}>{currencyKey}</span>
    </span>
);

export default CurrencyName;

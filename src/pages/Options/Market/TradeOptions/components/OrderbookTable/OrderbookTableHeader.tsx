import { LightTooltip, StyledQuestionMarkIcon } from 'pages/Options/Market/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TableRow, TableCell } from './OrderbookTable';

type OrderbookTableHeaderProps = {
    optionsCurrencyKey: string;
};

const OrderbookTableHeader: React.FC<OrderbookTableHeaderProps> = ({ optionsCurrencyKey }) => {
    const { t } = useTranslation();
    const columns = [
        {
            header: <></>,
            width: 14,
            justifyContent: 'left',
        },
        {
            header: <p style={{ marginLeft: 14 }}>{t('options.market.trade-options.orderbook.table.price-col')}</p>,
            width: 300,
            justifyContent: 'left',
        },
        {
            header: (
                <>{t('options.market.trade-options.orderbook.table.amount-col', { currencyKey: optionsCurrencyKey })}</>
            ),
            width: 300,
            justifyContent: 'left',
        },
        {
            header: <>{t('options.market.trade-options.orderbook.table.total-col')}</>,
            width: 300,
            justifyContent: 'left',
        },
        {
            header: (
                <>
                    {t('options.market.trade-options.orderbook.table.return-col')}
                    <LightTooltip title={t('options.market.trade-options.orderbook.table.return-col-tooltip')}>
                        <TableHeadQuestionMarkIcon />
                    </LightTooltip>
                </>
            ),
            className: 'return',
            width: 300,
            justifyContent: 'left',
        },
        {
            header: <>{t('options.market.trade-options.orderbook.table.time-remaining-col')}</>,
            width: 300,
            justifyContent: 'center',
            className: 'time-remaining',
        },
        {
            header: <></>,
            width: 50,
            justifyContent: 'left',
        },
    ];

    return (
        <TableRow>
            {columns.map((column: any, columnIndex: any) => (
                <TableCellHead
                    style={{ width: column.width }}
                    key={columnIndex}
                    justifyContent={column.justifyContent}
                    className={column.className}
                >
                    {column.header}
                </TableCellHead>
            ))}
        </TableRow>
    );
};

const TableCellHead = styled(TableCell)<{ justifyContent?: string }>`
    justify-content: ${(props) => props.justifyContent || 'left'};
    font-weight: bold;
    font-size: 10px;
    line-height: 16px;
    letter-spacing: 1px;
    color: #748bc6;
    user-select: none;
    background: rgba(228, 228, 228, 0.05);
    &:first-child {
        padding-left: 0;
    }
    @media (max-width: 512px) {
        &.time-remaining {
            text-align: center;
        }
        &.return svg {
            display: none;
        }
    }
`;

const TableHeadQuestionMarkIcon = styled(StyledQuestionMarkIcon)`
    path {
        fill: #748bc6;
    }
`;

export default OrderbookTableHeader;

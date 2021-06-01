import React from 'react';
import { LineChart, XAxis, YAxis, Line, Tooltip, ResponsiveContainer } from 'recharts';
import format from 'date-fns/format';
import isNumber from 'lodash/isNumber';
import { useTranslation } from 'react-i18next';
import { USD_SIGN } from 'constants/currency';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { Loader } from 'semantic-ui-react';
import { OptionsMarketInfo } from 'types/options';
import styled from 'styled-components';
import { GridDivCenteredRow } from 'theme/common';

type OptionsChartProps = {
    optionsMarket: OptionsMarketInfo;
    minTimestamp: number;
    maxTimestamp: number;
    isChartEnabled: boolean;
};

// TODO no chart data until we implement new model for chart
const OptionsChart: React.FC<OptionsChartProps> = () => {
    const { t } = useTranslation();

    const chartData: any = [];

    const isLoading = false;
    const noChartData = true;

    return (
        <div style={{ height: 300, paddingLeft: '30px' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={noChartData ? [] : chartData}>
                            <XAxis
                                dataKey="timestamp"
                                tick={xAxisFontStyle}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val: any) => {
                                    if (!isNumber(val)) {
                                        return '';
                                    }
                                    return format(val, 'dd MMM');
                                }}
                            />
                            <YAxis
                                type="number"
                                domain={[0, 1]}
                                orientation="right"
                                tick={yAxisFontStyle}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val: any) => t('common.val-in-cents', { val })}
                            />
                            <Line
                                type="linear"
                                name={t('options.common.long-price')}
                                dataKey="longPrice"
                                stroke="#4FBF67"
                                strokeWidth={1.5}
                                isAnimationActive={false}
                            />
                            <Line
                                type="linear"
                                name={t('options.common.short-price')}
                                dataKey="shortPrice"
                                stroke="#C62937"
                                strokeWidth={1.5}
                                isAnimationActive={false}
                            />
                            {!noChartData && (
                                <Tooltip
                                    // @ts-ignore
                                    cursor={{ strokeWidth: 2, stroke: '#F6F6FE' }}
                                    contentStyle={tooltipContentStyle}
                                    itemStyle={tooltipItemStyle}
                                    labelStyle={tooltipLabelStyle}
                                    formatter={(val: string | number) => formatCurrencyWithSign(USD_SIGN, val)}
                                    labelFormatter={(label: any) => {
                                        if (!isNumber(label)) {
                                            return '';
                                        }
                                        return format(label, 'do MMM yy | HH:mm');
                                    }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                    {isLoading && <Loader active />}
                    {noChartData && (
                        <NoCharDataContainer>{t('options.market.chart-card.no-chart-data')}</NoCharDataContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

const xAxisFontStyle = {
    fontWeight: 'bold',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1,
    fill: '#F6F6FE',
};

const yAxisFontStyle = {
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 24,
    letterSpacing: 0.4,
    fill: '#F6F6FE',
};

const tooltipContentStyle = {
    background: '#F6F6FE',
    border: '1px solid #44E1E2',
    borderRadius: 10,
};

const tooltipItemStyle = {
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: 0.4,
    fill: '#04045A',
};

const tooltipLabelStyle = {
    fontWeight: 600,
    fontSize: 12,
    lineHeight: 1.8,
    letterSpacing: 1,
    color: '#04045A',
};

const NoCharDataContainer = styled(GridDivCenteredRow)`
    grid-gap: 10px;
    color: #f6f6fe;
    padding: 20px;
    justify-items: center;
    font-weight: 600;
    font-size: 25px;
    line-height: 48px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`;

export default OptionsChart;

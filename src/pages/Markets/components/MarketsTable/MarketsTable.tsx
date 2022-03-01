/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';

import { OptionsMarkets } from 'types/options';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import { SortOption } from 'types/options';

import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import { useTranslation } from 'react-i18next';

import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { getIsOVM } from 'utils/network';

import Currency from 'components/Currency/v2';
import TimeRemaining from 'pages/Options/components/TimeRemaining';
import MarketsGrid from '../MarketsGrid';
import { FlexDivRow } from 'theme/common';
import TableGridSwitch from '../Input/TableGridSwitch';
import SearchField from '../Input/SearchField';
import PriceChart from 'components/Charts/PriceChart';
import { TablePagination } from '@material-ui/core';
import SortingMenu from 'components/SortingMenu';
import SPAAnchor from 'components/SPAAnchor';

import { formatCurrencyWithSign } from 'utils/formatters/number';
import { USD_SIGN } from 'constants/currency';
import { buildOptionsMarketLink } from 'utils/routes';

import { getSynthName } from 'utils/currency';

import './main.scss';
import CurrencyIcon from 'components/Currency/v2/CurrencyIcon';

type MarketsTableProps = {
    exchangeRates: Rates | null;
    optionsMarkets: OptionsMarkets;
    watchlistedMarkets?: string[];
};

const MarketPhase = {
    trading: '#50CE99',
    paused: '#C3244A',
    maturity: '#F7B91A',
};

const MarketsTable: React.FC<MarketsTableProps> = ({ exchangeRates, optionsMarkets }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isL2 = getIsOVM(networkId);

    const { t } = useTranslation();

    const GridSortFilters: Array<SortOption> = [
        {
            property: 'asset',
            displayName: t(`options.home.markets-table.asset-col`),
            desc: false,
            asc: false,
        },
        {
            property: 'strikePrice',
            displayName: t(`options.home.markets-table.strike-price-col`),
            desc: false,
            asc: false,
        },
        {
            property: 'currentAssetPrice',
            displayName: t(`options.home.markets-table.current-asset-price-col`),
            desc: false,
            asc: false,
        },
        {
            property: 'timeRemaining',
            displayName: t(`options.home.markets-table.time-remaining-col`),
            desc: false,
            asc: false,
        },
        {
            property: 'phase',
            displayName: t(`options.home.markets-table.phase-col`),
            desc: false,
            asc: false,
        },
    ];
    const [allAssets, setAllAssets] = useState<Set<string>>(new Set());
    const [sortOptions, setSortOptions] = useState(GridSortFilters);
    const [tableView, setTableView] = useState<boolean>(false);
    const [assetFilters, setAssetFilters] = useState<string[]>([]);

    const labels = [t(`options.home.markets-table.menu.grid`), t(`options.home.markets-table.menu.table`)];

    const updateSortOptions = (index: number) => {
        const newSortOptions = [...sortOptions];

        if (newSortOptions[index].asc) {
            newSortOptions[index].asc = false;
            newSortOptions[index].desc = true;
        } else if (newSortOptions[index].desc) {
            newSortOptions[index].asc = false;
            newSortOptions[index].desc = false;
        } else if (!newSortOptions[index].asc && !newSortOptions[index].desc) {
            newSortOptions[index].asc = true;
        }

        newSortOptions.forEach((item, itemIndex) => {
            if (index == itemIndex) return;
            item.asc = false;
            item.desc = false;
        });

        setSortOptions(newSortOptions);
    };

    const columns: Array<any> = useMemo(() => {
        return [
            {
                Header: t(`options.home.markets-table.asset-col`),
                accessor: 'asset',
                Cell: (_props: any) => {
                    return (
                        <Currency.Name
                            currencyKey={_props?.cell?.value}
                            showIcon={true}
                            iconProps={{ type: 'asset' }}
                            synthIconStyle={{ width: 32, height: 32 }}
                            spanStyle={{ float: 'left' }}
                        />
                    );
                },
            },
            {
                id: 'currencyKey',
                Header: t(`options.home.markets-table.24h-change-col`),
                accessor: (row: any) => (
                    <PriceChart
                        currencyKey={row?.currencyKey}
                        height={30}
                        width={125}
                        showFooter={false}
                        showPercentageChangeOnSide={true}
                        containerStyle={{ marginTop: '6px', marginBottom: '6px', marginLeft: '10px' }}
                        footerStyle={{ fontSize: '10px' }}
                    />
                ),
                disableSortBy: true,
            },
            {
                Header: t(`options.home.markets-table.asset-col`),
                accessor: 'assetFullName',
                isVisible: false,
                disableSortBy: true,
                show: false,
            },
            ...(isL2
                ? [
                      {
                          Header: t(`options.home.markets-table.amm-size-col`),
                          accessor: (row: any) => <RatioText green={row.availableLongs} red={row.availableShorts} />,
                          disableSortBy: true,
                      },
                  ]
                : []),
            ...(isL2
                ? [
                      {
                          Header: t(`options.home.markets-table.price-up-down-col`),
                          accessor: (row: any) => <RatioText green={row.longPrice} red={row.shortPrice} />,
                          disableSortBy: true,
                      },
                  ]
                : []),
            {
                Header: t(`options.home.markets-table.strike-price-col`),
                accessor: 'strikePrice',
                Cell: (_props: any) => formatCurrencyWithSign(USD_SIGN, _props?.cell?.value, 2),
            },
            {
                Header: t(`options.home.markets-table.current-asset-price-col`),
                accessor: 'currentPrice',
                Cell: (_props: any) => formatCurrencyWithSign(USD_SIGN, _props?.cell?.value, 2),
            },
            {
                Header: t(`options.home.markets-table.time-remaining-col`),
                accessor: 'timeRemaining',
                Cell: (_props: any) => {
                    return <TimeRemaining end={_props?.cell?.value} fontSize={14} showFullCounter={true} />;
                },
            },
            {
                Header: t(`options.home.markets-table.phase-col`),
                accessor: 'phase',
                Cell: (_props: any) => {
                    return (
                        <Phase phase={_props?.cell?.value?.toLowerCase()}>
                            {_props?.cell?.value?.toLowerCase()} <Dot phase={_props?.cell?.value?.toLowerCase()} />
                        </Phase>
                    );
                },
            },
        ];
    }, [optionsMarkets]);

    const data = useMemo(() => {
        const set: Set<string> = new Set();
        const processedMarkets = optionsMarkets.map((market) => {
            set.add(market.currencyKey);
            return {
                address: market.address,
                asset: market.asset,
                currencyKey: market.currencyKey,
                assetFullName: getSynthName(market.currencyKey),
                availableLongs: market.availableLongs,
                availableShorts: market.availableShorts,
                longPrice: formatCurrencyWithSign(USD_SIGN, market.longPrice, 2),
                shortPrice: formatCurrencyWithSign(USD_SIGN, market.shortPrice, 2),
                strikePrice: market.strikePrice,
                currentPrice: exchangeRates?.[market.currencyKey] || 0,
                timeRemaining: market.timeRemaining,
                phase: market.phase,
            };
        });

        const result = new Set(
            Array.from(set).sort((a, b) => {
                if (a === 'BTC') return -1;
                if (b === 'BTC') return 1;
                if (a === 'ETH') return -1;
                if (b === 'ETH') return 1;

                if (a === 'SNX') return -1;
                if (b === 'SNX') return 1;
                if (a === 'LINK') return -1;
                if (b === 'LINK') return 1;

                return 0;
            })
        );

        setAllAssets(result);

        return processedMarkets;
    }, [optionsMarkets]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        state,
        setGlobalFilter,
        setHiddenColumns,
        gotoPage,
        setPageSize,
    } = useTable(
        {
            columns,
            data: data.filter((market) => {
                if (assetFilters?.length) {
                    return assetFilters.includes(market.currencyKey);
                }
                return true;
            }),
            initalState: {
                pageIndex: 1,
            },
            autoResetPage: false,
            autoResetSortBy: false,
            autoResetGlobalFilter: false,
            autoResetRowState: false,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const { pageIndex, pageSize, globalFilter } = state;

    const handleChangePage = (_event: any, newPage: number) => {
        gotoPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setPageSize(parseInt(event.target.value, 10));
        gotoPage(0);
    };

    useEffect(() => {
        gotoPage(0);
    }, [globalFilter]);

    useEffect(() => {
        setHiddenColumns(['assetFullName']);
    }, [columns]);

    const filters = useMemo(() => {
        return {
            searchQuery: globalFilter,
            sort: [
                ...sortOptions
                    .map((item) => {
                        if (item.asc || item.desc) {
                            return {
                                column: item.property as string,
                                type: item.asc ? ('asc' as const) : ('desc' as const),
                            };
                        }
                    })
                    .filter((item) => item),
            ],
            assetFilters: assetFilters,
        };
    }, [globalFilter, sortOptions, assetFilters]);

    return (
        <>
            <Wrapper>
                <FilterContainer>
                    {allAssets.size > 0 &&
                        [...(allAssets as any)].map((value: string, index: number) => {
                            return (
                                <Item
                                    key={index}
                                    className={assetFilters.includes(value) ? 'active' : ''}
                                    onClick={() => {
                                        if (assetFilters.includes(value)) {
                                            const array = [...assetFilters];
                                            const index = array.indexOf(value);
                                            if (index !== -1) {
                                                array.splice(index, 1);
                                            }
                                            setAssetFilters(array);
                                        } else {
                                            setAssetFilters([...assetFilters, value]);
                                        }
                                    }}
                                >
                                    <CurrencyIcon width="40px" height="40px" currencyKey={value} />
                                </Item>
                            );
                        })}
                </FilterContainer>
                <FormContainer>
                    <TableGridSwitch
                        value={tableView}
                        labels={labels}
                        clickEventHandler={() => setTableView(!tableView)}
                    />
                    <SearchField text={globalFilter} handleChange={(value) => setGlobalFilter(value)} />
                </FormContainer>
            </Wrapper>
            {!tableView && <SortingMenu items={sortOptions} itemClickEventHandler={updateSortOptions} />}
            {tableView && (
                <>
                    <table {...getTableProps()}>
                        <thead>
                            {headerGroups.map((headerGroup: any) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column: any) => (
                                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                            {column.render('Header')}
                                            {
                                                <Arrow
                                                    className={`icon ${
                                                        column.canSort
                                                            ? column.isSorted
                                                                ? column.isSortedDesc
                                                                    ? 'icon--arrow-down'
                                                                    : 'icon--arrow-up'
                                                                : 'icon--double-arrow'
                                                            : ''
                                                    }`}
                                                />
                                            }
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row: any, index: number) => {
                                prepareRow(row);
                                return (
                                    <SPAAnchor href={buildOptionsMarketLink(row.original.address)}>
                                        <tr key={index} {...row.getRowProps()}>
                                            {row.cells.map((cell: any) => {
                                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                            })}
                                        </tr>
                                    </SPAAnchor>
                                );
                            })}
                        </tbody>
                    </table>
                    <PaginationWrapper
                        rowsPerPageOptions={[5, 10, 25]}
                        count={data.length}
                        rowsPerPage={pageSize}
                        page={pageIndex}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}
            {!tableView && (
                <MarketsGrid optionsMarkets={optionsMarkets} exchangeRates={exchangeRates} filters={filters} />
            )}
        </>
    );
};

export const PaginationWrapper = styled(TablePagination)`
    border: none !important;
    display: flex;
    width: 100%;
    max-width: 1200px;
    height: auto;
    color: var(--primary-color) !important;
    .MuiToolbar-root {
        padding: 0;
        display: flex;
        .MuiSelect-icon {
            color: #f6f6fe;
        }
        .MuiTablePagination-spacer {
            display: block;
        }
        .MuiTablePagination-caption {
            font-family: Titillium Regular !important;
            font-style: normal;
        }
        .MuiTablePagination-toolbar {
            overflow: visible;
        }
    }

    .MuiTablePagination-selectRoot {
        font-family: Titillium Regular !important;
        font-style: normal;
    }

    .MuiIconButton-root.Mui-disabled {
        color: var(--disabled-item);
    }
    .MuiTablePagination-toolbar > .MuiTablePagination-caption:last-of-type {
        display: block;
    }
    .MuiTablePagination-selectRoot {
        @media (max-width: 767px) {
            margin-left: 0px;
            margin-right: 0px;
        }
    }
`;

const Text = styled.span`
    font-family: Titillium Regular !important;
    font-style: normal;
    text-align: right !important;
`;

const GreenText = styled(Text)`
    color: #50ce99;
`;

const RedText = styled(Text)`
    color: #c3244a;
`;

const Phase = styled.span<{ phase: 'trading' | 'paused' | 'maturity' }>`
    color: ${(props: any) => (MarketPhase as any)[props.phase]};
    text-transform: capitalize;
    font-weight: 300;
`;

const Dot = styled.span<{ phase: 'trading' | 'paused' | 'maturity' }>`
    height: 7px;
    width: 7px;
    background-color: ${(props: any) => (MarketPhase as any)[props.phase]};
    border-radius: 50%;
    display: inline-block;
`;

const Arrow = styled.i`
    margin-left: 5px;
    font-size: 15px;
    text-transform: none;
`;

const Wrapper = styled(FlexDivRow)`
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
    max-width: 1200px;
    align-items: flex-end;
`;

const FormContainer = styled.div`
    color: #64d9fe;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const FilterContainer = styled.div`
    display: flex;
    align-items: stretch;
`;

const Item = styled.span`
    padding: 6px 14px 6px 14px;
    box-sizing: content-box;
    width: 40px;
    margin-bottom: -10px;
    color: var(--primary-color);
    cursor: pointer;
    opacity: 0.5;
    &.active {
        opacity: 1;
        box-shadow: 0px 4px var(--primary-filter-menu-active);
    }
`;

const RatioText: React.FC<{ green: string; red: string }> = ({ green, red }) => {
    return (
        <span>
            <GreenText>{green}</GreenText> / <RedText>{red}</RedText>
        </span>
    );
};

export default MarketsTable;

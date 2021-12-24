import React from 'react';
import styled from 'styled-components';
import { FlexDiv } from 'theme/common';
import searchIcon from 'assets/images/search-icon.svg';
import { useTranslation } from 'react-i18next';

export const SearchWrapper = styled(FlexDiv)`
    align-items: center;
    position: relative;
    background: linear-gradient(rgba(140, 114, 184, 0.6), rgba(106, 193, 213, 0.6));
    border-radius: 23px;
    margin: 22px;
    &:before {
        content: url(${searchIcon});
        position: absolute;
        right: 16px;
        transform: scale(0.9);
    }
`;

export const SearchInput = styled.input`
    height: 40px;
    width: 204px;
    border-radius: 23px;
    border: none !important;
    outline: none !important;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    padding: 0 10px;
    padding-right: 50px !important;
    letter-spacing: 0.15px;
    background: #04045a;
    color: #f6f6fe;
    padding-left: 20px;
    margin: 2px;
    &::placeholder {
        font-size: 16px;
        color: #f6f6f6;
        opacity: 0.7;
    }
`;

type SearchMarketProp = {
    assetSearch: string;
    setAssetSearch: (param: string) => void;
    className?: string;
    placeholder?: string;
};

const SearchMarket: React.FC<SearchMarketProp> = ({ assetSearch, setAssetSearch, className, placeholder }) => {
    const { t } = useTranslation();

    return (
        <SearchWrapper className={className ? className : ''}>
            <SearchInput
                onChange={(e) => setAssetSearch(e.target.value)}
                onFocus={() =>
                    document.body.clientWidth < 600
                        ? document.getElementsByClassName('markets-mobile')[0]?.scrollIntoView({ behavior: 'smooth' })
                        : ''
                }
                value={assetSearch}
                placeholder={placeholder ? placeholder : t(`options.filters-labels.search-placeholder`)}
            />
        </SearchWrapper>
    );
};

export default SearchMarket;

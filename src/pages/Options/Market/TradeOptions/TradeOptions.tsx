import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import TradeOptionsSide from './TradeOptionsSide';

const TradeOptions: React.FC = () => {
    const { t } = useTranslation();
    const tabContent: Array<{
        id: 'long-options' | 'short-options';
        name: string;
        color: 'red' | 'green';
    }> = useMemo(
        () => [
            {
                id: 'long-options',
                name: t('options.market.trade-options.trade-long-options-tab-title'),
                color: 'green',
            },
            {
                id: 'short-options',
                name: t('options.market.trade-options.trade-short-options-tab-title'),
                color: 'red',
            },
        ],
        [t]
    );

    const [activeTab, setActiveTab] = useState(tabContent[0]);

    return (
        <>
            <Menu tabular>
                {tabContent.map((tab) => (
                    <Menu.Item
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        active={tab.id === activeTab.id}
                        name={tab.id}
                        color={tab.color}
                    >
                        {tab.name}
                    </Menu.Item>
                ))}
            </Menu>
            {activeTab.id === 'long-options' && <TradeOptionsSide optionSide="long" />}
            {activeTab.id === 'short-options' && <TradeOptionsSide optionSide="short" />}
        </>
    );
};

export default TradeOptions;

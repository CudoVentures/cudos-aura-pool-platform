import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import UserProfilePageStore from '../../stores/UserProfilePageStore';

import StyledContainer, { ContainerPadding } from '../../../../../core/presentation/components/StyledContainer';
import ChartHeading from '../../../../analytics/presentation/components/ChartHeading';
import ChartInfo from '../../../../analytics/presentation/components/ChartInfo';
import DefaultIntervalPicker from '../../../../analytics/presentation/components/DefaultIntervalPicker';
import DailyChart from '../../../../analytics/presentation/components/DailyChart';

import BitcoinStore from '../../../../bitcoin-data/presentation/stores/BitcoinStore';

import '../../styles/my-earnings-tab.css';

type Props = {
    bitcoinStore?: BitcoinStore
    userProfilePageStore?: UserProfilePageStore,
}

function MyEarningsTab({ bitcoinStore, userProfilePageStore }: Props) {
    const { userEarningsEntity, defaultIntervalPickerState } = userProfilePageStore;

    useEffect(() => {
        bitcoinStore.init();
    }, []);

    return (
        <div className={'MyEarningsTab FlexColumn'}>
            <StyledContainer containerPadding = { ContainerPadding.PADDING_24 }>
                <ChartHeading
                    leftContent = { (
                        <>
                            <ChartInfo label = { 'Total BTC Earnings'} value = { bitcoinStore.formatBtcInUsd(userEarningsEntity.totalEarningInBtc)} />
                            <ChartInfo label = { 'Total NFTs Bought'} value = { userEarningsEntity.totalNftBought.toString() } />
                        </>
                    ) }
                    rightContent = { (
                        <DefaultIntervalPicker defaultIntervalPickerState = { defaultIntervalPickerState } />
                    ) } />
                <DailyChart
                    timestampFrom = { defaultIntervalPickerState.earningsTimestampFrom }
                    timestampTo = { defaultIntervalPickerState.earningsTimestampTo }
                    data = { userEarningsEntity.earningsPerDayInUsd } />
            </StyledContainer>
            <div className={'Grid GridColumns3 BalancesDataContainer'}>
                <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                    <div className={'B1 SemiBold'}>Wallet Balance</div>
                    <div className={'FlexColumn ValueColumn'}>
                        <div>
                            <span className={'H2 Bold'}>456,789<span className={'SecondaryColor'}>.123456</span></span>
                            <span className={'H3 SecondaryColor'}> CUDOS</span>
                        </div>
                        <div className={'SecondaryColor H3 Bold'}>$345,678.00</div>
                    </div>
                </StyledContainer>
                <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                    <div className={'B1 SemiBold'}>BTC Earned</div>
                    <div className={'FlexColumn ValueColumn'}>
                        <div>
                            <span className={'H2 Bold'}>{ userEarningsEntity.formatBtcEarnedInBtc() }</span>
                            <span className={'H3 SecondaryColor'}> BTC</span>
                        </div>
                        <div className={'SecondaryColor H3 Bold'}>{ bitcoinStore.formatBtcInUsd(userEarningsEntity.btcEarnedInBtc) }</div>
                    </div>
                </StyledContainer>
                <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                    <div className={'B1 SemiBold'}>Total Contract Hash Power</div>
                    <div className={'FlexColumn ValueColumn'}>
                        <div>
                            <span className={'H2 Bold'}>{userEarningsEntity.totalContractHashPowerInTh}</span>
                            <span className={'H3 SecondaryColor'}> TH/S</span>
                        </div>
                        <div className={'SecondaryColor H3 Bold'}>{userEarningsEntity.formatTotalContractHashPowerInUsd()}</div>
                    </div>
                </StyledContainer>
            </div>
        </div>
    )
}

export default inject((stores) => stores)(observer(MyEarningsTab));

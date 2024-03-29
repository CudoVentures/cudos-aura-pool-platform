import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import UserProfilePageStore from '../../stores/UserProfilePageStore';
import WalletStore from '../../../../ledger/presentation/stores/WalletStore';
import CudosStore from '../../../../cudos-data/presentation/stores/CudosStore';
import BitcoinStore from '../../../../bitcoin-data/presentation/stores/BitcoinStore';

import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import ChartHeading from '../../../../analytics/presentation/components/ChartHeading';
import ChartInfo from '../../../../analytics/presentation/components/ChartInfo';
import DefaultIntervalPicker from '../../../../analytics/presentation/components/DefaultIntervalPicker';
import DailyChart from '../../../../analytics/presentation/components/DailyChart';

import '../../styles/my-earnings-tab.css';
import { formatTHs } from '../../../../core/utilities/NumberFormatter';

type Props = {
    bitcoinStore?: BitcoinStore
    userProfilePageStore?: UserProfilePageStore,
    walletStore?: WalletStore,
    cudosStore?: CudosStore,
}

function MyEarningsTab({ bitcoinStore, cudosStore, userProfilePageStore, walletStore }: Props) {
    const { userEarningsEntity, defaultIntervalPickerState } = userProfilePageStore;

    useEffect(() => {
        cudosStore.init();
        bitcoinStore.init();
    }, []);

    return (
        <div className={'MyEarningsTab FlexColumn'}>
            <StyledContainer containerPadding = { ContainerPadding.PADDING_24 }>
                <ChartHeading
                    leftContent = { (
                        <>
                            <ChartInfo label = { 'Total BTC Earnings'} value = { bitcoinStore.formatBtcInUsd(userEarningsEntity.totalEarningInBtc)} />
                            <ChartInfo label = { 'Total active NFTs owned'} value = { userEarningsEntity.totalNftBought.toString() } />
                        </>
                    ) }
                    rightContent = { (
                        <DefaultIntervalPicker defaultIntervalPickerState = { defaultIntervalPickerState } />
                    ) } />
                <DailyChart
                    timestampFrom = { defaultIntervalPickerState.earningsTimestampFrom }
                    timestampTo = { defaultIntervalPickerState.earningsTimestampTo }
                    data = { userEarningsEntity.getEarningsPerDayInBtcAsNumber() } />
            </StyledContainer>
            <div className={'Grid GridColumns3 BalancesDataContainer'}>
                <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                    <div className={'B1 SemiBold'}>Wallet Balance</div>
                    <div className={'FlexColumn ValueColumn'}>
                        <div>
                            <span className={'H2 Bold'}>{walletStore.formatBalanceInCudosInt()}<span className={'SecondaryColor'}>.{walletStore.formatBalanceInCudosFraction()}</span></span>
                            <span className={'H3 SecondaryColor'}> CUDOS</span>
                        </div>
                        <div className={'SecondaryColor H3 Bold'}>{cudosStore.formatCudosInUsd(walletStore.getBalanceSafe())}</div>
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
                    <div className={'B1 SemiBold'}>Total Hash Power</div>
                    <div className={'FlexColumn ValueColumn'}>
                        <div>
                            <span className={'H2 Bold'}>{formatTHs(userEarningsEntity.totalContractHashPowerInTh, false)}</span>
                            <span className={'H3 SecondaryColor'}> TH/s</span>
                        </div>
                    </div>
                </StyledContainer>
            </div>
        </div>
    )
}

export default inject((stores) => stores)(observer(MyEarningsTab));

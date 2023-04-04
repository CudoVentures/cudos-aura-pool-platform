import React from 'react';
import { observer } from 'mobx-react';

import TableState from '../../../core/presentation/stores/TableState';
import ViewNftPageStore from '../stores/ViewNftPageStore';

import Table, { createTableCell, createTableCellString, createTableRow } from '../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../core/presentation/components/TableDesktop';
import TextWithTooltip from '../../../core/presentation/components/TextWithTooltip';
import NavRowTabs, { createNavRowTab } from '../../../core/presentation/components/NavRowTabs';
import AnimationContainer from '../../../core/presentation/components/AnimationContainer';
import ChartHeading from '../../../analytics/presentation/components/ChartHeading';
import DailyChart from '../../../analytics/presentation/components/DailyChart';
import DefaultIntervalPicker from '../../../analytics/presentation/components/DefaultIntervalPicker';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';

import NftEventTable from '../../../analytics/presentation/components/NftEventTable';
import '../styles/nft-stats.css'

const EARNINGS_TABLE_LEGEND = ['', 'UTC Time', 'Local Time (-4:00 EDT)'];
const EARNINGS_ROW_LEGEND = ['FPPS Calculation Period', 'Earnings Posting Time', 'Daily Payout Window', 'Minimum Daily Auto-withdraw'];
const EARNINGS_ROW_LEGEND_TOOLTIP = ['TOOLTIP', 'TOOLTIP', 'TOOLTIP', 'TOOLTIP'];
const EARNINGS_TABLE_WIDTHS = ['40%', '30%', '30%']
const EARNINGS_TABLE_ALINGS = [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT];

type Props = {
    viewNftPageStore: ViewNftPageStore;
}

function NftStats({ viewNftPageStore }: Props) {

    const defaultIntervalPickerState = viewNftPageStore.defaultIntervalPickerState;

    function renderEarningsRows() {
        const rows = [];

        for (let i = 0; i < 4; i++) {
            rows.push(
                createTableRow([
                    createTableCell((
                        <TextWithTooltip text={EARNINGS_ROW_LEGEND[i]} tooltipText={EARNINGS_ROW_LEGEND_TOOLTIP[i]} />
                    )),
                    createTableCellString('00:00 - 23:59'),
                    createTableCellString('20:00 - 19:59'),
                ]),
            )
        }

        return rows;
    }

    return (
        <div className={'NftStats FlexColumn'}>
            <NavRowTabs navTabs={[
                createNavRowTab('Reward Statistics', viewNftPageStore.isTabEarnings(), viewNftPageStore.onChangeTabEarnings),
                // createNavRowTab('Earnings Info', viewNftPageStore.isTabInfo(), viewNftPageStore.onChangeTabInfo),
                createNavRowTab('History', viewNftPageStore.isTabHistory(), viewNftPageStore.onChangeTabHistory),
            ]} />
            <div className={'HistoryContainer FlexColumn'}>
                <AnimationContainer active = { viewNftPageStore.isTabEarnings()} >
                    { viewNftPageStore.nftEarningsEntity === null ? (
                        <LoadingIndicator />
                    ) : (
                        <>
                            <ChartHeading
                                leftContent = { (
                                    <div className={'FlexRow GapCnt'}>
                                        <div className={'H3 Bold'}>Daily Rewards (BTC)</div>
                                        <div>Net Earnings</div>
                                    </div>
                                ) }
                                rightContent = { (
                                    <DefaultIntervalPicker defaultIntervalPickerState = { defaultIntervalPickerState } />
                                ) } />
                            <DailyChart
                                className = { 'RewardsHistoryChart' }
                                timestampFrom = { defaultIntervalPickerState.earningsTimestampFrom }
                                timestampTo = { defaultIntervalPickerState.earningsTimestampTo }
                                data = { viewNftPageStore.nftEarningsEntity.getEarningsForChart() } />
                        </>
                    ) }
                </AnimationContainer>
                <AnimationContainer active = { viewNftPageStore.isTabInfo() } >
                    <>
                        <div className={'HistoryContainerHeader'}>
                            <div className={'H3 Bold'}>Earnings Info</div>
                        </div>
                        <Table
                            className={'EarningsTable'}
                            legend={EARNINGS_TABLE_LEGEND}
                            widths={EARNINGS_TABLE_WIDTHS}
                            aligns={EARNINGS_TABLE_ALINGS}
                            tableState={new TableState(0, [], () => {}, 5)}
                            rows={renderEarningsRows()}
                        />
                    </>
                </AnimationContainer>
                <AnimationContainer active = { viewNftPageStore.isTabHistory() } >
                    <>
                        <div className={'HistoryContainerHeader'}>
                            <div className={'H3 Bold'}>History</div>
                        </div>
                        <NftEventTable
                            className = { 'HistoryTable' }
                            tableState = { viewNftPageStore.historyTableState }
                            nftEventEntities = { viewNftPageStore.nftEventEntities }
                            showItem = { false } />
                    </>
                </AnimationContainer>
            </div>
        </div>
    )
}

export default observer(NftStats);

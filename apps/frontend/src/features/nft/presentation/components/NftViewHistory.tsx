import React, { useState } from 'react';
import S from '../../../../core/utilities/Main';
import LaunchIcon from '@mui/icons-material/Launch';

import SvgEthereum from '../../../../public/assets/vectors/ethereum-logo.svg';

import '../styles/nft-view-history.css'
import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import TableState from '../../../../core/presentation/stores/TableState';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import TextWithTooltip from '../../../../core/presentation/components/TextWithTooltip';
import Svg from '../../../../core/presentation/components/Svg';
import NavRowTabs, { createNavRowTab } from '../../../../core/presentation/components/NavRowTabs';
import ExtendedChart from '../../../../core/presentation/components/ExtendedChart';
import ViewNftPageStore from '../stores/ViewNftPageStore';

const PAGE_STATISTICS = 0;
const PAGE_EARNINGS = 1;
const PAGE_HISTORY = 2;

const EARNINGS_TABLE_LEGEND = ['', 'UTC Time', 'Local Time (-4:00 EDT)'];
const EARNINGS_ROW_LEGEND = ['FPPS Calculation Period', 'Earnings Posting Time', 'Daily Payout Window', 'Minimum Daily Auto-withdraw'];
const EARNINGS_ROW_LEGEND_TOOLTIP = ['TOOLTIP', 'TOOLTIP', 'TOOLTIP', 'TOOLTIP'];
const EARNINGS_TABLE_WIDTHS = ['40%', '30%', '30%']
const EARNINGS_TABLE_ALINGS = [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT];

const HISTORY_TABLE_LEGEND = ['Event', 'Price', 'From', 'To', 'Date'];
const HISTORY_TABLE_WIDTHS = ['20%', '20%', '20%', '20%', '20%']
const HISTORY_ROW_LEGEND = ['Transfer', 'Sale', 'Transfer', 'Minted'];
const HISTORY_TABLE_ALINGS = [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT];

type Props = {
    viewNftPageStore: ViewNftPageStore;
}

export default function NftViewHistory({ viewNftPageStore }: Props) {
    const [historyPage, setHistoryPage] = useState(PAGE_EARNINGS);

    return (
        <div className={'NftPreviewHistory FlexColumn'}>
            <NavRowTabs navTabs={[
                createNavRowTab('Reward Statistics', historyPage === PAGE_STATISTICS, () => setHistoryPage(PAGE_STATISTICS)),
                createNavRowTab('Earnings Info', historyPage === PAGE_EARNINGS, () => setHistoryPage(PAGE_EARNINGS)),
                createNavRowTab('History', historyPage === PAGE_HISTORY, () => setHistoryPage(PAGE_HISTORY)),
            ]} />
            <div className={'HistoryContainer FlexColumn'}>
                {historyPage === PAGE_STATISTICS && (
                    <ExtendedChart
                        className = { 'RewardsHistoryChart' }
                        headerItems={
                            <div className={'FlexRow GapCnt'}>
                                <div className={'H3 Bold'}>Daily Rewards (BTC)</div>
                                <div>Net Earnings</div>
                            </div>
                        }
                        extendedChartState={ viewNftPageStore.extendedChartState } />
                )}
                {historyPage === PAGE_EARNINGS && (
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
                )}
                {historyPage === PAGE_HISTORY && (
                    <>
                        <div className={'HistoryContainerHeader'}>
                            <div className={'H3 Bold'}>History</div>
                        </div>
                        <Table
                            className={'HistoryTable'}
                            legend={HISTORY_TABLE_LEGEND}
                            widths={HISTORY_TABLE_WIDTHS}
                            aligns={HISTORY_TABLE_ALINGS}
                            tableState={new TableState(0, [], () => {}, 5)}
                            rows={renderHistoryRows()}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

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

function renderHistoryRows() {
    const rows = [];

    for (let i = 0; i < 4; i++) {
        rows.push(
            createTableRow([
                createTableCellString(HISTORY_ROW_LEGEND[i]),
                createTableCell((
                    <div className={'FlexRow GapCnt'}>
                        <Svg svg={SvgEthereum} />
                        1.65 ETH
                    </div>
                )),
                createTableCellString('Harley'),
                createTableCellString('IDK'),
                createTableCell((
                    <div className = { 'FlexRow GapCnt' }>
                        3 months ago
                        <Svg svg={LaunchIcon} />
                    </div>
                )),
            ]),
        );
    }

    return rows;
}

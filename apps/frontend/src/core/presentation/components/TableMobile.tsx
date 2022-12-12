import React, { useState } from 'react';
import { observer } from 'mobx-react';

import TableRow from '../../entities/TableRow';
import S from '../../utilities/Main';
import TableState from '../stores/TableState';

import TablePaging from './TablePaging';
import Popover from './Popover';

import ArrowDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowUpIcon from '@mui/icons-material/ArrowDropUp';
import '../styles/table-mobile.css';

export type TableMobileProps = {
    className?: string;
    legend: any[];
    tableState: TableState;
    rows: TableRow[];
    onClickRow?: (i: number) => void,
    onClickLegend?: (sortKey: number, i: number) => void;
    firstRowActionIndex?: number,
    lastRowActionIndex?: number,
    itemsSize?: number,
    showPaging?: boolean,
}

function TableMobile({ className, legend, tableState, rows, onClickRow, onClickLegend, firstRowActionIndex, lastRowActionIndex, itemsSize, showPaging }: TableMobileProps) {

    const [sortDropDownOpened, setSortDropDownOpened] = useState(false);
    const [sortDropDownAnchor, setSortDropDownAnchor] = useState(null);

    function onToggleSortDropDown(e) {
        if (sortDropDownOpened === false) {
            setSortDropDownAnchor(e.target);
        }
        setSortDropDownOpened(!sortDropDownOpened);
        e.stopPropagation();
    }

    function onCloseSortDropDown(e) {
        setSortDropDownOpened(false);
        if (e !== undefined) {
            e.stopPropagation();
        }
    }

    function onClickLegendCell(index: number) {
        if (tableState.isTableSortIndexClickable(index) === false) {
            return;
        }

        const sortKey = tableState.getTableSortKey(index);
        if (Math.abs(tableState.tableFilterState.sortKey) === sortKey) {
            tableState.updateTableSortDirection();
        } else {
            tableState.updateTableSort(sortKey);
        }

        if (onClickLegend !== null) {
            onClickLegend(tableState.tableFilterState.sortKey, index);
        }
    }

    function onClickRowHandler(rowIndex: number) {
        if (onClickRow !== null) {
            onClickRow(rowIndex);
        }
    }

    function renderLegend() {
        const tableSortIndex = tableState.getTableSortIndex();
        const sortOptions = [];

        for (let i = 0; i < legend.length; ++i) {
            if (tableState.isTableSortIndexClickable(i) === false) {
                continue;
            }

            sortOptions.push((
                <div key = { i } onClick = { onClickLegendCell.bind(null, i) } >
                    { legend[i] }
                </div>
            ));
        }

        return (
            <div className = { 'TableRow Legend' } >
                <div className = { 'TableCell' } >
                    <div> { legend[0] } </div>
                    <div onClick = { onToggleSortDropDown }>
                        { sortOptions.length > 0 && (
                            <>
                                { tableSortIndex === S.NOT_EXISTS && (
                                    'Sort by'
                                ) }
                                { tableSortIndex !== S.NOT_EXISTS && (
                                    <div className = { 'FlexRow' } >
                                        <div>
                                        orted by&nbsp;
                                            { legend[tableSortIndex] }
                                        </div>
                                        { renderSortArrow(tableSortIndex) }
                                    </div>
                                ) }
                                <Popover
                                    open = { sortDropDownOpened }
                                    anchorEl = { sortDropDownAnchor }
                                    onClose = { onCloseSortDropDown }
                                    anchorOrigin = { {
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    } } >

                                    <div className = { 'TableMobileHeaderSortOptions' } >
                                        { sortOptions }
                                    </div>

                                </Popover>
                            </>
                        ) }
                    </div>
                </div>
            </div>
        )
    }

    function renderSortArrow(index: number) {
        const sortIndex = tableState.getTableSortIndex();
        if (sortIndex !== index) {
            return null;
        }

        return tableState.tableFilterState.sortKey > 0 ? <ArrowUpIcon/> : <ArrowDownIcon/>;
    }

    function renderRows() {
        if (rows.length === 0) {
            return (
                <div className = { 'Empty FlexSingleCenter' } > No data </div>
            );
        }

        const resultRows = [];
        itemsSize = itemsSize === S.NOT_EXISTS ? legend.length : itemsSize;

        for (let i = 0; i < rows.length; ++i) {
            const cells = rows[i].cells;

            const resultRow = [
                (
                    <div
                        key = { 0 }
                        className = { 'TableCell FlexRow' } >

                        <div> { cells[0].content } </div>
                        { firstRowActionIndex !== S.NOT_EXISTS && (
                            <div> { cells[firstRowActionIndex].content } </div>
                        )}

                    </div>
                ),
            ]

            for (let j = 1; j < itemsSize; ++j) {
                resultRow.push((
                    <div
                        key = { j }
                        className = { 'TableCell FlexRow' } >

                        <div> { legend[j] } </div>
                        <div> { cells[j].content } </div>

                    </div>
                ));
            }

            resultRows.push((
                <div key = { i } className = { `TableRow Transition ${rows[i].rowClassName} ` } onClick = { onClickRowHandler.bind(null, i) } > { resultRow } </div>
            ));
        }

        return resultRows;
    }

    return (
        <div className = { `Table TableMobile ${className}` } >
            { renderLegend() }
            { renderRows() }
            { showPaging === true && (
                <TablePaging tableState = { tableState } />
            ) }
        </div>
    )

}

TableMobile.defaultProps = {
    className: S.Strings.EMPTY,
    onClickRow: null,
    onClickLegend: null,
    firstRowActionIndex: S.NOT_EXISTS,
    lastRowActionIndex: S.NOT_EXISTS,
    itemsSize: S.NOT_EXISTS,
    showPaging: true,
};

export default observer(TableMobile);

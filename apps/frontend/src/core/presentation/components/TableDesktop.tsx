import React from 'react';
import { observer } from 'mobx-react';

import S from '../../utilities/Main';

import TableState from '../stores/TableState';
import TablePaging from './TablePaging';
import Scrollable from './Scrollable';
import TableRow from '../../entities/TableRow';

import ArrowDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowUpIcon from '@mui/icons-material/ArrowDropUp';
import '../styles/table-desktop.css';

export type TableDesktopProps = {
    className?: string;
    widths: string[];
    legend: string[];
    aligns?: number[];
    tableState: TableState;
    rows: TableRow[];
    columnsOrderMap?: Map < number, number >;
    onChangeColumnsOrderIndex?: (oldIndex: number, newIndex: number) => void;
    onClickRow?: (i: number) => void;
    onClickLegend?: (sortKey: number, i: number) => void;
    showPaging?: boolean;
    contentScrollable?: boolean;
    noRowsContent?: JSX.Element;
}

export const ALIGN_LEFT = 1;
export const ALIGN_CENTER = 2;
export const ALIGN_RIGHT = 3;

const TableDesktop = ({ className, widths, legend, aligns, tableState, rows, columnsOrderMap, onChangeColumnsOrderIndex, onClickRow, onClickLegend, showPaging, contentScrollable, noRowsContent }: TableDesktopProps) => {

    function getCellStyle(index: number) {
        return {
            'width': widths[index],
        };
    }

    function getCellAlign(index: number) {
        if (aligns === null) {
            return S.Strings.EMPTY;
        }

        switch (aligns[index]) {
            case ALIGN_CENTER:
                return 'TableCellAlignCenter';
            case ALIGN_RIGHT:
                return 'TableCellAlignRight';
            case ALIGN_LEFT:
            default:
                return 'TableCellAlignLeft';
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

    function onLegendDragStart(i: number, e) {
        e.dataTransfer.setData('index', i);
    }

    function onLegendDragEnter(e) {
        e.preventDefault();
    }

    function onLegendDragLeave(e) {
        hideDropCursor(e);
    }

    function onLegendDragOver(e) {
        e.preventDefault();
        showDropCursor(e);
        positionDropCursor(e);
    }

    function onDrop(i: number, e) {
        hideDropCursor(e);

        const oldIndex = parseInt(e.dataTransfer.getData('index'));
        if (i === oldIndex) {
            return;
        }

        let newIndex;
        if (i < oldIndex) { // moving to the left
            newIndex = isLeftPartOfTheCell(e) === true ? i : i + 1;
        } else if (i > oldIndex) { // moving to the right
            newIndex = isLeftPartOfTheCell(e) === true ? i - 1 : i;
        }

        if (onChangeColumnsOrderIndex !== null) {
            onChangeColumnsOrderIndex(oldIndex, newIndex);
        }
    }

    function renderLegend() {
        const legendRow = [];

        for (let k = 0; k < legend.length; ++k) {
            const draggable = k !== 0 && columnsOrderMap !== null;
            const i = columnsOrderMap === null ? k : columnsOrderMap.get(k);
            legendRow.push((
                <div
                    key = { i }
                    className = { `TableCell FlexRow ${getCellAlign(i)} ${S.CSS.getClassName(tableState.isTableSortIndexClickable(i), 'Clickable')} ${S.CSS.getClassName(tableState.getTableSortIndex() === i, 'Sorted')}` }
                    style = { getCellStyle(i) }
                    onClick = { onClickLegendCell.bind(null, i) }
                    draggable = { draggable }
                    onDragStart = { draggable === false ? undefined : onLegendDragStart.bind(null, k) }
                    onDragEnter = { draggable === false ? undefined : onLegendDragEnter }
                    onDragLeave = { draggable === false ? undefined : onLegendDragLeave }
                    onDragOver = { draggable === false ? undefined : onLegendDragOver }
                    onDrop = { draggable === false ? undefined : onDrop.bind(null, k) } >

                    { legend[i] }
                    { renderSortArrow(i) }

                </div>
            ))
        }

        return (
            <div className = { 'TableRow Legend' } > { legendRow } </div>
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
                <div className = { 'Empty FlexSingleCenter' } > {noRowsContent ?? 'Няма намерени резултати'} </div>
            );
        }

        const tableSortIndex = tableState.getTableSortIndex();
        const resultRows = [];

        for (let i = 0; i < rows.length; ++i) {
            const row = rows[i]

            const resultRow = [];

            const cells = row.cells;
            for (let k = 0; k < cells.length; ++k) {
                const j = columnsOrderMap === null ? k : columnsOrderMap.get(k);
                resultRow.push((
                    <div key = { j } className = { `TableCell FlexRow ${getCellAlign(j)} ${S.CSS.getClassName(tableSortIndex === j, 'Sorted')}` } style = { getCellStyle(j) } > { cells[j].content } </div>
                ))
            }
            resultRows.push((
                <div key = { i } className = { `TableRow Transition ${row.rowClassName} ` } onClick = { onClickRowHandler.bind(null, i) } > { resultRow } </div>
            ));
        }

        if (contentScrollable === true) {
            return (
                <Scrollable classNameContent = { 'FlexColumn' }>{resultRows}</Scrollable>
            );
        }

        return resultRows;
    }

    return (
        <div className = { `Table TableDesktop ${S.CSS.getClassName(contentScrollable, 'ContentScrollable')} ${className}` } >
            { renderLegend() }
            { renderRows() }
            { showPaging === true && (
                <TablePaging tableState = { tableState } />
            ) }
        </div>
    )

}

TableDesktop.defaultProps = {
    className: S.Strings.EMPTY,
    aligns: null,
    onClickRow: null,
    showPaging: true,
    contentScrollable: false,
    columnsOrderMap: null,
    onChangeColumnsOrderIndex: null,
};

export default observer(TableDesktop);

// drop & drop helper functions
function getTableCell(e) {
    let tableCell = e.target;
    while ((tableCell instanceof HTMLElement) === false || S.CSS.hasClass(tableCell, 'TableCell') === false) {
        tableCell = tableCell.parentNode;
        if (tableCell === document.body) {
            return null;
        }
    }

    return tableCell;
}

function isLeftPartOfTheCell(e, tableCell = null) {
    tableCell = tableCell ?? getTableCell(e);
    if (tableCell === null) {
        return false;
    }

    const mouseX = e.screenX;
    const cellLeftX = S.getScreenX(tableCell);
    const cellMiddle = cellLeftX + (tableCell.offsetWidth >> 1);

    return cellLeftX < mouseX && mouseX < cellMiddle;
}

function showDropCursor(e) {
    const tableCell = getTableCell(e);
    if (tableCell === null) {
        return;
    }

    S.CSS.addClass(tableCell, 'DropTarget');
}

function hideDropCursor(e) {
    const tableCell = getTableCell(e);
    if (tableCell === null) {
        return;
    }

    S.CSS.removeClass(tableCell, 'DropTarget');
    S.CSS.removeClass(tableCell, 'DropTargetLeft');
    S.CSS.removeClass(tableCell, 'DropTargetRight');
}

function positionDropCursor(e) {
    const tableCell = getTableCell(e);
    if (tableCell === null) {
        return;
    }

    if (isLeftPartOfTheCell(e, tableCell) === true) {
        S.CSS.addClass(tableCell, 'DropTargetLeft');
        S.CSS.removeClass(tableCell, 'DropTargetRight');
    } else {
        S.CSS.removeClass(tableCell, 'DropTargetLeft');
        S.CSS.addClass(tableCell, 'DropTargetRight');
    }
}

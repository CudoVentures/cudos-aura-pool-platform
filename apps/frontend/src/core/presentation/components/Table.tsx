import React from 'react';

import S from '../../utilities/Main';
import TableCell from '../../entities/TableCell';
import TableRow from '../../entities/TableRow';

import TableDesktop, { TableDesktopProps } from './TableDesktop';
import TableMobile, { TableMobileProps } from './TableMobile';

import '../styles/table.css';

export type Props = TableDesktopProps & TableMobileProps;

export default function Table(props: Props) {

    return (
        <>
            <TableDesktop
                className = { props.className }
                widths = { props.widths }
                legend = { props.legend }
                aligns = { props.aligns }
                tableState = { props.tableState }
                onClickRow = { props.onClickRow }
                onClickLegend = { props.onClickLegend }
                rows = { props.rows }
                columnsOrderMap = { props.columnsOrderMap }
                showPaging = { props.showPaging }
                contentScrollable = { props.contentScrollable }
                noRowsContent={ props.noRowsContent }
                onChangeColumnsOrderIndex = { props.onChangeColumnsOrderIndex } />

            <TableMobile
                className = { props.className }
                legend = { props.legend }
                tableState = { props.tableState }
                onClickRow = { props.onClickRow }
                onClickLegend = { props.onClickLegend }
                rows = { props.rows}
                firstRowActionIndex = { props.firstRowActionIndex }
                lastRowActionIndex = { props.lastRowActionIndex }
                itemsSize = { props.itemsSize }
                showPaging = { props.showPaging } />
        </>
    )

}

export function createTableRow(cells: TableCell[], rowClassNameName: string = S.Strings.EMPTY) {
    return new TableRow(cells, rowClassNameName);
}

export function createTableCell(content: any, sortValue: any = null) {

    if (sortValue === null) {
        sortValue = content;
    }

    return new TableCell(content, sortValue);
}

export function createTableCellString(content: string, className = S.Strings.EMPTY) {

    const cellNode = (
        <span className = { `Dots ${className}` } title = { content } > { content } </span>
    );

    return createTableCell(cellNode, content);
}

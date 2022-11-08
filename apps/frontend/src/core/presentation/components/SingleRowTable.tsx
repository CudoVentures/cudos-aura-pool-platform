import React from 'react';

import Table, { createTableCell, createTableRow, Props as TableProps } from './Table';

import '../styles/single-row-table.css';

type Props = TableProps & {
    content: any
}

export default function SingleRowTable(props: Props) {
    return (
        <Table
            {...props}
            rows={[
                createTableRow([
                    createTableCell(props.content),
                ]),
            ]}
            className={`SingleRowTable ${props.className}`} />
    )
}

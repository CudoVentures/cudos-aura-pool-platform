import React from 'react';
import { observer } from 'mobx-react';

import NftEventEntity from '../../entities/NftEventEntity';

import Table, { createTableRow, createTableCell, createTableCellString } from '../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../core/presentation/components/TableDesktop';
import TableState from '../../../core/presentation/stores/TableState';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import NftEntity from '../../../nft/entities/NftEntity';

import '../styles/nft-event-table.css';

type Props = {
    className?: string;
    tableState: TableState;
    nftEventEntities: NftEventEntity[];
    getNftEntityById?: (nftId: string) => NftEntity;
    showItem?: boolean;
}

function NftEventTable({ className, tableState, nftEventEntities, getNftEntityById, showItem }: Props) {

    function getLegend() {
        const legend = ['Wallet Address', 'Last Activity'];

        if (showItem === true) {
            legend.push('Item');
        }

        return legend.concat(['Price', 'Quantity', 'To', 'Time']);
    }

    function getWidths() {
        if (showItem === true) {
            return ['14%', '12%', '18%', '14%', '12%', '14%', '16%'];
        }

        return ['17%', '15%', '17%', '15%', '17%', '19%'];
    }

    function getAligns() {
        const aligns = [ALIGN_LEFT, ALIGN_LEFT];

        if (showItem === true) {
            aligns.push(ALIGN_LEFT);
        }

        return aligns.concat([ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]);
    }

    function renderCollectionsRows() {
        return nftEventEntities.map((nftEventEntity: NftEventEntity) => {
            const tableCells = [
                createTableCell((
                    <div className={'Bold Dots AddressCell'}>{nftEventEntity.fromAddress}</div>
                )),
                createTableCellString(nftEventEntity.getEventActivityDisplayName()),
            ]

            if (showItem === true) {
                const nftEntity = getNftEntityById(nftEventEntity.nftId);

                tableCells.push(createTableCell((
                    <div className={'FlexRow ItemCell'}>
                        <div className={'PicturePreview'} style={ ProjectUtils.makeBgImgStyle(nftEntity?.imageUrl) } />
                        <div>{nftEntity?.name}</div>
                    </div>
                )))
            }

            return createTableRow(
                tableCells.concat([
                    createTableCell((
                        <div className={'FlexColumn'}>
                            {nftEventEntity.hasPrice() === true && (<>
                                <div className={'B2 Bold'}>{nftEventEntity.formatTransferPriceInCudos()}</div>
                                <div className={'B3 SemiBold'}>{nftEventEntity.formatTransferPriceInUsd()}</div>
                            </>)}
                            {nftEventEntity.hasPrice() === false && (
                                'N/A'
                            )}
                        </div>
                    )),
                    createTableCellString(nftEventEntity.quantity.toString()),
                    createTableCell((
                        <div className={'Bold Dots AddressCell'}>{nftEventEntity.toAddress}</div>
                    )),
                    createTableCellString(nftEventEntity.getTimePassedDisplay()),
                ]),
            );
        });
    }

    return (
        <Table
            className={`NftEventTable ${className}`}
            legend={getLegend()}
            widths={getWidths()}
            aligns={getAligns()}
            tableState={tableState}
            rows={renderCollectionsRows()} />
    )

}

NftEventTable.defaultProps = {
    className: '',
    getNftEntityById: null,
    showItem: true,
}

export default observer(NftEventTable);

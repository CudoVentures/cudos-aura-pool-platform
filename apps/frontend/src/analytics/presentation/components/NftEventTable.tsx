import React from 'react';
import { observer } from 'mobx-react';

import NftEventEntity, { NftEventType } from '../../entities/NftEventEntity';

import Table, { createTableRow, createTableCell, createTableCellString } from '../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../core/presentation/components/TableDesktop';
import TableState from '../../../core/presentation/stores/TableState';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import NftEntity from '../../../nft/entities/NftEntity';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';

import SvgOpenLink from '../../../public/assets/vectors/open-link.svg';
import SvgCudosLogo from '../../../public/assets/vectors/cudos-logo.svg';
import SvgNftEventMint from '../../../public/assets/vectors/nft-event-mint.svg';
import SvgNftEventTransfer from '../../../public/assets/vectors/nft-event-transfer.svg';
import SvgNftEventSale from '../../../public/assets/vectors/nft-event-sale.svg';
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
        const legend = ['Event', 'Price', 'From', 'To', 'Time']

        if (showItem === true) {
            legend.splice(2, 0, 'Item');
        }

        return legend;
    }

    function getWidths() {
        if (showItem === true) {
            return ['12%', '14%', '18%', '20%', '20%', '16%'];
        }

        return ['15%', '18%', '24%', '24%', '19%'];
    }

    function getAligns() {
        const aligns = [ALIGN_LEFT, ALIGN_LEFT];

        if (showItem === true) {
            aligns.push(ALIGN_LEFT);
        }

        return aligns.concat([ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]);
    }

    function renderCollectionsRows() {
        return nftEventEntities ? nftEventEntities.map((nftEventEntity: NftEventEntity) => {
            const tableCells = [
                // EVENT
                createTableCell((
                    <div className = { 'EventTypeCell FlexRow' } >
                        <Svg className = { 'SvgEventType' } svg = { getNftEventIconByType(nftEventEntity.eventType) } />
                        {nftEventEntity.getEventActivityDisplayName()}
                    </div>
                )),
                // PRICE
                createTableCell((
                    <div className={'PriceCell FlexColumn'}>
                        {nftEventEntity.hasPrice() === true && (
                            <>
                                <div className={'B2 Bold'}>
                                    <Svg className = { 'SvgCudosPrice' } svg = { SvgCudosLogo } size = { SvgSize.CUSTOM } />
                                    {nftEventEntity.formatTransferPriceInCudos()}
                                </div>
                                <div className={'B3 SemiBold'}>{nftEventEntity.formatTransferPriceInUsd()}</div>
                            </>
                        )}
                        {nftEventEntity.hasPrice() === false && (
                            'N/A'
                        )}
                    </div>
                )),
                // FROM
                createTableCell((
                    <div className={'Bold Dots AddressCell'} title={nftEventEntity.fromAddress}>{nftEventEntity.formatFromAddress()}</div>
                )),
                // TO
                createTableCell((
                    <div className={'Bold Dots AddressCell'} title={nftEventEntity.toAddress}>{nftEventEntity.toAddress}</div>
                )),
                // TIME
                createTableCell((
                    <div className = { 'TimeAndTxLinkCell FlexRow ColorNeutral060' } >
                        { nftEventEntity.getTimePassedDisplay() }
                        <a href = { ProjectUtils.makeUrlExplorerByTxHash(nftEventEntity.txHash) } target='_blank' rel="noreferrer">
                            <Svg svg = { SvgOpenLink } />
                        </a>
                    </div>
                )),

            ]

            // ITEM
            if (showItem === true) {
                const nftEntity = getNftEntityById(nftEventEntity.nftId);
                tableCells.splice(2, 0, createTableCell((
                    <div className={'FlexRow ItemCell'}>
                        <div className={'PicturePreview'} style={ProjectUtils.makeBgImgStyle(nftEntity?.imageUrl)} />
                        <div>{nftEntity?.name}</div>
                    </div>
                )));
            }

            return createTableRow(tableCells);
        }) : [];
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

function getNftEventIconByType(nftEventType: NftEventType) {
    switch (nftEventType) {
        case NftEventType.SALE:
            return SvgNftEventSale;
        case NftEventType.TRANSFER:
            return SvgNftEventTransfer;
        case NftEventType.MINT:
        default:
            return SvgNftEventMint;
    }
}

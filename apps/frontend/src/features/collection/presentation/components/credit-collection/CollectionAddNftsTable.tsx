import { inject, observer } from 'mobx-react';
import React from 'react';
import NftEntity from '../../../../nft/entities/NftEntity';
import SvgGridNoContent from '../../../../../public/assets/vectors/grid-no-content.svg';
import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableRow } from '../../../../../core/presentation/components/Table';
import Actions, { ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonType } from '../../../../../core/presentation/components/Button';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Svg from '../../../../../core/presentation/components/Svg';
import TableState from '../../../../../core/presentation/stores/TableState';
import CreditCollectionStore from '../../stores/CreditCollectionStore';

type Props = {
    creditCollectionStore?: CreditCollectionStore;
}

function CollectionAddNftsTable({ creditCollectionStore }: Props) {
    const collectionName = creditCollectionStore.collectionEntity.name;
    const nftEntities = creditCollectionStore.nftEntities;

    const TABLE_LEGEND = ['NFT', 'Name', 'Collection', 'Hashing Power', 'Price', 'Maintenance Fee', 'Action'];
    const TABLE_WIDTHS = ['5%', '15%', '17%', '12%', '12%', '12%', '12%', '15%']
    const TABLE_ALINGS = [
        ALIGN_CENTER,
        ALIGN_LEFT,
        ALIGN_LEFT,
        ALIGN_LEFT,
        ALIGN_LEFT,
        ALIGN_CENTER,
        ALIGN_LEFT,
    ]

    function renderFarmsRows() {
        const rows = [];

        nftEntities.forEach((nftEntity) => {
            const rowCells = [];
            rowCells.push(createTableCell(
                <div className={'NftTableImage'}
                    style={{
                        backgroundImage: `url("${nftEntity.imageUrl}")`,
                    }}
                />,
                0,
            ));
            rowCells.push(createTableCell(nftEntity.name, 0));
            rowCells.push(createTableCell(collectionName, 0));
            rowCells.push(createTableCell(nftEntity.getHashPowerDisplay(), 0));
            rowCells.push(createTableCell(nftEntity.getPriceDisplay(), 0));
            rowCells.push(createTableCell(nftEntity.getMaintenanceFeeDisplay(), 0));
            rowCells.push(createTableCell(
                <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT}>
                    <Button onClick={() => creditCollectionStore.onClickEditNft(nftEntity.id)} type={ButtonType.TEXT_INLINE}>
                        <Svg svg={BorderColorIcon} />
                        Edit
                    </Button>
                    <Button onClick={() => creditCollectionStore.onClickDeleteNft(nftEntity.id)} type={ButtonType.TEXT_INLINE}>
                        <Svg svg={DeleteForeverIcon} />
                        Delete
                    </Button>
                </Actions>,
                0,
            ));
            rows.push(createTableRow(rowCells));
        })

        return rows;
    }

    return (
        <>
            <div className={'H2 Bold'}>Added NFTs ({nftEntities.length})</div>
            <Table
                className={''}
                legend={TABLE_LEGEND}
                widths={TABLE_WIDTHS}
                aligns={TABLE_ALINGS}
                tableState={new TableState(0, [], () => {}, Number.MAX_SAFE_INTEGER)}
                rows={renderFarmsRows()}
                noRowsContent={<EmptyTableContent />}
            />
        </>
    )

    function EmptyTableContent() {
        return (
            <div className={'NoContentFound FlexColumn'}>
                <div className={'H3 Bold'}>No Items Yet</div>
                <div className={'B1'}>Looks like you haven’t added anything</div>
            </div>
        )
    }
}

export default inject((stores) => stores)(observer(CollectionAddNftsTable));

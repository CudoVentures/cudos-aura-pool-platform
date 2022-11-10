import React from 'react';
import { inject, observer } from 'mobx-react';

import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableRow } from '../../../../../core/presentation/components/Table';
import Actions, { ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonType } from '../../../../../core/presentation/components/Button';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Svg from '../../../../../core/presentation/components/Svg';
import TableState from '../../../../../core/presentation/stores/TableState';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import ProjectUtils from '../../../../../core/utilities/ProjectUtils';

import '../../styles/credit-collection-add-nfts-table.css';

type Props = {
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionAddNftsTable({ creditCollectionStore }: Props) {
    const collectionName = creditCollectionStore.collectionEntity.name;
    const nftEntities = creditCollectionStore.nftEntities;

    const TABLE_LEGEND = ['NFT', 'Name', 'Collection', 'Hashing Power', 'Price', 'Action'];
    const TABLE_WIDTHS = ['10%', '22%', '22%', '15%', '15%', '16%']
    const TABLE_ALINGS = [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT];

    function renderFarmsRows() {
        const rows = [];

        nftEntities.forEach((nftEntity) => {
            const rowCells = [
                createTableCell(<div className={'NftTableImage ImgContainNode'} style={ ProjectUtils.makeBgImgStyle(nftEntity.imageUrl)} />),
                createTableCell(nftEntity.name),
                createTableCell(collectionName),
                createTableCell(nftEntity.formatHashPowerInTh()),
                createTableCell(nftEntity.formatPriceInCudos()),
                // createTableCell(nftEntity.formatMaintenanceFeeInBtc()),
                createTableCell(
                    <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT}>
                        <Button onClick={creditCollectionStore.onClickEditNft.bind(creditCollectionStore, nftEntity)} type={ButtonType.TEXT_INLINE}>
                            <Svg svg={BorderColorIcon} />
                            Edit
                        </Button>
                        <Button onClick={() => creditCollectionStore.onClickDeleteNft(nftEntity.id)} type={ButtonType.TEXT_INLINE}>
                            <Svg svg={DeleteForeverIcon} />
                            Delete
                        </Button>
                    </Actions>,
                ),
            ];
            rows.push(createTableRow(rowCells));
        })

        return rows;
    }

    return (
        <div className = { 'CreditCollectionAddNftsTable' }>
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
        </div>
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

export default inject((stores) => stores)(observer(CreditCollectionAddNftsTable));

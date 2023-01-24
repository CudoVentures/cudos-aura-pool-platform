import React from 'react';
import { inject, observer } from 'mobx-react';

import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableRow } from '../../../../core/presentation/components/Table';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonType } from '../../../../core/presentation/components/Button';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Svg from '../../../../core/presentation/components/Svg';
import TableState from '../../../../core/presentation/stores/TableState';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import SvgGridNoContent from '../../../../public/assets/vectors/no-data-small.svg';
import '../../styles/credit-collection-add-nfts-table.css';
import CudosStore from '../../../../cudos-data/presentation/stores/CudosStore';

type Props = {
    creditCollectionStore?: CreditCollectionStore;
    cudosStore: CudosStore
}

function CreditCollectionAddNftsTable({ cudosStore, creditCollectionStore }: Props) {
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
                createTableCell(cudosStore.formatPriceInCudosForNft(nftEntity)),
                // createTableCell(nftEntity.formatMaintenanceFeeInBtc()),
                createTableCell(
                    <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT}>
                        <Button onClick={creditCollectionStore.onClickEditNft.bind(creditCollectionStore, nftEntity)} type={ButtonType.TEXT_INLINE}>
                            <Svg svg={BorderColorIcon} />
                            Edit
                        </Button>
                        { creditCollectionStore.selectedNftEntity.id !== nftEntity.id && (
                            <Button onClick={() => creditCollectionStore.onClickDeleteNft(nftEntity.id)} type={ButtonType.TEXT_INLINE} color={ButtonColor.SCHEME_RED}>
                                <Svg svg={DeleteForeverIcon} />
                                Delete
                            </Button>
                        ) }
                    </Actions>,
                ),
            ];
            rows.push(createTableRow(rowCells));
        })

        return rows;
    }

    return (
        <div className = { 'CreditCollectionAddNftsTable' }>
            <div className={'H3 ExtraBold'}>Added NFTs ({nftEntities.length})</div>
            <Table
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
            <ColumnLayout className = { 'NoContentFound' } gap = { 16 } >
                <Svg svg = { SvgGridNoContent } />
                <div className={'H3 Bold ColorNeutral100'}>No NFTs uploaded yet</div>
                <div className={'B1 ColorNeutral060'}>Looks like you still don’t have NFTs uploaded</div>
            </ColumnLayout>
        )
    }
}

export default inject((stores) => stores)(observer(CreditCollectionAddNftsTable));

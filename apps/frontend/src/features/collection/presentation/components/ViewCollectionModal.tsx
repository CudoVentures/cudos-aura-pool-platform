import React from 'react';
import { inject, observer } from 'mobx-react';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import ViewCollectionModalStore from '../stores/ViewCollectionModalStore';

import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import DataPreviewLayout, { createDataPreview, DataRowsSize } from '../../../../core/presentation/components/DataPreviewLayout';

import '../styles/view-collection-modal.css';

type Props = {
    viewCollectionModalStore?: ViewCollectionModalStore;
}

function ViewCollectionModal({ viewCollectionModalStore }: Props) {

    const { collectionEntity, nftEntities, creatorAdminEntity } = viewCollectionModalStore;

    return (
        <ModalWindow
            className = { 'ViewCollectionModal' }
            modalStore = { viewCollectionModalStore } >

            { viewCollectionModalStore.visible === true && (
                <>
                    <DataPreviewLayout
                        dataPreviews = { [
                            createDataPreview('Collection Name', collectionEntity.name),
                            createDataPreview('Description', collectionEntity.description),
                            createDataPreview('Hashing Power for collection', collectionEntity.formatHashPowerInTh()),
                            createDataPreview('Collection Royalties', collectionEntity.formatRoyaltiesInPercentage()),
                        ] } />
                    { nftEntities.map((nftEntity) => {
                        return (
                            <div key = { nftEntity.id } className = { 'NftEntity' } >
                                <div
                                    className = { 'NftPreview ImgContainNode' }
                                    style = { ProjectUtils.makeBgImgStyle(nftEntity.imageUrl) } />
                                <DataPreviewLayout
                                    className = { 'DataPreviewLayout' }
                                    size = { DataRowsSize.SMALL }
                                    dataPreviews = { [
                                        createDataPreview('NFT Name', nftEntity.name),
                                        createDataPreview('Hash power', nftEntity.formatHashPowerInTh()),
                                        createDataPreview('Price', nftEntity.formatPriceInCudos()),
                                        createDataPreview('Expirity Date', nftEntity.formatExpiryDate()),
                                        createDataPreview('Creator address', creatorAdminEntity.cudosWalletAddress),
                                        createDataPreview('Current owner', nftEntity.currentOwner),
                                    ] } />
                            </div>
                        )
                    })}
                </>
            ) }

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ViewCollectionModal));

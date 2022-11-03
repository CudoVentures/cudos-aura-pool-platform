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

    const { collectionEntity, nftEntities } = viewCollectionModalStore;

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
                            createDataPreview('Hashing Power for collection', collectionEntity.hashPower),
                            createDataPreview('Royalties', collectionEntity.royalties),
                            createDataPreview('Maintenance Fees (per month)', collectionEntity.maintenanceFees.toString()),
                            createDataPreview('Payout address', collectionEntity.payoutAddress),
                            createDataPreview('Ownwer address', collectionEntity.ownerAddress),
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
                                        createDataPreview('Hash power', nftEntity.hashPower),
                                        createDataPreview('Price', nftEntity.price.toString()),
                                        createDataPreview('Expirity Date', nftEntity.getExpiryDisplay()),
                                        createDataPreview('Creator address', nftEntity.creatorAddress),
                                        createDataPreview('Current owner', nftEntity.currentOwnerAddress),
                                        createDataPreview('Farm Royalties', nftEntity.farmRoyalties),
                                        createDataPreview('Maintenance Fee', nftEntity.maintenanceFee.toString()),
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

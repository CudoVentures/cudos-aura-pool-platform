import React from 'react';
import { inject, observer } from 'mobx-react';

import UserProfilePageStore from '../../stores/UserProfilePageStore';
import NftEntity from '../../../../nft/entities/NftEntity';

import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import GridView from '../../../../core/presentation/components/GridView';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import NftPreview from '../../../../nft/presentation/components/NftPreview';

type Props = {
    userProfilePageStore?: UserProfilePageStore
}

function MyNftsTab({ userProfilePageStore }: Props) {
    return (
        <DataGridLayout>

            { userProfilePageStore.nftEntities === null && (
                <LoadingIndicator />
            ) }

            { userProfilePageStore.nftEntities !== null && (
                <GridView
                    gridViewState={userProfilePageStore.gridViewState}
                    defaultContent={userProfilePageStore.nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null} >
                    {userProfilePageStore.nftEntities.map((nftEntity: NftEntity) => {
                        return (
                            <NftPreview
                                key={nftEntity.id}
                                nftEntity={nftEntity}
                                collectionName={userProfilePageStore.getCollectionName(nftEntity.collectionId)} />
                        )
                    })}
                </GridView>
            ) }

        </DataGridLayout>
    )
}

export default inject((stores) => stores)(observer(MyNftsTab));

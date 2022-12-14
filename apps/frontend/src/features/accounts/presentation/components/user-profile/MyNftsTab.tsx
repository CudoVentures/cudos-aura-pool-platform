import React from 'react';
import { inject, observer } from 'mobx-react';

import UserProfilePageStore from '../../stores/UserProfilePageStore';
import NftEntity from '../../../../nft/entities/NftEntity';
import NftFilterModel from '../../../../nft/utilities/NftFilterModel';

import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonType } from '../../../../../core/presentation/components/Button';
import DataGridLayout from '../../../../../core/presentation/components/DataGridLayout';
import GridView from '../../../../../core/presentation/components/GridView';
import LoadingIndicator from '../../../../../core/presentation/components/LoadingIndicator';
import Select from '../../../../../core/presentation/components/Select';
import NftPreview from '../../../../nft/presentation/components/NftPreview';

import MenuItem from '@mui/material/MenuItem/MenuItem';

type Props = {
    userProfilePageStore?: UserProfilePageStore
}

function MyNftsTab({ userProfilePageStore }: Props) {
    const nftFilterModel = userProfilePageStore.nftFilterModel;

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

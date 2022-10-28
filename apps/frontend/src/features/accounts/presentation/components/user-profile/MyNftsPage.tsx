import MenuItem from '@mui/material/MenuItem/MenuItem';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonType } from '../../../../../core/presentation/components/Button';
import DataGridLayout from '../../../../../core/presentation/components/DataGridLayout';
import GridView from '../../../../../core/presentation/components/GridView';
import LoadingIndicator from '../../../../../core/presentation/components/LoadingIndicator';
import Select from '../../../../../core/presentation/components/Select';
import NftEntity from '../../../../nft/entities/NftEntity';
import NftPreview from '../../../../nft/presentation/components/NftPreview';
import NftFilterModel from '../../../../nft/utilities/NftFilterModel';
import UserProfilePageStore from '../../stores/UserProfilePageStore';

type Props = {
    userProfilePageStore: UserProfilePageStore
}
function MyNftsPage({ userProfilePageStore }: Props) {
    const nftFilterModel = userProfilePageStore.nftFilterModel;

    return (
        <DataGridLayout
            headerLeft = { (
                <>
                    <Select
                        onChange={userProfilePageStore.onChangeSortKey}
                        value={nftFilterModel.sortKey} >
                        <MenuItem value = { NftFilterModel.SORT_KEY_NAME }> Name </MenuItem>
                        <MenuItem value = { NftFilterModel.SORT_KEY_POPULAR }> Popular </MenuItem>
                    </Select>
                </>
            ) }
            headerRight = { (
                <Actions
                    layout={ActionsLayout.LAYOUT_ROW_RIGHT}
                    height={ActionsHeight.HEIGHT_48} >
                    <Button
                        padding={ButtonPadding.PADDING_24}
                        type={ButtonType.ROUNDED} >
                            All Filters
                    </Button>
                </Actions>
            ) }>

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

export default observer(MyNftsPage);

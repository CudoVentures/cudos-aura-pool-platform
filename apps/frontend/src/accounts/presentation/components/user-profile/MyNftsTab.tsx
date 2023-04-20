import React from 'react';
import { inject, observer } from 'mobx-react';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

import UserProfilePageStore from '../../stores/UserProfilePageStore';
import NftEntity from '../../../../nft/entities/NftEntity';

import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import GridView from '../../../../core/presentation/components/GridView';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import NftPreview from '../../../../nft/presentation/components/NftPreview';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import Svg from '../../../../core/presentation/components/Svg';

type Props = {
    userProfilePageStore?: UserProfilePageStore
}

function MyNftsTab({ userProfilePageStore }: Props) {

    const nftFilterModel = userProfilePageStore.nftFilterModel;

    return (
        <DataGridLayout
            headerLeft={(userProfilePageStore.nftEntities?.length !== 0 || nftFilterModel.searchString !== '')
                ? <>
                    <Input
                        inputType={InputType.TEXT}
                        className={'SearchBar'}
                        value={nftFilterModel.searchString}
                        onChange={userProfilePageStore.onChangeSearchWord}
                        placeholder={'Search for NFT...'}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >
                                <Svg svg={SearchIcon} />
                            </InputAdornment>,
                        }} />
                </>
                : null} >

            {userProfilePageStore.nftEntities === null && (
                <LoadingIndicator />
            )}

            {userProfilePageStore.nftEntities !== null && (
                <GridView
                    gridViewState={userProfilePageStore.gridViewState}
                    defaultContent={userProfilePageStore.nftEntities.length === 0 ? <div className={'NoContentFound'}>No NFTs found</div> : null} >
                    {userProfilePageStore.nftEntities.map((nftEntity: NftEntity) => {
                        return (
                            <NftPreview
                                key={nftEntity.id}
                                nftEntity={nftEntity}
                                collectionName={userProfilePageStore.getCollectionName(nftEntity.collectionId)} />
                        )
                    })}
                </GridView>
            )}

        </DataGridLayout>
    )
}

export default inject((stores) => stores)(observer(MyNftsTab));

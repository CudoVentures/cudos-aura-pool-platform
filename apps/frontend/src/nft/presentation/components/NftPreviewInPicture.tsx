import React from 'react';
import { useNavigate } from 'react-router-dom';

import NftEntity from '../../entities/NftEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import '../styles/nft-preview-inv-pricture.css';

type Props = {
    nftEntity: NftEntity
    collectionEntity: CollectionEntity
}

export default function NftPreviewInPicture({ nftEntity, collectionEntity }: Props) {
    const navigate = useNavigate();

    const onClickNft = () => {
        navigate(`${AppRoutes.VIEW_NFT}/${nftEntity.id}`);
    }

    return (
        <div className='NftPreviewInPicture Clickable' onClick={onClickNft}>
            <div
                className={'NftImage ImgCoverNode'}
                style={{
                    backgroundImage: `url("${nftEntity.imageUrl}")`,

                }} >
                <div className={'TextHolder'}>
                    <div className={'NftName Dots'}>{nftEntity.name}</div>
                    <div className={'CollectionName Dots'}>{collectionEntity ? collectionEntity.name : ''}</div>
                </div>
            </div>
        </div>
    )
}

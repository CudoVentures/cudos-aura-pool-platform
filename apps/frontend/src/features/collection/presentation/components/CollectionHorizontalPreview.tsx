import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import CollectionEntity from '../../entities/CollectionEntity';
import '../styles/collection-horizontal-preview.css';

type Props = {
    placeNumber: number,
    cudosPriceUsd: number,
    cudosPriceChange: string,
    collectionEntity: CollectionEntity
}

export default function CollectionHorizontalPreview({ placeNumber, cudosPriceUsd, cudosPriceChange, collectionEntity }: Props) {
    const navigate = useNavigate();

    return (<div
        className={'CollectionPreview Clickable'}
        onClick={() => navigate(`${AppRoutes.CREDIT_COLLECTION}/${collectionEntity.id}`)}
    >
        <div className={'PreviewIndex B2 Bold'}>{placeNumber}</div>
        <div
            className={'PreviewImage'}
            style={{
                backgroundImage: `url("${collectionEntity.profileImgUrl}")`,
            }}
        />
        <div className={'FlexColumn CollectionPreviewDataColumn'}>
            <div className={'CollectionName H3 Bold'}>{collectionEntity.name}</div>
            <div className={'HashRate B3'}>Hashrate: {collectionEntity.hashRateDisplay()}</div>
        </div>
        <div className={'FlexColumn CollectionPreviewDataColumn'}>
            <div className={'CollectionPriceCudos B2 Bold'}>{collectionEntity.priceDisplay()}</div>
            <div className={'FlexRow CollectionPriceUsd'}>
                <div className={'CurrentPrice B3 SemiBold'}>{collectionEntity.priceUsdDisplay(cudosPriceUsd)}</div>
                <div className={'CurrentPriceChange B3 SemiBold'}>{cudosPriceChange}</div>
            </div>
        </div>
    </div>)
}

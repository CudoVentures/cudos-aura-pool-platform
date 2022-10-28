import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

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

    function onClickNavigateToNft() {
        navigate(`${AppRoutes.CREDIT_COLLECTION}/${collectionEntity.id}`)
    }

    return (
        <div className={'CollectionHorizontalPreview FlexRow Clickable'} onClick={ onClickNavigateToNft } >
            <div className={'PreviewIndex B2 Bold'}>{placeNumber}</div>
            <div className={'PreviewImage ImgCoverNode'} style = { ProjectUtils.makeBgImgStyle(collectionEntity.profileImgUrl)} />
            <div className = { 'PreviewData FlexColumn'} >
                <div className = { 'PreviewDataRow FlexRow FlexSplit Bold' } >
                    <div className={'CollectionName Dots H3'}>{collectionEntity.name}</div>
                    <div className={'CollectionPriceCudos B2 StartRight'}>{collectionEntity.priceDisplay()}</div>
                </div>
                <div className = { 'PreviewDataRow SemiBold B3 FlexSplit' } >
                    <div className={'HashRate'}>Hashrate: {collectionEntity.hashRateDisplay()}</div>
                    <div className={'FlexRow CollectionPriceUsd StartRight'}>
                        <div className={'CurrentPrice'}>{collectionEntity.priceUsdDisplay(cudosPriceUsd)}</div>
                        <div className={'CurrentPriceChange'}>{cudosPriceChange}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

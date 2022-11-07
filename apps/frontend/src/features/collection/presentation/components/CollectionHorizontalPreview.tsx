import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity from '../../entities/CollectionEntity';

import '../styles/collection-horizontal-preview.css';

type Props = {
    cudosStore?: CudosStore;
    placeNumber: number,
    collectionEntity: CollectionEntity;
    collectionDetailsEntity: CollectionDetailsEntity;
}

function CollectionHorizontalPreview({ cudosStore, placeNumber, collectionEntity, collectionDetailsEntity }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        cudosStore.init();
    }, []);

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
                    <div className={'CollectionPriceCudos B2 StartRight'}>{collectionDetailsEntity.formatFloorPriceInCudos()}</div>
                </div>
                <div className = { 'PreviewDataRow SemiBold B3 FlexSplit' } >
                    <div className={'HashRate'}>Hashrate: {collectionEntity.formatHashRateInEH()}</div>
                    <div className={'FlexRow CollectionPriceUsd StartRight'}>
                        <div className={'CurrentPrice'}>{cudosStore.formatConvertedAcudosInUsd(collectionDetailsEntity.floorPriceInAcudos)}</div>
                        <div className={'CurrentPriceChange'}>{cudosStore.formatCudosPriceChangeInPercentage()}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default inject((stores) => stores)(observer(CollectionHorizontalPreview));

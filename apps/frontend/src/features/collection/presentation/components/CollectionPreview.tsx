import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import CollectionEntity from '../../entities/CollectionEntity';

import '../styles/collection-preview.css';

type Props = {
    collectionEntity: CollectionEntity,
    miningFarmName: string;
    displayStatus: boolean;
}

export default function CollectionPreview({ collectionEntity, miningFarmName, displayStatus }: Props) {

    const navigate = useNavigate();

    const onClickNft = () => {
        navigate(`${AppRoutes.CREDIT_COLLECTION}/${collectionEntity.id}`);
    }

    return (
        <div className="CollectionPreview FlexColumn" onClick={onClickNft}>
            <div className="CollectionPreviewImage ImgCoverNode" style = { ProjectUtils.makeBgImgStyle(collectionEntity.profileImgUrl) } >
                { displayStatus === true && (
                    <div className = { 'CollectionStatusLabel'} >{ collectionEntity.getStatusDisplayName() }</div>
                ) }
            </div>
            <div className={'MiningFarmName'}>{miningFarmName}</div>
            <div className={'CollectionName'}>{collectionEntity.name}</div>
            <div className={'HashPower'}>{collectionEntity.getHashPowerDisplay()}</div>
        </div>
    );
}

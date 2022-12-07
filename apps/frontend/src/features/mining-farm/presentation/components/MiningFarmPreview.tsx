import React from 'react';
import { useNavigate } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';

import DataPreviewLayout, { createDataPreview, DataRowsSize } from '../../../../core/presentation/components/DataPreviewLayout';
import '../styles/mining-farm-preview.css';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';

type Props = {
    miningFarmEntity: MiningFarmEntity,
    miningFarmDetailsEntity: MiningFarmDetailsEntity,
}

export default function MiningFarmPeview({ miningFarmEntity, miningFarmDetailsEntity }: Props) {
    const navigate = useNavigate();

    const onClickMiningFarm = () => {
        navigate(`${AppRoutes.CREDIT_MINING_FARM}/${miningFarmEntity.id}`);
    }

    return (
        <div className={'MiningFarmPreview FlexColumn BorderContainer Clickable'} onClick={onClickMiningFarm}>
            <div className={'MiningFarmPreviewCoverImage ImgCoverNode'} style={ ProjectUtils.makeBgImgStyle(miningFarmEntity.coverImgUrl)} >
                <div className="MiningFarmPreviewProfileImage ImgCoverNode" style={ProjectUtils.makeBgImgStyle(miningFarmEntity.profileImgUrl)} />
            </div>
            <div className={'MiningFarmName H3 Bold'}>{miningFarmEntity.name}</div>
            <div className={'MiningFarmDesc B3'}>{miningFarmEntity.description}</div>
            <DataPreviewLayout
                size = { DataRowsSize.SMALL }
                styledContainerProps = { {
                    containerPadding: ContainerPadding.PADDING_16,
                } }
                dataPreviews = { [
                    createDataPreview('Total hashrate', `${miningFarmEntity.formatHashPowerInTh()}`),
                    createDataPreview('NFTs Owned', miningFarmDetailsEntity?.nftsOwned ?? 0),
                    createDataPreview('Total NFTs Sold', miningFarmDetailsEntity?.totalNftsSold ?? 0),
                ] }>
            </DataPreviewLayout>
        </div>
    );
}

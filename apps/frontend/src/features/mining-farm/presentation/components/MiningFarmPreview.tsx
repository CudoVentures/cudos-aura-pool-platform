import React from 'react';
import { useNavigate } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import MiningFarmEntity from '../../entities/MiningFarmEntity';

import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import '../styles/mining-farm-preview.css';

type Props = {
    miningFarmEntity: MiningFarmEntity,
    miningFarmDetailsEntity: MiningFarmDetailsEntity,
}

export default function MiningFarmPeview({ miningFarmEntity, miningFarmDetailsEntity }: Props) {
    const navigate = useNavigate();

    const onClickMiningFarm = () => {
        navigate(`${AppRoutes.CREDIT_MINING_FARM}/${miningFarmEntity.id}`);
    }

    function renderMiningFarmProperties(name, value) {
        return (
            <div className = { 'MiningFarmProperty FlexSplit' } >
                <div className = { 'MiningFarmPropertyName' } >{ name } </div>
                <div className = { 'StartRight MiningFarmPropertyValue' } >{ value }</div>
            </div>
        )
    }

    return (
        <StyledContainer
            className={'MiningFarmPreview FlexColumn Clickable'}
            containerPadding = { ContainerPadding.PADDING_16 }
            onClick={onClickMiningFarm}>
            <div className={'MiningFarmPreviewCoverImage ImgCoverNode'} style={ ProjectUtils.makeBgImgStyle(miningFarmEntity.coverImgUrl)} >
                <div className="MiningFarmPreviewProfileImage ImgCoverNode" style={ProjectUtils.makeBgImgStyle(miningFarmEntity.profileImgUrl)} />
            </div>
            <div className={'MiningFarmName H3 ExtraBold'}>{miningFarmEntity.name}</div>
            <div className={'MiningFarmDesc B1'}>{miningFarmEntity.description}</div>
            <div className = { 'HorizontalSeparator' } />
            <ColumnLayout gap = { 8 } className = { 'MiningFarmInfo' } >
                { renderMiningFarmProperties('Total hashrate', miningFarmEntity.formatHashPowerInTh()) }
                { renderMiningFarmProperties('NFTs Owned', miningFarmDetailsEntity.nftsOwned) }
                { renderMiningFarmProperties('Total NFTs Sold', miningFarmDetailsEntity.totalNftsSold) }
            </ColumnLayout>
        </StyledContainer>
    );
}

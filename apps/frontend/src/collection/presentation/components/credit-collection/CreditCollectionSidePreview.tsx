import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import { inject, observer } from 'mobx-react';
import React from 'react';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import '../../styles/credit-collection-side-preview.css';
import S from '../../../../core/utilities/Main';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import NewLine from '../../../../core/presentation/components/NewLine';

export enum CreditCollectionSidePreviewSize {
    SMALL = 1,
    FULL = 2,
}

type Props = {
    size: CreditCollectionSidePreviewSize,
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionSidePreview({ size, creditCollectionStore }: Props) {
    const collectionEntity = creditCollectionStore.collectionEntity;

    function createDataPreviews() {
        const previews = [];

        previews.push(createDataPreview('Hashing Power', collectionEntity.formatHashPowerInTh()));
        if (collectionEntity.hasDefaultValuesPerNft() === true) {
            previews.push(createDataPreview('Hashing Power per NFT', collectionEntity.formatDefaultPricePerNftInUsd()));
            previews.push(createDataPreview('Price per NFT', collectionEntity.formatDefaultHashPowerPerNftInTh()));
        }
        previews.push(createDataPreview('NFTs in Collection', creditCollectionStore.nftEntities.length));
        previews.push(createDataPreview('Collection Royalties', collectionEntity.formatRoyaltiesInPercentage()));

        return previews
    }
    return (
        <div className={'CreditCollectionSidePreview FlexColumn'}>
            <div className={'H3 Bold CreditCollectionSidePreviewTitle'}>Collection Preview</div>
            <div className={'B1 CreditCollectionSidePreviewSubtitle'}>This is how your collection details view would look like in CUDOS Markets</div>
            <StyledContainer
                className = { 'PreviewBorderContainer FlexColumn' }
                containerPadding = { ContainerPadding.PADDING_24 } >
                <div className={`CoverPicture ImgCoverNode FlexSingleCenter ${S.CSS.getClassName(creditCollectionStore.isCoverPictureEmpty(), 'Empty')}`}
                    style={ ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl)} >
                    {creditCollectionStore.isProfilePictureEmpty() === true && (
                        <img src={'/assets/img/no-image.png'} />
                    )}
                    <div className={`ProfilePicture ImgCoverNode FlexSingleCenter ${S.CSS.getClassName(creditCollectionStore.isProfilePictureEmpty(), 'Empty')}`}
                        style={ ProjectUtils.makeBgImgStyle(collectionEntity.profileImgUrl)} >
                        {creditCollectionStore.isProfilePictureEmpty() === true && (
                            <img src={'/assets/img/no-image.png'} />
                        )}
                    </div>
                </div>
                <div className={'H3 ExtraBold ColorNeutral100 CollectionPreviewName'}>{collectionEntity.name || 'No Name'}</div>
                <div className={'B1 ColorNeutral060 CollectionPreviewDesc'}><NewLine text = {collectionEntity.description || 'No Description'} /></div>
                {size === CreditCollectionSidePreviewSize.FULL && (<DataPreviewLayout dataPreviews={createDataPreviews()}/>)}
            </StyledContainer>
        </div>
    )

}

CreditCollectionSidePreview.defaultProps = {
    size: CreditCollectionSidePreviewSize.FULL,
};

export default inject((stores) => stores)(observer(CreditCollectionSidePreview));

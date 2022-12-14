import Svg, { SvgSize } from '../../../../../core/presentation/components/Svg';
import { inject, observer } from 'mobx-react';
import React from 'react';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import '../../styles/credit-collection-side-preview.css';
import S from '../../../../../core/utilities/Main';
import DataPreviewLayout, { createDataPreview } from '../../../../../core/presentation/components/DataPreviewLayout';
import ProjectUtils from '../../../../../core/utilities/ProjectUtils';
import StyledContainer, { ContainerPadding } from '../../../../../core/presentation/components/StyledContainer';

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
            previews.push(createDataPreview('Hashing Power per NFT', collectionEntity.formatDefaultPricePerNftInCudos()));
            previews.push(createDataPreview('Price per NFT', collectionEntity.formatDefaultHashPowerPerNftInTh()));
        }
        previews.push(createDataPreview('NFTs in Collection', creditCollectionStore.nftEntities.length));
        previews.push(createDataPreview('Collection Royalties', collectionEntity.formatRoyaltiesInPercentage()));

        return previews
    }
    return (
        <div className={'CreditCollectionSidePreview FlexColumn'}>
            <div className={'H3 Bold'}>Collection Preview</div>
            <div className={'B1'}>This is how your collection details view would look like in AuraPool</div>
            <StyledContainer
                className = { 'PreviewBorderContainer FlexColumn' }
                containerShadow = { false }
                containerPadding = { ContainerPadding.PADDING_16 } >
                <div className={`CoverPicture ImgCoverNode ${S.CSS.getClassName(creditCollectionStore.isCoverPictureEmpty(), 'Empty')}`}
                    style={{
                        backgroundImage: `url("${collectionEntity.coverImgUrl}")`,
                    }} >
                    {creditCollectionStore.isProfilePictureEmpty() === true && (
                        <div className={'EmptyPictureSvg'}>
                            <Svg svg={InsertPhotoIcon} size={SvgSize.CUSTOM}/>
                        </div>
                    )}
                    <div className={`ProfilePicture ImgCoverNode ${S.CSS.getClassName(creditCollectionStore.isProfilePictureEmpty(), 'Empty')}`}
                        style={{
                            backgroundImage: `url("${collectionEntity.profileImgUrl}")`,
                        }} >
                        {creditCollectionStore.isProfilePictureEmpty() === true && (
                            <div className={'EmptyPictureSvg'}>
                                <Svg svg={InsertPhotoIcon} size={SvgSize.CUSTOM}/>
                            </div>
                        )}
                    </div>
                </div>
                <div className={'H3 Bold'}>{collectionEntity.name || 'No Name'}</div>
                <div className={'B3'}>{collectionEntity.description || 'No Description'}</div>
                {size === CreditCollectionSidePreviewSize.FULL && (<DataPreviewLayout dataPreviews={createDataPreviews()}/>)}
            </StyledContainer>
        </div>
    )

}

CreditCollectionSidePreview.defaultProps = {
    size: CreditCollectionSidePreviewSize.FULL,
};

export default inject((stores) => stores)(observer(CreditCollectionSidePreview));

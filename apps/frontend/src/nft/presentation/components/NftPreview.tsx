import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import S from '../../../core/utilities/Main';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NftEntity from '../../entities/NftEntity';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';

import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SvgCudosLogo from '../../../public/assets/vectors/cudos-logo.svg';
import '../styles/nft-preview.css';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';

type Props = {
    cudosStore?: CudosStore;
    className?: string;
    nftEntity: NftEntity,
    collectionName: string
    disabled?: boolean
}

function NftPreview({ cudosStore, className, nftEntity, collectionName, disabled }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        cudosStore.init();
    }, []);

    const onClickNft = () => {
        navigate(`${AppRoutes.VIEW_NFT}/${nftEntity.id}`);
    }

    const hasImage = nftEntity.imageUrl !== S.Strings.EMPTY;

    return (
        <div className={`NftPreview FlexColumn ${S.CSS.getClassName(disabled === false, 'Clickable')} ${className}`} onClick={disabled === false ? onClickNft : null}>
            <div
                className={`NftPreviewImage ImgCoverNode FlexRow ${S.CSS.getClassName(hasImage === false, 'Empty')}`}
                style={{
                    backgroundImage: `url("${nftEntity.imageUrl}")`,
                }} >
                {hasImage === false && <div className={'EmptyNftImageIcon'}>
                    <Svg svg={InsertPhotoIcon} size={SvgSize.CUSTOM}/>
                </div>}
            </div>
            <div className={'CollectionName'}>{collectionName}</div>
            <div className={'NftName'}>{nftEntity.name}</div>
            <div className={'HashPower'}>{nftEntity.formatHashPowerInTh()}</div>
            <div className={'Priceheading'}>Price</div>
            <div className={'PriceRow FlexRow Dots'}>
                {/* <Svg className = { 'SvgCudosLogo' } svg={SvgCudosLogo} /> */}
                <div className={'Price H4 Bold Dots'}>{cudosStore.formatPriceInUsdForNft(nftEntity)}</div>
            </div>
        </div>
    );
}

NftPreview.defaultProps = {
    className: '',
    disabled: false,
}

export default inject((stores) => stores)(observer(NftPreview));

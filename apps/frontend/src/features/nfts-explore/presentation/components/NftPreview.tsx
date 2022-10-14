import Svg from '../../../../core/presentation/components/Svg';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SvgCudosLogo from '../../../../public/assets/vectors/cudos-logo.svg';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NftPreviewEntity from '../../entities/NftPreviewEntity';
import '../styles/nft-preview.css';

interface Props {
    nftPreviewModel: NftPreviewEntity,
}

export default function NftPreview({ nftPreviewModel }: Props) {
    const navigate = useNavigate();

    const onClickNft = () => {
        navigate(`${AppRoutes.NFT_VIEW}/${nftPreviewModel.id}`);
    }

    return (
        <div className="NftPreview FlexColumn" onClick={onClickNft}>
            <div
                className="NftPreviewImage"
                style={{
                    backgroundImage: `url("${nftPreviewModel.imageUrl}")`,
                }}
            ></div>
            <div className={'CollectionName B2'}>{nftPreviewModel.collectionName}</div>
            <div className={'NftName H2 Bold'}>{nftPreviewModel.name}</div>
            <div className={'HashPower H4 Medium'}>{nftPreviewModel.hashPower}</div>
            <div className={'Priceheading B2 SemiBold'}>Price</div>
            <div className={'PriceRow FlexRow'}>
                <Svg svg={SvgCudosLogo}/>
                <div className={'Price H4 Bold'}>{nftPreviewModel.price.toFixed(0)} CUDOS</div>
            </div>
        </div>
    );
}

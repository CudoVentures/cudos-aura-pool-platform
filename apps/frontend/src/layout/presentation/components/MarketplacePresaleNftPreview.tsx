import React from 'react';

import ProjectUtils from '../../../core/utilities/ProjectUtils';
import S from '../../../core/utilities/Main';

import Svg, { SvgSize } from '../../../core/presentation/components/Svg';

import '../styles/marketplace-presale-nft-preview.css';

type Props = {
    imgUrl: string;
    name: string;
    svgPath: string;
    hashRateInTh: number
    whiteText: boolean;
}

export default function MarketPresaleNftPreview({ imgUrl, name, svgPath, hashRateInTh, whiteText }: Props) {
    return (
        <div className = { 'MarketPresaleNftPreview FlexColumn' } >
            <div className = { 'NftPreviewImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(imgUrl) } />
            <div className = { 'NftPreviewNameRow FlexRow' } >
                <Svg className = { 'NftPreviewSvg' } svg = { svgPath } size = { SvgSize.CUSTOM } />
                <div className = { `NftPreviewName H3 SemiBold ${S.CSS.getClassName(whiteText, 'NftPreviewNameWhite')}` } >{ name }</div>
            </div>
            <div className = { 'H3 SemiBold ColorNeutral060' } > { hashRateInTh } TH/s </div>
        </div>
    )
}

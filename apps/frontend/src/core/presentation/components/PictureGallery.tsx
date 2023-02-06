import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Svg from './Svg';

import '../styles/picture-gallery.css';
import ProjectUtils from '../../utilities/ProjectUtils';

type Props = {
    picture: string;
    onClickPrevious: () => void;
    onClickNext: () => void;
}

export default function PictureGallery({ picture, onClickPrevious, onClickNext }: Props) {
    return (
        <div className={'PictureGallery FlexRow'} style={ProjectUtils.makeBgImgStyle(picture)}>
            <Svg svg={ArrowBackIcon} onClick={onClickPrevious} className={'PreviousButton Clickable'} />
            <Svg svg={ArrowForwardIcon} onClick={onClickNext} className={'NextButton Clickable'} />
        </div>
    )
}

import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Svg from './Svg';

import '../styles/picture-gallery.css';
import ProjectUtils from '../../utilities/ProjectUtils';

type Props = {
    className?: string
    picture: string;
    onClickPrevious: () => void;
    onClickNext: () => void;
}

export default function PictureGallery({ className, picture, onClickPrevious, onClickNext }: Props) {
    return (
        <div className={`PictureGallery FlexRow ImgContainNode ${className}`} style={ProjectUtils.makeBgImgStyle(picture)}>
            <Svg svg={ArrowBackIcon} onClick={onClickPrevious} className={'PreviousButton Clickable'} />
            <Svg svg={ArrowForwardIcon} onClick={onClickNext} className={'NextButton Clickable'} />
        </div>
    )
}

PictureGallery.defaultProps = {
    className: '',
};

import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Svg from './Svg';

import '../styles/picture-gallery.css';

type Props = {
    picture: string;
    onClickPrevious: () => void;
    onClickNext: () => void;
}

export default function PictureGallery({ picture, onClickPrevious, onClickNext }: Props) {
    return (
        <div className={'PictureGallery'}>
            <Svg svg={ArrowBackIcon} className={'PreviousButton'} />
            <Svg svg={ArrowForwardIcon} className={'NextButton'} />
        </div>
    )
}

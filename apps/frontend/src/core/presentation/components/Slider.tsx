import React from 'react';
import Carousel from 'react-multi-carousel';

import Svg from './Svg';

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import 'react-multi-carousel/lib/styles.css';
import '../styles/slider.css';
import S from '../../utilities/Main';

type Props = {
    className?: string;
    itemsPerPage?: number;
    showDots?: boolean;
    navWithTransparency?: boolean;
}

export default function Slider({ className, children, showDots, itemsPerPage, navWithTransparency }: React.PropsWithChildren< Props >) {

    return (
        <Carousel
            className = { `Slider ${className} ${S.CSS.getClassName(showDots, 'WithDots')} ${S.CSS.getClassName(navWithTransparency, 'NavWithTransparency')}` }
            showDots = { showDots }
            customLeftArrow = { <LeftArrow /> }
            customRightArrow = { <RightArrow />}
            sliderClass = { 'SliderCnt' }
            dotListClass = { 'DotsCnt' }
            responsive={{
                desktop: {
                    breakpoint: { max: 3000, min: 1024 },
                    items: itemsPerPage,
                    slidesToSlide: 2, // optional, default to 1.
                },
                tablet: {
                    breakpoint: { max: 1024, min: 464 },
                    items: 2,
                    slidesToSlide: 1, // optional, default to 1.
                },
                mobile: {
                    breakpoint: { max: 464, min: 0 },
                    items: 1,
                    slidesToSlide: 1, // optional, default to 1.
                },
            }}>
            { React.Children.toArray(children).map((child, i) => {
                return (
                    <div key = { i } className = { 'SliderChildWrapper' } >{child}</div>
                )
            }) }
        </Carousel>
    )

}

Slider.defaultProps = {
    className: '',
    itemsPerPage: 4,
    showDots: true,
    navWithTransparency: true,
}

function LeftArrow({ onClick, ...rest }) {
    const {
        onMove,
        carouselState: { currentSlide, deviceType },
    } = rest;

    return (
        <div className = { 'NavArrows NavArrowsLeft FlexSingleCenter' } onClick = { onClick } >
            <Svg className = { 'NavSvg' } svg = { KeyboardBackspaceIcon } />
        </div>
    )
}

function RightArrow({ onClick, ...rest }) {
    const {
        onMove,
        carouselState: { currentSlide, deviceType },
    } = rest;

    return (
        <div className = { 'NavArrows NavArrowsRight FlexSingleCenter' } onClick = { onClick } >
            <Svg className = { 'NavSvg' } svg = { KeyboardBackspaceIcon } />
        </div>
    )
}

function CustomDot({ onClick, ...rest }) {
    const {
        onMove,
        index,
        active,
        carouselState: { currentSlide, deviceType },
    } = rest;
    const carouselItems = [CarouselItem1, CaourselItem2, CarouselItem3];
    // onMove means if dragging or swiping in progress.
    // active is provided by this lib for checking if the item is active or not.
    return (
        <button
            className={active ? 'active' : 'inactive'}
            onClick={() => onClick()}
        >
            {React.Children.toArray(carouselItems)[index]}
        </button>
    );
}

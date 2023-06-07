import React, { useEffect, useState } from 'react';

import S from '../../utilities/Main';

import Svg, { SvgSize } from './Svg';

import MouseIcon from '@mui/icons-material/Mouse';
import '../styles/scroll-down.css';

export default function ScrollDown() {

    const [displayMouse, setDisplayMouse] = useState(true);

    useEffect(() => {
        window.addEventListener('scroll', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    function onClickScroll() {
        S.setScrollY(1024, 'smooth');
    }

    function onScroll() {
        const shouldDisplayMouse = S.getScrollY() >= 64;
        if (displayMouse === true && shouldDisplayMouse === false) {
            setDisplayMouse(false);
        }
    }

    return (
        <Svg className = { `ScrollDown ActiveVisibilityHidden ${S.CSS.getActiveClassName(displayMouse)}` } svg = { MouseIcon } size = { SvgSize.CUSTOM } onClick = { onClickScroll } />
    )
}

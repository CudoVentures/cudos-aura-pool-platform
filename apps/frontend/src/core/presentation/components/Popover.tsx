import React, { useEffect, useRef } from 'react';

import S from '../../utilities/Main'
import MuiPopover, { PopoverProps } from '@mui/material/Popover/Popover';

import '../styles/popover.css';

export default function Popover(props: PopoverProps) {

    const ref = useRef(null);

    useEffect(() => {
        document.addEventListener('wheel', onPreventableScroll, { passive: false });
        document.addEventListener('touchmove', onPreventableScroll, { passive: false });
        document.addEventListener('scroll', onUnpreventableScroll);

        return () => {
            document.removeEventListener('wheel', onPreventableScroll);
            document.removeEventListener('touchmove', onPreventableScroll);
            document.removeEventListener('scroll', onUnpreventableScroll);
        }
    });

    function onPreventableScroll(e) {
        if (props.open === true) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    function onUnpreventableScroll(e) {
        if (props.open === true) {
            props.onClose(e, 'backdropClick');
        }
    }

    function onEntered() {
        ref.current.querySelector('.MuiPopover-paper').addEventListener('wheel', S.stopPropagation);
    }

    function onExit() {
        ref.current.querySelector('.MuiPopover-paper').removeEventListener('wheel', S.stopPropagation);
    }

    return (
        <MuiPopover
            {...props}
            ref = { ref }
            disableScrollLock = { true }
            className = { 'Popover' }
            TransitionProps = { {
                onEntered,
                onExit,
            } } >
            { props.children }
        </MuiPopover>
    )

}

Popover.defaultProps = {
    'anchorOrigin': {
        vertical: 'bottom',
        horizontal: 'center',
    },
    'transformOrigin': {
        vertical: 'top',
        horizontal: 'center',
    },
};

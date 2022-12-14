import React from 'react';
import { createTheme, ThemeProvider, Button as MuiButton } from '@mui/material';

import '../styles/button.css';

const theme01 = createTheme({
    palette: {
        primary: {
            main: '#000',
            contrastText: '#fff',
        },
        secondary: {
            main: '#555',
            contrastText: '#fff',
        },
    },
});

const theme02 = createTheme({
    palette: {
        primary: {
            main: '#999',
            contrastText: '#fff',
        },
    },
});

export enum ButtonType {
    ROUNDED = 'contained',
    TEXT_INLINE = 'text',
}

export enum ButtonColor {
    SCHEME_1,
    SCHEME_2,
    SCHEME_3,
}

/* each member of the enum corresponds to a CSS class */
export enum ButtonPadding {
    DEFAULT = '',
    PADDING_24 = 'Padding24',
    PADDING_48 = 'Padding48',
}

/* each member of the enum corresponds to a CSS class */
export enum ButtonRadius {
    DEFAULT = '',
    RADIUS_16 = 'Radius16',
    MAX = 'RadiusMax'
}

type Props = {
    className?: string;
    type?: ButtonType;
    color?: ButtonColor;
    padding?: ButtonPadding;
    radius?: ButtonRadius;
    disabled?: boolean;
    href?: string,
    target?: string;
    onClick?: () => void;
}

export default function Button({ className, type, color, padding, radius, href, onClick, disabled, target, children }: React.PropsWithChildren < Props >) {

    function cssMuiClassColor() {
        switch (color) {
            case ButtonColor.SCHEME_2:
                return 'secondary';
            case ButtonColor.SCHEME_1:
            case ButtonColor.SCHEME_3:
            default:
                return 'primary';
        }
    }

    function muiTheme() {
        switch (color) {
            case ButtonColor.SCHEME_1:
            case ButtonColor.SCHEME_2:
                return theme01;
            default:
                return theme02;
        }
    }

    return (
        <ThemeProvider theme={theme01} >
            <ThemeProvider theme={muiTheme()} >
                <MuiButton
                    disabled={disabled}
                    className={`Button Transition ${padding} ${radius} ${className}`}
                    onClick={onClick}
                    variant={type}
                    color={cssMuiClassColor()}
                    href={href}
                    target={target} >
                    <div className={'ButtonContent FlexRow'} > {children} </div>
                </MuiButton>
            </ThemeProvider>
        </ThemeProvider>

    );
}

Button.defaultProps = {
    className: '',
    type: ButtonType.ROUNDED,
    color: ButtonColor.SCHEME_1,
    padding: ButtonPadding.DEFAULT,
    radius: ButtonRadius.RADIUS_16,
    disabled: false,
    href: undefined,
    target: undefined,
    onClick: undefined,
};

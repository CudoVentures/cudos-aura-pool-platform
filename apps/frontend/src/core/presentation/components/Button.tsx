import React from 'react';
import MuiButton from '@mui/material/Button/Button';
import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

import '../styles/button.css';

const theme01 = createTheme({
    palette: {
        primary: {
            main: '#08090C',
            contrastText: '#fff',
        },
        secondary: {
            main: '#15a2e9',
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
        secondary: {
            main: '#fff',
            contrastText: '#000',
        },
    },
});

const theme03 = createTheme({
    palette: {
        primary: {
            main: '#0DA048',
            contrastText: '#fff',
        },
        secondary: {
            main: '#EA4E4E',
            contrastText: '#fff',
        },
    },
});

const theme04 = createTheme({
    palette: {
        primary: {
            main: '#fff',
            contrastText: '#EA4E4E',
        },
        secondary: {
            main: '#EA4E4E',
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
    SCHEME_4,
    SCHEME_GREEN,
    SCHEME_RED,
    SCHEME_RED_BORDER,
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

/* each member of the enum corresponds to a CSS class */
export enum ButtonBorder {
    DEFAULT = '',
    NO_BORDER = 'NoBorder'
}

type Props = {
    className?: string;
    type?: ButtonType;
    color?: ButtonColor;
    padding?: ButtonPadding;
    radius?: ButtonRadius;
    border?: ButtonBorder;
    disabled?: boolean;
    href?: string,
    target?: string;
    onClick?: () => void;
}

export default function Button({ className, type, color, padding, radius, border, href, onClick, disabled, target, children }: React.PropsWithChildren < Props >) {

    function cssMuiClassColor() {
        switch (color) {
            case ButtonColor.SCHEME_2:
            case ButtonColor.SCHEME_4:
            case ButtonColor.SCHEME_RED:
                return 'secondary';
            case ButtonColor.SCHEME_1:
            case ButtonColor.SCHEME_3:
            case ButtonColor.SCHEME_GREEN:
            case ButtonColor.SCHEME_RED_BORDER:
            default:
                return 'primary';
        }
    }

    function muiTheme() {
        switch (color) {
            case ButtonColor.SCHEME_3:
            case ButtonColor.SCHEME_4:
                return theme02;
            case ButtonColor.SCHEME_GREEN:
            case ButtonColor.SCHEME_RED:
                return theme03;
            case ButtonColor.SCHEME_RED_BORDER:
                return theme04;
            case ButtonColor.SCHEME_1:
            case ButtonColor.SCHEME_2:
            default:
                return theme01;
        }
    }

    function cssBorder() {
        if (type !== ButtonType.ROUNDED) {
            return null;
        }

        switch (color) {
            case ButtonColor.SCHEME_4:
            case ButtonColor.SCHEME_RED_BORDER:
                return { 'border': `1px solid ${muiTheme().palette[cssMuiClassColor()].contrastText}` };
            default:
                return null;
        }
    }

    return (
        <ThemeProvider theme={theme01} >
            <ThemeProvider theme={theme02} >
                <ThemeProvider theme={muiTheme()} >
                    <MuiButton
                        disabled={disabled}
                        className={`Button Transition ${padding} ${radius} ${border} ${className}`}
                        onClick={onClick}
                        variant={type}
                        color={cssMuiClassColor()}
                        href={href}
                        target={target}
                        style = { cssBorder() } >
                        <div className={'ButtonContent FlexRow'} > {children} </div>
                    </MuiButton>
                </ThemeProvider>
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
    border: ButtonBorder.DEFAULT,
    disabled: false,
    href: undefined,
    target: undefined,
    onClick: undefined,
};

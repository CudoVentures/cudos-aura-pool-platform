import React from 'react';

import S from '../../utilities/Main';

import Svg, { SvgSize } from './Svg';

import CheckIcon from '@mui/icons-material/Check';
import '../styles/nav-row.css';

type Props = {
    navSteps: NavStep[];
    className?: string;
}

export type NavStep = {
    navNumber: number;
    navName: string;
    isActive: boolean;
    isDone: boolean,
}

export function createNavStep(navNumber: number, navName: string, isActive: boolean, isDone: boolean) {
    return {
        navNumber, navName, isActive, isDone,
    }
}

export default function NavRow({ className, navSteps }: Props) {
    return (
        <div className={`FlexRow NavBar ${className}`}>
            {navSteps.map((navStep: NavStep) => {
                return (<div
                    key={navStep.navNumber}
                    className={`FlexColumn NavItem ${S.CSS.getActiveClassName(navStep.isActive === true)}`}>
                    <div className = { `NavNumber B3 FlexRow ${S.CSS.getClassName(navStep.isDone, 'Done')}` } >
                        { navStep.isDone === false && (
                            navStep.navNumber
                        ) }
                        { navStep.isDone === true && (
                            <Svg className = { 'SvgIcon' } size = { SvgSize.CUSTOM } svg = { CheckIcon } />
                        ) }
                    </div>
                    <div className={'NavName B3 SemiBold'}>
                        <div>{navStep.navName}</div>
                    </div>
                </div>)
            })}
            <div className={'HorizontalSeparator'} />
        </div>
    )
}

NavRow.defaultProps = {
    className: '',
}

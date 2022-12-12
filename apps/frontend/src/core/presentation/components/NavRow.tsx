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

export function createNavStep(navNumber: number, navName: string, isActive: boolean, isDone: boolean): NavStep {
    return {
        navNumber, navName, isActive, isDone,
    }
}

export default function NavRow({ className, navSteps }: Props) {
    return (
        <div className={`FlexRow NavRow ${className}`}>
            {navSteps.map((navStep: NavStep) => {
                return (
                    <div
                        key={navStep.navNumber}
                        className={`FlexColumn NavItem Bold B3 ${S.CSS.getActiveClassName(navStep.isActive === true)}`}>
                        <div className = { `NavNumber FlexRow ${S.CSS.getClassName(navStep.isDone, 'Done')}` } >
                            { navStep.isDone === false && (
                                navStep.navNumber
                            ) }
                            { navStep.isDone === true && (
                                <Svg className = { 'SvgIcon' } size = { SvgSize.CUSTOM } svg = { CheckIcon } />
                            ) }
                        </div>
                        <div className={'NavName'}>
                            <div>{navStep.navName}</div>
                        </div>
                    </div>)
            })}
            <div className={'NavRowDecoration'} />
        </div>
    )
}

NavRow.defaultProps = {
    className: '',
}

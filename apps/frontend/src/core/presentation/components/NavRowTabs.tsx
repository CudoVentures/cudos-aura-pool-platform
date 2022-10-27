import React from 'react';
import S from '../../utilities/Main';
import '../styles/nav-row-tabs.css';

type Props = {
    className?: string;
    navTabs: NavTab[];
}

export type NavTab = {
    navName: string;
    isActive: boolean;
    onClick?: () => void;
}

export function createNavRowTab(navName, isActive, onClick: () => void = null): NavTab {
    return {
        navName, isActive, onClick,
    }
}

export default function NavRowTabs({ navTabs, className }: Props) {
    return (
        <div className={`FlexRow NavRowTabs ${className}`}>
            { navTabs.map((navStep: NavTab) => {
                return (
                    <div key={navStep.navName} onClick={navStep.onClick} className={`NavButton Clickable Transition ${S.CSS.getActiveClassName(navStep.isActive === true)}`} >
                        { navStep.navName }
                    </div>
                )
            })}
        </div>
    )
}

NavRowTabs.defaultProps = {
    className: '',
}

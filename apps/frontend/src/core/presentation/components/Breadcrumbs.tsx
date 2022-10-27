import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import '../styles/breadcrumbs.css';
import { useNavigate } from 'react-router-dom';
import Svg from './Svg';

type Crumb = {
    name: string;
    onClick?: () => void;
}

type Props = {
    crumbs: Crumb[];
}

export function createBreadcrumb(name: string, onClick: () => void = null) {
    return {
        name, onClick,
    }
}

export default function Breadcrumbs({ crumbs }: Props) {
    const lastCrumb = crumbs[crumbs.length - 1];
    const slicedCrumbds = crumbs.slice(0, -1);

    const navigate = useNavigate();

    const onClickBack = () => {
        navigate(-1);
    };

    return (
        <div className={'BreadCrumbs FlexRow'}>
            <div className={'BackButton FlexRow Clickable'} onClick={onClickBack}>
                <Svg svg={ArrowBackIcon} />
                <div className={'B2 SemiBold'}>Back</div>
            </div>
            <div className={'Crumbs FlexRow B2 Bold'}>
                {slicedCrumbds.map((crumb: Crumb, index: number) => <div key={index} className={'CrumbBox FlexRow'}>
                    <div className={'Crumb Clickable'} onClick={crumb.onClick}>{crumb.name}</div>
                    <Svg svg={ArrowForwardIosIcon} />
                </div>)}
                <div className={'LastCrumb Clickable'} onClick={lastCrumb.onClick}>{lastCrumb.name}</div>
            </div>
        </div>
    )
}

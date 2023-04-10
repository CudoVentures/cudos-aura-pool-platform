import React from 'react'
import { useNavigate } from 'react-router-dom';
import PackageJson from '../../../../../../package.json'

import Svg from '../../../core/presentation/components/Svg';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, WEBSITE, TELEGRAM, LINKEDIN, TWITTER, DISCORD, FACEBOOK, MEDIUM, SPOTIFY, YOUTUBE } from '../../../core/utilities/Links';

import SvgAuraPoolLogoLight from '../../../public/assets/vectors/cudos-markets-logo-light.svg'
import AppRoutes from '../../../app-routes/entities/AppRoutes';
// import SvgLinkedin from '../../../public/assets/vectors/linkedin.svg';
// import SvgTwitter from '../../../public/assets/vectors/twitter.svg';
// import SvgFacebook from '../../../public/assets/vectors/facebook.svg';
// import SvgMedium from '../../../public/assets/vectors/medium.svg';
// import SvgTelegram from '../../../public/assets/vectors/telegram.svg';
// import SvgDiscord from '../../../public/assets/vectors/discord.svg';
// import SvgSpotify from '../../../public/assets/vectors/spotify.svg';
// import SvgYoutube from '../../../public/assets/vectors/youtube.svg';
import '../styles/page-footer.css'

export default function PageFooter() {
    const navigate = useNavigate();

    function onClickExplore() {
        navigate(AppRoutes.MARKETPLACE);
    }

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS)
    }

    function onClickCalculator() {
        navigate(AppRoutes.REWARDS_CALCULATOR);
    }

    return (
        <footer className='FooterContainer AppContent'>
            <div className={'PageFooter FlexRow FlexSplit'}>
                <Svg className={'SVG'} svg={SvgAuraPoolLogoLight} />
                <div className={'StartRightBlock FooterNav'}>
                    <div className={'LinksColumn'}>
                        <div className='H3 Bold'>Join Us</div>
                        <a href={LINKEDIN} target={'_blank'} rel={'noreferrer'} >LinkedIn</a>
                        <a href={TWITTER} target={'_blank'} rel={'noreferrer'} >Twitter</a>
                        <a href={MEDIUM} target={'_blank'} rel={'noreferrer'} >Medium</a>
                        <a href={FACEBOOK} target={'_blank'} rel={'noreferrer'} >Facebook</a>
                    </div>
                    <div className={'LinksColumn'}>
                        <div className='H3 Bold VisibilityHidden'>Join Us</div>
                        <a href={TELEGRAM} target={'_blank'} rel={'noreferrer'} >Telegram</a>
                        <a href={DISCORD} target={'_blank'} rel={'noreferrer'} >Discord</a>
                        <a href={SPOTIFY} target={'_blank'} rel={'noreferrer'} >Spotify</a>
                        <a href={YOUTUBE} target={'_blank'} rel={'noreferrer'} >Youtube</a>
                    </div>
                    <div className={'LinksColumn'}>
                        <div className='H3 Bold'>Marketplace</div>
                        <a className={'Clickable'} onClick={onClickExploreNfts} >Explore</a>
                        <a className={'Clickable'} onClick={onClickCalculator} >Calculator</a>
                        {/* <a href={'#'} target={'_blank'} rel={'noreferrer'} >What is CUDOS Markets</a> */}
                    </div>
                    {/* <div className={ 'LinksColumn' }>
                        <div className='H3 Bold'>Link</div>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                    </div> */}
                </div>
            </div>
            <div className={'FooterNav FlexRow TermsContainer'} >
                <a href={TERMS_AND_CONDITIONS} >Terms &amp; Conditions</a>
                <a href={PRIVACY_POLICY} >Privacy Policy</a>
                <a href={WEBSITE} target={'_blank'} rel={'noreferrer'} >Cudos.org</a>
                <a>License &copy; 2018 - {new Date().getFullYear()}</a>
                <a>v{PackageJson.version}</a>
            </div>
        </footer>
    )
}

import React from 'react'
import { useNavigate } from 'react-router-dom';
import PackageJson from '../../../../../../package.json'

import Svg from '../../../core/presentation/components/Svg';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, WEBSITE, FAQ, TWITTER, DISCORD, MEDIUM } from '../../../core/utilities/Links';

import SvgCudosMarketsLogoLight from '../../../public/assets/vectors/cudos-markets-logo-light.svg'
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

    // function onClickExplore() {
    //     navigate(AppRoutes.MARKETPLACE);
    // }

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS)
    }

    // function onClickCalculator() {
    //     navigate(AppRoutes.REWARDS_CALCULATOR);
    // }

    return (
        <footer className='FooterContainer AppContent'>
            <div className={'PageFooter FlexRow FlexSplit'}>
                <Svg className={'SVG'} svg={SvgCudosMarketsLogoLight} />
                <div className={'StartRightBlock FooterNav'}>
                    <div className={'LinksColumn'}>
                        <div className='H3 Bold'>Join Us</div>
                        <a href={DISCORD} target={'_blank'} rel={'noreferrer'} >Discord</a>
                        <a href={TWITTER} target={'_blank'} rel={'noreferrer'} >Twitter</a>
                        <a href={MEDIUM} target={'_blank'} rel={'noreferrer'} >Medium</a>
                    </div>
                    <div className={'LinksColumn'}>
                        <div className='H3 Bold'>Support</div>
                        <a href={FAQ} target={'_blank'} rel={'noreferrer'} >FAQs</a>
                        <a href={DISCORD} target={'_blank'} rel={'noreferrer'} >Contact us</a>
                    </div>
                    {/* <div className={'LinksColumn'}>
                        <div className='H3 Bold'>Marketplace</div>
                        <a className={'Clickable'} onClick={onClickExploreNfts} >Explore</a>
                        <a href={REWARDS_CALCULATOR} target={'_blank'} rel={'noreferrer'} >Calculator</a>
                    </div> /*}
                    {/* <div className={ 'LinksColumn' }>
                        <div className='H3 Bold'>Link</div>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                    </div> */}
                </div>
            </div>
            <div className={'FooterNav FlexRow TermsContainer'} >
                <a href={TERMS_AND_CONDITIONS} target='_blank' rel="noreferrer" >Terms &amp; Conditions</a>
                <a href={PRIVACY_POLICY} target='_blank' rel="noreferrer" >Privacy Policy</a>
                <a href={WEBSITE} target={'_blank'} rel={'noreferrer'} >CUDOSMarkets.com</a>
                <a>License &copy; {new Date().getFullYear()}</a>
                <a>v{PackageJson.version}</a>
            </div>
        </footer>
    )
}

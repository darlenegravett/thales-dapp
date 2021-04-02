import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from 'assets/images/logo.svg';

export const Section = styled.section`
    &:nth-child(odd) {
        background: linear-gradient(281.48deg, #04045a -16.58%, #141874 97.94%);
    }
    &:nth-child(even) {
        background: white;
    }
`;

export const MainWrapper = styled.div`
    display: flex;
    justify-content: center;
    width: min(100%, 1440px);
    margin: auto;
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const Side = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 120px 140px 120px 60px;
    &:first-child {
        padding: 120px 60px 120px 140px;
    }
    @media (max-width: 768px) {
        padding: 40px !important;
    }
`;
export const SideHeader = styled.h2`
    font-family: Titillium Web;
    font-style: normal;
    font-weight: bold;
    font-size: 49px;
    line-height: 64px;
    letter-spacing: -1px;
    color: ${(props) => props.color};
`;
export const SideContent = styled.h2`
    font-family: Titillium Web;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 32px;
    letter-spacing: 0.2px;
    color: ${(props) => props.color};
`;
export const Image = styled.img`
    width: 100%;
    height: 100%;
`;

export const ListHeader = styled.h2`
    font-family: Titillium Web;
    font-style: normal;
    font-weight: 600;
    font-size: 25px;
    line-height: 48px;
    color: #fff;
`;

export const List = styled.ul`
    list-style-position: outside;
    padding-left: 20px;
`;

export const ListItem = styled.li`
    font-family: Titillium Web;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 32px;
    letter-spacing: 0.2px;
    color: #fff;
`;

export const InfoText = styled.p`
    font-family: Titillium Web;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 40px;
    letter-spacing: 0.15px;
    margin: 40px 0;
    color: #f6f6fe;
`;

export const Wrapper = styled.div`
    display: flex;
`;

export const VerticalWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: min(100%, 1440px);
    margin: auto;
    align-items: center;
`;

export const LaunchApp = styled.button`
    width: 173px;
    height: 48px;
    background: linear-gradient(90deg, #3936c7 4.67%, #2d83d2 42.58%, #23a5dd 77.66%, #35dadb 95.67%);
    border-radius: 23px;
    cursor: pointer;
    border: none;
    color: white;
    text-transform: none !important;
    font-family: Titillium Web;
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 32px;
    text-align: center;
    letter-spacing: 0.5px;
    margin-right: 20px;
`;

export const WhoIsThales = styled.button`
    width: 184px;
    height: 48px;
    background: transparent;
    border-radius: 23px;
    cursor: pointer;
    border: 1.5px solid #44e1e2;
    color: #44e1e2;
    text-transform: none !important;
    font-family: Titillium Web;
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 32px;
    text-align: center;
    letter-spacing: 0.5px;
`;

export const SideTitle = styled(SideHeader)`
    letter-spacing: 3px;
`;

export const FooterIcon = styled.img`
    width: 30px;
    height: 30px;
    margin: 60px;
`;

export const Logo = styled(Link)`
    display: flex;
    flex: 1;
    &:before {
        content: ' ';
        background-image: url(${logo});
        height: 52px;
        width: 52px;
        margin-right: 20px;
    }
    font-family: Titillium Web;
    font-style: normal;
    font-weight: bold;
    font-size: 36px;
    line-height: 55px;
    color: white;
`;

export const PoweredBy = styled.div`
    align-self: start;
    font-family: Titillium Web;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    color: #f6f6fe;
    white-space: nowrap;
    margin: 60px;
`;

export const SyntetixLogo = styled.img`
    width: 220px;
    height: 16px;
    position: relative;
    top: 2px;
}
`;

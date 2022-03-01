import styled, { StyledComponent } from 'styled-components';

type Children = {
    Wrapper: any;
    Column: StyledComponent<'div', any>;
    Row: StyledComponent<'div', any>;
    RowTitle: StyledComponent<'span', any>;
    RowSubtitle: StyledComponent<'span', any>;
};

type WrapperProps = {
    background?: boolean;
};

const CardWrapper = styled.div<WrapperProps>`
    background: ${(_props) =>
        _props.background ? 'linear-gradient(rgba(130, 8, 252, 1), rgba(81, 106, 255, 1))' : 'transparent'};
    margin-bottom: 15px;
    border-radius: 15px;
    box-shadow: ${(_props) => (_props.background ? ' 0px 0px 40px 3px rgba(100, 217, 254, 0.3)' : 'none')};
    padding: 2px;
    border: ${(_props) => (_props.background ? 'none' : '2px solid rgba(100, 217, 254, 0.5)')};
    &:hover {
        transform: scale(1.02);
        border: ${(_props) => (_props.background ? 'none' : '2px solid rgba(100, 217, 254, 1)')};
        box-shadow: ${(_props) => (_props.background ? ' 0px 0px 40px 3px rgba(100, 217, 254, 0.6)' : 'none')};
    }
`;

// @ts-ignore
const Card: StyledComponent<'div', any> & Children = styled.div`
    background: #04045a;
    box-sizing: border-box;
    border-radius: 15px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 140px;
`;
const CardColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    height: 100%;
    &:first-child {
        flex: 1;
        justify-content: center;
    }
    flex: 2;
    &:nth-child(2) {
        margin-left: 10px;
        margin-right: 20px;
    }
`;

const CardText = styled.span`
    display: block;
    font-family: Roboto !important;
    color: var(--primary-color);
`;

const SectionContainer = styled.div`
    display: block;
`;

const Header = styled(CardText)`
    font-size: 16px;
    font-weight: 400;
    text-transform: capitalize;
`;

const SubHeader = styled(CardText)`
    font-size: 20px;
    font-weight: 700;
`;

Card.Wrapper = CardWrapper;
Card.Column = CardColumn;
Card.Row = SectionContainer;
Card.RowTitle = Header;
Card.RowSubtitle = SubHeader;

export default Card;

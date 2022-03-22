import AccountSectionMenu from './AccountSectionMenu';
import styled from 'styled-components';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { accountData } from 'components/App/Atoms';

const AccountSectionWrapper = styled.div`
    margin: 0px 10px;

    height: 100%;
    display: flex;
    flex-direction: row;

    align-items: center;
`;
const AvatarBorder = styled.div`
    box-sizing: border-box;
    height: 40px;

    border-radius: 9999px;
    padding: 2px;
    background-image: linear-gradient(
        var(--gradientDegree),
        var(--red),
        var(--pink),
        var(--purple),
        var(--cyan),
        var(--green),
        var(--orange),
        var(--yellow)
    );
    background-size: 300% 300%;
    cursor: pointer;

    &:hover {
        animation: animatedGradient 6s ease infinite alternate-reverse;
    }
`;
const AvatarImg = styled.img`
    height: 100%;

    border-radius: 9999px;
`;

export const accountSectionVisible = atom({
    key: 'accountSectionVisible',
    default: false,
});

export default function AccountSection() {
    const [menuVisible, setMenuVisible] = useRecoilState(accountSectionVisible);
    const accountInfo = useRecoilValue(accountData);

    /**
     * props.account={
     *      avatarURL: "",
     *      username: "",
     * }
     */

    function handleAvatarClick() {
        setMenuVisible(true);
    }

    return (
        <AccountSectionWrapper id="account_section">
            <AvatarBorder className="" id="avatar" onClick={handleAvatarClick}>
                <AvatarImg
                    id="avatar_img"
                    src={accountInfo.avatarURL}
                    alt={accountInfo.username}
                />
            </AvatarBorder>

            {menuVisible && <AccountSectionMenu />}
        </AccountSectionWrapper>
    );
}

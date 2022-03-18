import { accountData } from 'components/App/Atoms';
import React from 'react'
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';


const ProfileWrapper = styled.div`
    
`;
const Profile = () => {
    
    const accountInfo = useRecoilValue(accountData)
    console.log(accountInfo);
    return(
        <ProfileWrapper>


        </ProfileWrapper>
    )
}

export default Profile
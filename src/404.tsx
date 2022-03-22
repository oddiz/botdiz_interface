import React from 'react';
import styled from 'styled-components';

const NotFoundPageWrapper = styled.div`
    display: flex;
    flex-direction: column;

    align-items: center;

    height: 100%;
    width: 100%;

    font-family: 'Fira Code';
`;
const Text404 = styled.span`
    font-size: 68px;
    color: var(--red);

    margin-top: 5%;
    margin-bottom: 25px;
`;
const Text = styled.span`
    color: white;
    font-size: 48px;
`;
const SaveMeButton = styled.a`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    margin-top: 50px;

    color: #202225;
    font-size: 30px;
    font-weight: 700;
    height: 50px;
    width: 200px;

    background: linear-gradient(
        var(--gradientDegree),
        var(--red) 0%,
        var(--pink) 50%,
        var(--purple) 100%
    );
    background-size: 200% 100%;

    border-radius: 8px;

    cursor: pointer;

    text-decoration: none;

    transition: linear 0.2s all;

    &:hover {
        background-position-x: 100%;
    }
`;
export default function NotFoundPage() {
    return (
        <NotFoundPageWrapper>
            <Text404>404</Text404>
            <Text>Page Not Found</Text>

            <SaveMeButton href="/">Go Back</SaveMeButton>
        </NotFoundPageWrapper>
    );
}

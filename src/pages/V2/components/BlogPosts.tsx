import React, { useState } from 'react';
import styled from 'styled-components';
import mediumPostsQuery from '../mediumPostsQuery';

import nextArrow from 'assets/images/arrow-next.svg';
import backArrow from 'assets/images/arrow-previous.svg';

const limitBlogMeta = (text: string, limit: number) => {
    //Remove html tags from text
    text = text.replace(/<\/?[^>]+(>|$)/g, '');

    return text?.length > limit ? text.substring(0, limit) + '...' : text;
};

const formatDate = (timestamp: Date) => {
    return timestamp.toString().split(' ')[0];
};

const BlogPosts: React.FC = () => {
    const blogPostsQuery = mediumPostsQuery({ enabled: true });
    const [blogPostsCount, setBlogPostsCount] = useState<number>(3);
    const blogPosts = blogPostsQuery.isSuccess ? blogPostsQuery.data.slice(blogPostsCount - 3, blogPostsCount) : [];
    console.log(blogPosts);

    const carouselChangeHandler = (change: number) => {
        if (change < 0) {
            return blogPostsCount + change < 3 ? setBlogPostsCount(3) : setBlogPostsCount(blogPostsCount + change);
        }

        setBlogPostsCount(blogPostsCount + change);

        if (blogPostsQuery?.data)
            if (blogPostsCount == blogPostsQuery?.data.length)
                setBlogPostsCount(blogPostsQuery?.data.length ? blogPostsQuery?.data.length : 3);
    };

    return (
        <Wrapper>
            <Arrow style={{ marginLeft: '-25px' }} src={backArrow} onClick={() => carouselChangeHandler(-1)} />
            {blogPosts.map((blog, index) => {
                return (
                    <BlogCard key={index} onClick={() => window.open(blog.link, '_blank')}>
                        <BlogTitle>{limitBlogMeta(blog.title, 50)}</BlogTitle>
                        <BlogDescription>{limitBlogMeta(blog.description, 250)}</BlogDescription>
                        <MediumDate>{formatDate(blog.pubDate)}</MediumDate>
                        <MediumIcon className="icon-home icon-home--medium" />
                    </BlogCard>
                );
            })}
            <Arrow style={{ marginRight: '-25px' }} src={nextArrow} onClick={() => carouselChangeHandler(1)} />
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    overflow: hidden;
    padding: 2em;
    @media (max-width: 500px) {
        & > div:not(:nth-child(2)) {
            display: none;
        }
        & > div:nth-child(2) {
            min-width: 95% !important;
            min-height: 345px;
        }
    }

    @media (max-width: 1024px) {
        & > div:not(:nth-child(-n + 3)) {
            display: none;
        }
        & > div:nth-child(-n + 3) {
            min-width: 47%;
        }
    }
`;

const BlogCard = styled.div`
    height: 345px;
    max-width: 32%;
    flex: 1;
    padding: 40px 30px 50px 30px;
    background: var(--background);
    box-shadow: 0px 20px 30px rgba(0, 0, 0, 0.1);
    border-radius: 7px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
`;

const BlogTitle = styled.p`
    font-family: Playfair Display !important;
    font-style: normal;
    font-weight: normal;
    font-size: 25px;
    line-height: 91.91%;
    text-transform: capitalize;
    color: var(--color);
    margin-bottom: 15px;
`;

const BlogDescription = styled.div`
    font-family: Nunito !important;
    font-style: normal;
    font-weight: 300;
    font-size: 17px;
    line-height: 15.63px;
    color: var(--color);
`;

const MediumIcon = styled.i`
    position: absolute;
    font-size: 23px;
    bottom: 10px;
    right: 10px;
`;

const MediumDate = styled.i`
    position: absolute;
    font-size: 15px;
    bottom: 10px;
    left: 30px;
    color: var(--color);
    font-style: italic;
`;

const Arrow = styled.img`
    width: 25px;
    fill: white;
`;

export default BlogPosts;

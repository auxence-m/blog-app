import {useMemo, useRef, useState} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Link from "@mui/material/Link";
import { Link as ReactRouterLink } from "react-router-dom";
import {styled} from "@mui/material/styles";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Pagination from '@mui/material/Pagination';

const StyledTypography = styled(Typography)({
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

export default function ListBlogs ({blogPosts}) {
    const categories = ["All categories", "Company", "Design", "Engineering", "Product"];

    const location = useLocation();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const postCategory = searchParams.get("category");
    const filter = postCategory || "All categories";

    const postListRef = useRef(null);
    const PAGE_SIZE = 5;
    const [page, setPage] = useState(0);

    // selectedPosts checks for a query parameter
    // If there is any, filter the posts according to the query parameter
    // UseMemo will update selectedPost every time postCategory changes
    const selectedPosts= useMemo(() => {
        if (blogPosts.length === 0) return [];
        if (postCategory && postCategory !== "All categories") {
            setPage(0);
            return blogPosts.filter((post) => post.category === postCategory);
        }
        setPage(0);
        return blogPosts;
    }, [blogPosts, postCategory]);


    const firstPost = page * PAGE_SIZE;
    const totalPages = Math.ceil(selectedPosts.length / PAGE_SIZE);
    const displayedPosts = selectedPosts.slice(firstPost, firstPost + PAGE_SIZE);

    function handlePageChange(event, value) {
        setPage(value-1);
        postListRef.current?.scrollIntoView();
    }

    function handlePostFilter(category) {
        if (category === filter) return ; // No need to re-filter or navigate if the category is the same
        if (category !== "All categories") {
            navigate({pathname: location.pathname, search: `category=${category}`}); // Changes query parameter
        } else {
            navigate(location.pathname);
        }
    }

    return (
        <Box ref={postListRef}>
            <Box display="flex" flexDirection="column" justifyContent="space-between" gap={3} height="100%">
                {
                    <Typography component="h2" variant="h6">
                        Posts {" "}
                        {
                            filter !== "All categories" &&
                            <span>
                                categorized as {" "}
                                <Typography component="span" variant="inherit" color="primary" noWrap>{`"${filter}"`}</Typography>
                            </span>
                        }
                    </Typography>
                }

                {
                    <Stack paddingBottom={1} overflow="auto" direction="row" spacing={2}>
                        {
                            categories.map((category) => (
                                <Chip key={category}
                                      label={category}
                                      variant={filter === category ? "filled" : "outlined"}
                                      color={filter === category ? "secondary" : "default"}
                                      onClick={() => handlePostFilter(category)}
                                ></Chip>
                            ))
                        }
                    </Stack>
                }

                {
                    selectedPosts.length > 0 &&
                    <Stack spacing={5}>
                        {
                            displayedPosts.map((post) => (
                                <Box key={post.ID}>
                                    <Typography gutterBottom variant="caption" component="div">
                                        {post.category}
                                    </Typography>
                                    <Typography gutterBottom  variant="h6">
                                        <Link component={ReactRouterLink} to={`/blogs/${post.ID}`} underline="hover">
                                            {post.title}
                                        </Link>
                                    </Typography>
                                    <StyledTypography variant="body2" color="textSecondary" gutterBottom>
                                        {post.content}
                                    </StyledTypography>
                                    <Box marginTop={1.5} display="flex" flexDirection="row" justifyContent="space-between">
                                        <Typography marginTop={0.5} variant="caption">
                                            {new Date(post.CreatedAt).toDateString()}
                                        </Typography>
                                        <Button component={ReactRouterLink} sx={{textTransform: "none"}} variant="text" to={`/blogs/${post.ID}`} size="small" endIcon={<NavigateNextIcon />}>
                                            Read more
                                        </Button>
                                    </Box>
                                    <Divider sx={{marginTop: 1.5}}></Divider>
                                </Box>
                            ))
                        }
                    </Stack>
                }
            </Box>
            <Pagination page={page + 1} count={totalPages} variant="outlined" shape="rounded" sx={{marginTop: 4, marginBottom: 4}} onChange={handlePageChange}></Pagination>
        </Box>
    );
}
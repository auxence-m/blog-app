import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useEffect, useState} from "react";
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import ListBlogs from "./ListBlogs.jsx";

export default function HomePage() {
    const [allPosts, setAllPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        // Arrow function to fetch selectedPosts from api
        const fetchPosts = async () => {
            try {
                const response = await fetch("/api/posts", {signal: signal});

                if (response.ok) {
                    const data = await response.json();
                    setAllPosts(data.posts);
                } else {
                    const error = await response.json();
                    setError(`${response.status} : ${error.error}`);
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    console.log("Fetch aborted successfully");
                } else {
                    setError("An Unexpected error occurred while fetching the posts. Please try again later.");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchPosts();

        // Clean-up function
        return () => {
            abortController.abort();
        }
    }, []);

    return (
        <Box display="flex" flexDirection="column" justifyContent="center">

            <Box marginBottom={2}>
                <Typography variant="h6" gutterBottom>
                    Explore New Blogs
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Stay in the loop. See what others are writing about
                </Typography>
            </Box>

            <Box display="flex" flexDirection="column" justifyContent="space-between" gap={3} height="100%">
                {
                    error !== "" &&
                    <Alert severity="error" variant="filled">{error}</Alert>
                }

                {
                    isLoading &&
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Loading posts ...
                        </Typography>
                        <LinearProgress sx={{height: 5, borderRadius: 8}} color="secondary"/>
                    </Box>
                }

                {
                    allPosts.length > 0 &&
                    <ListBlogs blogPosts={allPosts}></ListBlogs>
                }
            </Box>
        </Box>
    )
}
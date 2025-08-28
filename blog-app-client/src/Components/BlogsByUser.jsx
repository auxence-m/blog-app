import {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import ListBlogs from "./ListBlogs.jsx";
import {Link as ReactRouterLink} from "react-router-dom";
import Link from "@mui/material/Link";
import Snackbar from '@mui/material/Snackbar';
import {useAuthentication} from "../../AuthenticationContext.jsx";

export default function BlogsByUser() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const params = useParams();
    const userID = parseInt(params.id);

    const[navigationInfo, setNavigationInfo] = useState(false);

    const location = useLocation();
    const state = location.state;

    const {user} = useAuthentication();

    function handleAlertClose(event, reason) {
        if (reason === "clickaway") {
            return;
        }
        setNavigationInfo(false);
    }

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        // Arrow function to fetch selectedPosts from api
        const fetchPosts = async () => {
            try {
                const response = await fetch("/api/posts", {signal: signal});

                if (response.ok) {
                    const data = await response.json();
                    setBlogs(data.posts.filter((blog) => blog.authorId === userID));
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

        if (state) {
            setNavigationInfo(true);
        }

        // Clean-up
        return () => {
            abortController.abort();
        }
    }, []);

    return(
        <Box display="flex" flexDirection="column" justifyContent="center">
            <Box marginBottom={2}>
                <Typography variant="h6" gutterBottom>
                    Welcome back {" "}
                    <span>
                        <Typography component="span" variant="inherit" color="primary" noWrap>
                            {user?.username} !
                        </Typography>
                    </span>
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Manage your published blog posts here !
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
                    blogs.length > 0 &&
                    <ListBlogs blogPosts={blogs}></ListBlogs>

                }

                {
                    (blogs.length === 0 && !isLoading) &&
                    <Typography gutterBottom>
                        You haven't written anything yet.{" "}
                        <Link component={ReactRouterLink} to="/sign-up" sx={{ alignSelf: "center" }}>
                            Start writing now !
                        </Link>
                    </Typography>
                }
            </Box>
            <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} open={navigationInfo} autoHideDuration={6000} onClose={handleAlertClose}>
                <Alert severity="success" variant="filled" onClose={handleAlertClose} sx={{width: "75vw"}}>
                    {state?.success}
                </Alert>
            </Snackbar>
        </Box>
    );
}
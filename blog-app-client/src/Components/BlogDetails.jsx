import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Stack from "@mui/material/Stack";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import { Link as ReactRouterLink } from "react-router-dom";
import {BackHomeButton} from "./Utils.jsx";
import {useAuthentication} from "../../AuthenticationContext.jsx";

export default function BlogDetails() {
    const [post, setPost] = useState(null);
    const [error, setError] = useState("");

    const blogRef = useRef(null);
    const params = useParams();
    const postId = params.id;

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarText, setSnackbarText] = useState("");

    const [modificationError, setModificationError] = useState(false);

    const navigate = useNavigate();
    const {user, isLoggedIn} = useAuthentication();

    function validateEdit() {
        return !content || !title || (title.trim() === post.title.trim() && content.trim() === post.content.trim());
    }

    function handleSnackbarClose(event, reason) {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    }

    function handleEditClick() {
        setIsEditing(true);
        blogRef.current?.scrollIntoView();
    }

    async function getPost(abortSignal) {
        try {
            const response = await fetch(`/api/posts/${postId}`, {signal: abortSignal});

            if (response.ok) {
                const data = await response.json();
                const post = data.post;
                setPost(post);
                setTitle(post.title);
                setContent(post.content);
            } else {
                const error = await response.json();
                setError(`${response.status}  : ${error.error}`);
            }
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Fetch aborted successfully");
            } else {
                setError("An Unexpected error occurred. Please try again later.");
            }
        }
    }

    async function handleEditPost(event) {
        event.preventDefault();
        const authorId = post.authorId;
        const category = post.category

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({authorId, title, content, category}),
            });

            if (response.ok) {
                setSnackbarText("Blog post successfully updated");
                setModificationError(false);
            } else {
                setSnackbarText("Failed to update blog post. Please try again later");
                setModificationError(true);
            }
        } catch (error) {
            setSnackbarText("Something unexpected happened. Please try again later");
            setModificationError(true);
        } finally {
            setIsEditing(false);
            setOpenEditDialog(false);
            setOpenSnackbar(true);

            const abortController = new AbortController();
            const signal = abortController.signal;
            await getPost(signal);
        }
    }

    async function handleDeletePost(event) {
        event.preventDefault();
        const authorID = post.authorId;

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                setModificationError(false);
                navigate(`/your-posts/${authorID}`, {state: {success: "Blog posts deleted successfully"}});
            } else {
                setSnackbarText("Failed to deleted blog post. Please try again later");
                setModificationError(true);
            }
        } catch (error) {
            setSnackbarText("Something unexpected happened. Please try again later");
            setModificationError(true);
        }
    }

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        getPost(signal);

        return () => {
            abortController.abort();
        }

    }, []);

    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" marginTop={2}>
            <Box>
                {
                    error !== "" && <Alert severity="error" variant="filled">{error}</Alert>
                }

                {
                    post !== null &&
                    <Box ref={blogRef}>
                        <Box>
                            <Box marginBottom={2}>
                                <BackHomeButton variant="text" component={ReactRouterLink} to="/" startIcon={<NavigateBeforeIcon />}>
                                    Back to blogs
                                </BackHomeButton>
                            </Box>
                            <Typography gutterBottom marginTop={0.5} variant="caption">
                                {new Date(post.CreatedAt).toDateString()}
                            </Typography>
                            {
                                !isEditing ? (
                                    <Box>
                                        <Typography marginY={2} variant="h4" component="h1" fontWeight={700} fontFamily="'Playfair Display', serif" gutterBottom>
                                            {post.title}
                                        </Typography>
                                        <Typography whiteSpace="pre-wrap"
                                                    variant="body1"
                                                    color="textSecondary"
                                                    fontFamily="'Roboto Slab', serif"
                                                    fontSize="1.05rem"
                                                    lineHeight={1.8}
                                                    gutterBottom>
                                            {post.content}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack marginTop={2} spacing={2}>
                                        <FormControl>
                                            <FormLabel sx={{marginBottom: 1}} htmlFor="title">Title</FormLabel>
                                            <TextField id="title"
                                                       type="text"
                                                       name="title"
                                                       placeholder="Title"
                                                       fullWidth
                                                       value={title}
                                                       onChange={event => {setTitle(event.target.value)}} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel sx={{marginBottom: 1}} htmlFor="content">Content</FormLabel>
                                            <TextField id="content"
                                                       type="text"
                                                       name="content"
                                                       placeholder="content"
                                                       fullWidth
                                                       multiline
                                                       rows={20}
                                                       value={content}
                                                       onChange={event => {setContent(event.target.value)}} />
                                        </FormControl>
                                    </Stack>
                                )
                            }
                        </Box>
                        <Box display={(user?.userID === post.authorId && isLoggedIn) ? "flex" : "none"} justifyContent="space-between" marginTop={4}>
                            <Box display={isEditing === true ? "none" : "block"}>
                                <Button variant="contained" color="error" onClick={() => {setOpenDeleteDialog(true)}}>
                                    Delete Post
                                </Button>
                            </Box>
                            <Box>
                                <Box display={isEditing === true ? "none" : "block"}>
                                    <Button variant="contained" onClick={handleEditClick}>Edit Post</Button>
                                </Box>
                                <Stack display={isEditing === true ? "block" : "none"} direction="row" spacing={2}>
                                    <Button variant="contained" disabled={validateEdit()} onClick={()=> {setOpenEditDialog(true)}}>
                                        Save Edit
                                    </Button>
                                    <Button variant="outlined" onClick={() => {setIsEditing(false)}}>Cancel</Button>
                                </Stack>
                            </Box>
                        </Box>
                    </Box>
                }
            </Box>
            <Box>
                <Dialog open={openEditDialog} onClose={() => {setOpenEditDialog(false)}}>
                    <Box sx={{ backgroundColor: 'background.default'}}>
                        <DialogTitle id="alert-dialog-title">
                            Post edit confirmation
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to save the modifications made on this post ?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {setOpenEditDialog(false)}}>Cancel</Button>
                            <Button onClick={handleEditPost}>Confirm</Button>
                        </DialogActions>
                    </Box>
                </Dialog>
                <Dialog open={openDeleteDialog} onClose={() => {setOpenDeleteDialog(false)}}>
                    <Box sx={{ backgroundColor: 'background.default'}}>
                        <DialogTitle id="alert-dialog-title">
                            Post deletion confirmation
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to delete this post ?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {setOpenDeleteDialog(false)}}>Cancel</Button>
                            <Button onClick={handleDeletePost}>Confirm</Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </Box>
            <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert sx={{width: "75vw"}} severity={modificationError === true ? "error" : "success"} variant="filled" onClose={handleSnackbarClose}>
                    {snackbarText}
                </Alert>
            </Snackbar>
        </Box>
    )
}
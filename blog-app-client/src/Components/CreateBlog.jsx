import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthentication} from "../../AuthenticationContext.jsx";
import FormControl from "@mui/material/FormControl";
import FormLabel from '@mui/material/FormLabel';
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function CreateBlog() {
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [categoryError, setCategoryError] = useState(false);
    const [titleError, setTitleError] = useState(false);
    const [contentError, setContentError] = useState(false);

    const [categoryErrorMessage, setCategoryErrorMessage] = useState("");
    const [titleErrorMessage, setTitleErrorMessage] = useState("");
    const [contentErrorMessage, setContentErrorMessage] = useState("");

    const[postingError, setPostingError] = useState(false);
    const[postingErrorMessage, setPostingErrorMessage] = useState("");

    const {user} = useAuthentication();

    const navigate = useNavigate();

    function validateInputs() {
        let isValid = true;

        if (category === "") {
            setCategoryError(true);
            setCategoryErrorMessage("Please chose a category for you blog post");
            isValid = false;
        } else {
            setCategoryError(false);
            setCategoryErrorMessage("")
        }

        if (title === "") {
            setTitleError(true);
            setTitleErrorMessage("The title of your blog post cannot be empty");
            isValid = false;
        } else if (title.length < 20) {
            setTitleError(true);
            setTitleErrorMessage("The title of your blog post must be at least 20 characters long");
            isValid = false;
        } else {
            setTitleError(false);
            setTitleErrorMessage("")
        }

        if (content === "") {
            setContentError(true);
            setContentErrorMessage("The content of your blog post cannot be empty");
            isValid = false;
        } else if (content.length < 20) {
            setContentError(false);
            setContentErrorMessage("The content of your blog post must be at least 20 characters long");
            isValid = false;
        } else {
            setContentError(false);
            setContentErrorMessage("");
        }

        return isValid;
    }

    async function handleSubmit(event){
        event.preventDefault();

        if (categoryError || titleError || contentError) {
            return;
        }

        try {
            const authorID = user.userID;

            const response = await fetch("/api/posts", {
               method: "POST",
               headers: {
                   "Content-Type": "application/json",
               },
                body: JSON.stringify({authorID, title, content, category}),
            });

            if (response.ok) {
                setPostingError(false);
                setPostingErrorMessage("");
                navigate(`/your-posts/${authorID}`, {state: {success: "Blog posts created successfully"}});
            } else {
                setPostingErrorMessage("An error occurred while creating your blog post. Please try again later!");
                setPostingError(true);
            }

        } catch (error) {
            setPostingErrorMessage("Something unexpected happened. Please try again later !");
            setPostingError(true);
        }
    }

    function handleSnackbarClose(event, reason) {
        if (reason === "clickaway") {
            return;
        }
        setPostingError(false);
    }

    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" marginTop={2}>
            <Typography variant="h6" gutterBottom>
                Create a new blog post
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                What's on your mind today ?
            </Typography>
            <Box display="flex" flexDirection="column" justifyContent="space-between" gap={3} marginTop={2}
                 component="form" onSubmit={handleSubmit} noValidate>
                <FormControl>
                    <TextField id="category"
                               select
                               label="Category"
                               required
                               value={category}
                               error={categoryError}
                               helperText={categoryErrorMessage}
                               color={categoryError ? "error" : "primary"}
                               onChange={event => {setCategory(event.target.value) }}>
                        <MenuItem value={"Company"}>Company</MenuItem>
                        <MenuItem value={"Design"}>Design</MenuItem>
                        <MenuItem value={"Engineering"}>Engineering</MenuItem>
                        <MenuItem value={"Product"}>Product</MenuItem>
                    </TextField>
                </FormControl>
                <FormControl>
                    <FormLabel sx={{marginBottom: 1}} htmlFor="title">Title *</FormLabel>
                    <TextField id="title"
                               type="text"
                               name="title"
                               placeholder="Title of your post"
                               variant="outlined"
                               autoFocus
                               required
                               fullWidth
                               value={title}
                               error={titleError}
                               helperText={titleErrorMessage}
                               color={titleError ? "error": "primary"}
                               onChange={event => {setTitle(event.target.value)}} />
                </FormControl>
                <FormControl>
                    <FormLabel sx={{marginBottom: 1}} htmlFor="content">Content *</FormLabel>
                    <TextField id="content"
                               type="text"
                               name="content"
                               placeholder="Content of your post"
                               variant="outlined"
                               autoFocus
                               required
                               multiline
                               rows={12}
                               fullWidth
                               value={content}
                               error={contentError}
                               helperText={contentErrorMessage}
                               color={contentError ? "error": "primary"}
                               onChange={event => {setContent(event.target.value)}} />
                </FormControl>
                <Button sx={{padding: 1.2}} type="submit"
                        variant="contained" fullWidth
                        onClick={validateInputs}>
                    Post
                </Button>
            </Box>
            <Snackbar open={postingError} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert severity="error" variant="filled" onClose={handleSnackbarClose} sx={{width: "100%"}}>
                    {postingErrorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
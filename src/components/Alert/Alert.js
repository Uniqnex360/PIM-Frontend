import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Snackbar Component
<Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
  <Alert onClose={() => setOpenSnackbar(false)} severity="success">
    Filter Applied Successfully!
  </Alert>
</Snackbar>

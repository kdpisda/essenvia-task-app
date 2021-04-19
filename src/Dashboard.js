import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Grid,
  Link,
  Dialog,
  DialogContent,
  Button,
  TextField,
  Slide,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import Spreadsheet from "react-spreadsheet";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import MaterialTable from "material-table";
import _ from "lodash";
import { isLoggedIn, generateNotificationFunctional } from "utils/utilities";
import { useHistory } from "react-router-dom";
import { submitData } from "utils/apis";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="/">
        Essenvia
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  dialogAppBar: {
    position: "relative",
  },
  textField: {
    marginRight: theme.spacing(1),
    width: "15ch",
  },
  dialogInput: {
    display: "none",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Dashboard() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const open = false;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetData, setSheetData] = React.useState([[]]);

  const [sheetRows, setSheetRows] = React.useState(0);
  const [sheetColumns, setSheetColumns] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState("INIT");

  const history = useHistory();

  const [selectedImage, setSelectedImage] = React.useState(null);

  React.useEffect(async () => {
    const hasAlreadyLoggedIn = await isLoggedIn();
    if (!hasAlreadyLoggedIn) {
      history.push("/");
    }
  });

  const createBlankSheet = async () => {
    let column = _.fill(Array(parseInt(sheetColumns)), { value: "" });
    let data = _.fill(Array(parseInt(sheetRows)), column);
    await setSheetData(data);
    await setSheetMode("ADD");
  };

  const handleClickOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveButton = async () => {
    await setLoading(true);
    const data = {
      selectedImage: selectedImage,
      sheetData: sheetData,
    };

    let res = await submitData(data);
    generateNotificationFunctional(
      res,
      enqueueSnackbar,
      "Data Entered Successfully! Generating PDF"
    );

    await setLoading(false);
  };

  return (
    <div className={classes.root}>
      <Dialog
        fullScreen
        open={dialogOpen}
        onClose={handleCloseDialog}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.dialogAppBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Create Entry
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSaveButton}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <div style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
            <input
              accept="image/*"
              className={classes.dialogInput}
              id="contained-button-file"
              type="file"
              onChange={async (event) => {
                await setSelectedImage(event.target.files[0]);
              }}
            />
            <label htmlFor="contained-button-file">
              <Button variant="contained" color="primary" component="span">
                Upload
              </Button>
            </label>
            &nbsp;&nbsp;
            {selectedImage != null && selectedImage.name}
          </div>
          {sheetMode === "INIT" && (
            <div style={{ paddingBottom: "2rem" }}>
              <TextField
                id="rows"
                label="Rows"
                className={classes.textField}
                type="number"
                value={sheetRows}
                onChange={async (event) => {
                  await setSheetRows(event.target.value);
                }}
              />{" "}
              <TextField
                id="columns"
                label="Columns"
                className={classes.textField}
                type="number"
                value={sheetColumns}
                onChange={async (event) => {
                  await setSheetColumns(event.target.value);
                }}
              />{" "}
              &nbsp;
              <IconButton
                aria-label="delete"
                disabled={sheetColumns == 0 || sheetRows == 0}
                onClick={createBlankSheet}
              >
                <SaveIcon />
              </IconButton>
            </div>
          )}
          {sheetMode != "INIT" && (
            <Spreadsheet
              style={{ height: "80%", width: "100%" }}
              data={sheetData}
              onChange={async (data) => {
                await setSheetData(data);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Essenvia Task
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => {
              handleClickOpenDialog();
            }}
          >
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MaterialTable
                title="Recent Items"
                columns={[
                  { title: "Name", field: "name" },
                  { title: "Surname", field: "surname" },
                  {
                    title: "Birth Year",
                    field: "birthYear",
                    type: "numeric",
                  },
                  {
                    title: "Birth Place",
                    field: "birthCity",
                    lookup: { 34: "İstanbul", 63: "Şanlıurfa" },
                  },
                ]}
                data={[
                  {
                    name: "Mehmet",
                    surname: "Baran",
                    birthYear: 1987,
                    birthCity: 63,
                  },
                  {
                    name: "Zerya Betül",
                    surname: "Baran",
                    birthYear: 2017,
                    birthCity: 34,
                  },
                ]}
                actions={[
                  {
                    icon: "save",
                    tooltip: "Save User",
                    onClick: (event, rowData) =>
                      alert("You saved " + rowData.name),
                  },
                ]}
              />
            </Grid>
          </Grid>

          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </div>
  );
}

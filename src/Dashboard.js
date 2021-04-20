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
import CircularProgress from "@material-ui/core/CircularProgress";
import _ from "lodash";
import {
  isLoggedIn,
  generateNotificationFunctional,
  popNotificationFunctional,
  get,
} from "utils/utilities";
import { useHistory } from "react-router-dom";
import { submitData, getDataDetail } from "utils/apis";
import { API_SERVER } from "config";

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
  const [dataID, setDataID] = React.useState(null);

  const [sheetRows, setSheetRows] = React.useState(0);
  const [sheetColumns, setSheetColumns] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  // INIT, ADD, WAIT, DONE
  const [sheetMode, setSheetMode] = React.useState("INIT");
  const [downloadLink, setDownloadLink] = React.useState(null);
  const [data, setData] = React.useState({});
  const [pollInterval, setPollInterval] = React.useState(null);

  const history = useHistory();

  const [selectedImage, setSelectedImage] = React.useState(null);

  React.useEffect(async () => {
    const hasAlreadyLoggedIn = await isLoggedIn();
    if (!hasAlreadyLoggedIn) {
      history.push("/");
    }
  });

  React.useEffect(async () => {
    if (data["status"] === "FINI") {
      clearInterval(pollInterval);
      let pdfFile = data["generated_pdf"];
      console.log(data);
      await setDownloadLink(API_SERVER + pdfFile);
      console.log(downloadLink);
      await setSheetMode("DONE");
      await setPollInterval(null);
      popNotificationFunctional(
        enqueueSnackbar,
        "Congratulations! PDF generated successfully",
        "success"
      );
    } else if (data["status"] == "FAIL") {
      clearInterval(pollInterval);
      popNotificationFunctional(
        enqueueSnackbar,
        "Sorry! We could not generate the PDF",
        "error"
      );
    }
  }, [data]);

  // const checkDataStatusPoll = async () => {
  //   console.log(dataID);
  //   const res = await getDataDetail(dataID);
  //   let data = get(["data"])(res);
  //   console.log(data);
  // };

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

    let status = get(["status"])(res);
    if (status !== null && status === 201) {
      const resDataID = get(["data", "data", "id"])(res);
      await setDataID(resDataID);
      await setSheetMode("WAIT");
      const localPollInterval = setInterval(async () => {
        const res = await getDataDetail(resDataID);
        const resData = get(["data", "data"])(res);
        await setData(resData);
      }, 1000);
      await setPollInterval(localPollInterval);
    }

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
            <Button
              color="inherit"
              onClick={() => {
                window.open(downloadLink, "_blank");
              }}
              disabled={downloadLink === null && sheetMode != "DONE"}
            >
              {loading || sheetMode != "DONE" ? (
                <CircularProgress />
              ) : (
                "Download PDF"
              )}
            </Button>
            <Button
              color="inherit"
              onClick={handleSaveButton}
              disabled={
                sheetMode === "WAIT" ||
                sheetMode === "DONE" ||
                selectedImage === null ||
                loading ||
                sheetRows === null ||
                sheetColumns === null ||
                parseInt(sheetRows) === 0 ||
                parseInt(sheetColumns) === 0
              }
            >
              {loading ? <CircularProgress /> : "Save"}
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
              <Button
                variant="contained"
                color="primary"
                component="span"
                disabled={loading}
              >
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
                disabled={loading}
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
                disabled={
                  parseInt(sheetColumns) == 0 || parseInt(sheetRows) == 0
                }
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

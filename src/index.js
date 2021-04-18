import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Signin from "./Signin";
import Dashboard from "./Dashboard";
import theme from "./theme";

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <SnackbarProvider
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      preventDuplicate
    >
      <CssBaseline />
      <Router>
        <Switch>
          <Route exact path="/dashboard">
            <Dashboard />
          </Route>
          <Route exact path="/">
            <Signin />
          </Route>
        </Switch>
      </Router>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    </SnackbarProvider>
  </ThemeProvider>,
  document.querySelector("#root")
);

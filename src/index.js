import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import theme from "./theme";

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Switch>
        <Route exact path="/dashboard">
          <Dashboard />
        </Route>
        <Route exact path="/">
          <Signup />
        </Route>
      </Switch>
    </Router>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
  </ThemeProvider>,
  document.querySelector("#root")
);

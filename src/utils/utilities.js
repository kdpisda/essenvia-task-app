export function isLoggedIn() {
  if (localStorage.length === 0) {
    return false;
  }
  let accessToken = localStorage.getItem("accessToken");
  if (
    accessToken === "" ||
    accessToken === null ||
    accessToken === "undefined"
  ) {
    return false;
  } else {
    return true;
  }
}

export const get = (p) => (o) => {
  return p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);
};

export function popNotificationFunctional(enqueueSnackbar, message, variant) {
  enqueueSnackbar(message, { variant: variant });
}

export function generateNotificationFunctional(
  res,
  enqueueSnackbar,
  success_message
) {
  let status = get(["status"])(res);
  let error = "";
  if (status === null || status === undefined) {
    enqueueSnackbar("Please check your connection!", { variant: "error" });
  } else if (Number.isInteger(status) && status !== 200 && status !== 201) {
    let data = get(["data"])(res);
    let error_fields = get(["data", "errors"])(res);
    let detail = get(["detail"])(data);
    if (detail !== null) {
      error = detail;
      enqueueSnackbar(error, {
        variant: "error",
      });
    } else if (error_fields) {
      let error_fields_keys = Object.keys(error_fields);
      for (let i in error_fields_keys) {
        for (let error in error_fields[error_fields_keys[i]]) {
          enqueueSnackbar(
            error_fields_keys[i].toUpperCase() +
              ": " +
              error_fields[error_fields_keys[i]][error],
            {
              variant: "error",
            }
          );
        }
      }
    } else {
      enqueueSnackbar("Sorry! An error occurred please try again later.", {
        variant: "error",
      });
    }
  } else {
    enqueueSnackbar(success_message, { variant: "success" });
  }
}

export function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

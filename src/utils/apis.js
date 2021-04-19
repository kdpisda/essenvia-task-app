import axios from "axios";
import { API_SERVER } from "config";

axios.interceptors.response.use(
  (response) => {
    // do something with the response data
    console.log("Response was received");
    return response;
  },
  (error) => {
    // handle the response error
    console.log("Request Failed");
    const {
      config,
      // response: { status }
    } = error;
    const originalRequest = config;
    if (
      error.config &&
      error.response &&
      error.response.status === 401 &&
      error.response.data.detail ===
        "Given token not valid for any token type" &&
      error.response.data.code === "token_not_valid"
    ) {
      return getNewTokens()
        .then(function () {
          const retryOrigReq = new Promise((resolve, reject) => {
            try {
              originalRequest.headers["Authorization"] =
                "Bearer " + localStorage.getItem("accessToken");
              resolve(axios(originalRequest));
              // replace the expired token and retry
            } catch (err) {
              reject(err);
            }
          });

          return retryOrigReq;
        })
        .catch(function () {
          window.location.replace("/auth/logout");
        });
    }
    return Promise.reject(error);
  }
);

async function get(endpoint, headers, params) {
  let url = API_SERVER + endpoint;
  return await axios
    .get(url, { headers: headers, params: params })
    .then(function (res) {
      return res;
    })
    .catch(function (err) {
      return err.response;
    });
}

async function post(endpoint, data, headers, params) {
  let url = API_SERVER + endpoint;
  return await axios
    .post(url, data, { headers: headers, params: params })
    .then(function (res) {
      return res;
    })
    .catch(function (error) {
      return error.response;
      // Promise.reject(error);
    });
}

export async function getNewTokens() {
  let data = {
    refresh: localStorage.getItem("refreshToken"),
  };
  await post("/auth/refresh/", data, {}, {})
    .then(async function (res) {
      if (res.status === 200) {
        await localStorage.setItem("accessToken", res.data.access);
      }
    })
    .catch(function (err) {
      console.log(err);
      window.location.replace("/auth/logout");
    });
}

export async function login(data) {
  return await post("/auth/login/", data, {}, {});
}

export async function submitData(data) {
  let headers = {
    Authorization: "Bearer " + (await localStorage.getItem("accessToken")),
  };
  const formData = new FormData();
  formData.append("file", data.selectedImage);
  formData.append("data", JSON.stringify(data.sheetData));
  return await post("/data/", formData, headers, {});
}

export async function getDataDetail(pk) {
  let headers = {
    Authorization: "Bearer " + (await localStorage.getItem("accessToken")),
  };
  return await get("/data/" + pk + "/", headers, {});
}

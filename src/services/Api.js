import axios from "axios";

const Api = axios.create({ baseURL: "http://cdc-react.herokuapp.com/api" });

export default Api;

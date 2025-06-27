import { combineReducers } from "redux";
import authReducer from "./authSlice";
import locationReducer from "./locationSlice";
import userReducer from "./userSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  user: userReducer,
});

export default rootReducer; 
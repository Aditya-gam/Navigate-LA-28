import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/slices/authSlice";
import locationReducer from "@/slices/locationSlice";
import userReducer from "@/slices/userSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  user: userReducer,
});

export default rootReducer;

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import UsersSlice from "./Slice/Users.slice";
import NutanixSlice from "./Slice/Nutanix.slice";
import XClaritySlice from "./Slice/XClarity.slice";
import VmwareSlice from './Slice/vmware.slice';

export const store = configureStore({
  reducer: {
    user: UsersSlice,
    nutanix: NutanixSlice,
    xclarity: XClaritySlice,
    vmware: VmwareSlice

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), // Удален `userApi.middleware`
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

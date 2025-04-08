import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    admin:null,
    isLogged:false,
}

const adminSlice = createSlice({
    name:'admin',
    initialState,
    reducers:{
        adminLogin:(state,action)=>{
            state.admin = action.payload;
            state.isLogged =true;
        },
        adminLoginFailure:(state)=>{
            state.isLogged =false;
            state.admin=null;
        },
        adminLogout :(state)=>{
            state.admin = null;
            state.isLogged =false;
        }
    }
})

export const {adminLogin,adminLoginFailure,adminLogout} = adminSlice.actions;
export default adminSlice.reducer;

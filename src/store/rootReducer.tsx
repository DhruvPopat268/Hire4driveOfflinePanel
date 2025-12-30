import { combineReducers } from '@reduxjs/toolkit'
import bookingReducer from './slices/bookingSlice'

const rootReducer = combineReducers({
  booking: bookingReducer,
  // Add other reducers here as your app grows
})

export default rootReducer
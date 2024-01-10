import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface for the task object
interface Task {
  text: string;
  completed: boolean;
  date: string;
}

// interface for the root state
interface RootState {
  completedTasks: Task[];
}

// initial state
const initialState: RootState = {
  completedTasks: [],
};

// create todo slice
const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    updateCompletedTasks: (state, action: PayloadAction<Task[]>) => {
      state.completedTasks = action.payload;
    },
  },
});

// export actions
export const { updateCompletedTasks } = todoSlice.actions;

// export reducer
const store = configureStore({
  reducer: {
    todo: todoSlice.reducer,
  },
});

export default store;

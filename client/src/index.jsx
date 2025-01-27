import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import Homepage from "./components/pages/Homepage";
import NotFound from "./components/pages/NotFound";
import TreePage from "./components/pages/TreePage";
import Tree from "./components/pages/Tree";
import Monkey from "./components/pages/Monkey";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'

import { GoogleOAuthProvider } from '@react-oauth/google';

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "966028543976-043340bmgmgepms46t453paonanv0fbg.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Homepage />}/>
      <Route path="/treepage" element={<TreePage />} />
      <Route path="/tree" element={<Tree />} />
      <Route path="/monkey" element={<Monkey />} />
    </Route>
  )
)

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);

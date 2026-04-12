import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";
import Main from "./Pages/Main";
import Profile from "./Pages/Profile";
import Notifications from "./Pages/Notifications";
import AdminRoute from "./components/AdminRoute";
import AllUsers from "./Pages/AllUsers";
import Layout from "./components/Layout";
import NotFound from "./Pages/NotFound";
import Categories from "./Pages/Categories";
import Materials from "./Pages/Materials";
import Backups from "./Pages/Backups";
import Requests from "./Pages/Requests/Requests";
import RequestDetails from "./Pages/Requests/RequestDetails";
import Inventories from "./Pages/Inventories/Inventories";
import InventoryConduct from "./Pages/Inventories/InventoryConduct";
import InventoryReview from "./Pages/Inventories/InventoryReview";
import InventoryDetails from "./Pages/Inventories/InventoryDetails";
import Dashboard from "./Pages/Dashboard";
import Reports from "./Pages/Reports";
import ChatPage from "./Pages/ChatPage";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/login" element={<Login />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            path="/main"
                            element={
                                <ProtectedRoute>
                                    <Main />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <ChatPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/inventories"
                            element={
                                <ProtectedRoute>
                                    <Inventories />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/inventories/:id/conduct"
                            element={
                                <ProtectedRoute>
                                    <InventoryConduct />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/inventories/:id/review"
                            element={
                                <ProtectedRoute>
                                    <InventoryReview />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/inventories/:id"
                            element={
                                <ProtectedRoute>
                                    <InventoryDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/requests"
                            element={
                                <ProtectedRoute>
                                    <Requests />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/requests/:id"
                            element={
                                <ProtectedRoute>
                                    <RequestDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/materials"
                            element={
                                <ProtectedRoute>
                                    <Materials />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/category"
                            element={
                                <ProtectedRoute>
                                    <Categories />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile/:id"
                            element={
                                <ProtectedRoute>
                                    <AdminRoute>
                                        <Profile />
                                    </AdminRoute>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/backups"
                            element={
                                <ProtectedRoute>
                                    <AdminRoute>
                                        <Backups />
                                    </AdminRoute>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/allusers"
                            element={
                                <ProtectedRoute>
                                    <AdminRoute>
                                        <AllUsers />
                                    </AdminRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/reports"
                            element={
                                <ProtectedRoute>
                                    <Reports />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;

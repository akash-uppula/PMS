import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HostAdminDashboard from "./pages/HostAdminDashboard";
import HostAdminRevenueReport from "./pages/HostAdminRevenueReport";
import OrganizationAdmins from "./pages/OrganizationAdmins";
import OrganizationAdminDashboard from "./pages/OrganizationAdminDashboard";
import OrganizationAdminManagerSales from "./pages/OrganizationAdminManagerSales";
import OrganizationAdminSalesReport from "./pages/OrganizationAdminSalesReport";
import OrganizationAdminPLReport from "./pages/OrganizationAdminPLReport";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Managers from "./pages/Managers";
import ManagerDashboard from "./pages/ManagerDashboard";
import Employees from "./pages/Employees";
import ManagerFinalizedQuotations from "./pages/ManagerFinalizedQuotations";
import ManagerCompletedOrders from "./pages/ManagerCompletedOrders";
import ManagerSalesReport from "./pages/ManagerSalesReport";
import ManagerSalary from "./pages/ManagerSalary";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProducts from "./pages/EmployeeProducts";
import EmployeeSalary from "./pages/EmployeeSalary";
import CreateQuotation from "./pages/CreateQuotation";
import ViewDraftQuotations from "./pages/ViewDraftQuotations";
import FinalizeQuotation from "./pages/FinalizeQuotation";
import ViewFinalizedQuotations from "./pages/ViewFinalizedQuotations";
import ViewOrders from "./pages/ViewOrders";

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./pages/ScrollToTop";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={["host-admin"]} />}>
            <Route
              path="/host-admin/dashboard"
              element={<HostAdminDashboard />}
            />
            <Route
              path="/host-admin/organization-admins"
              element={<OrganizationAdmins />}
            />
            <Route
              path="/host-admin/revenue"
              element={<HostAdminRevenueReport />}
            />
            <Route
              path="/host-admin/reports"
              element={<div>Platform Reports Page</div>}
            />
            <Route
              path="/host-admin/settings"
              element={<div>Platform Settings Page</div>}
            />
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={["organization-admin"]} />}
          >
            <Route
              path="/organization-admin/dashboard"
              element={<OrganizationAdminDashboard />}
            />
            <Route
              path="/organization-admin/categories"
              element={<Categories />}
            />
            <Route path="/organization-admin/products" element={<Products />} />
            <Route path="/organization-admin/managers" element={<Managers />} />
            <Route
              path="/organization-admin/reports"
              element={<OrganizationAdminSalesReport />}
            />
            <Route
              path="/organization-admin/pl-report"
              element={<OrganizationAdminPLReport />}
            />
            <Route
              path="/organization-admin/manager/sales-report"
              element={<OrganizationAdminManagerSales />}
            />
            <Route
              path="/organization-admin/salary"
              element={<ManagerSalary />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/employees" element={<Employees />} />
            <Route
              path="/manager/finalized-quotations"
              element={<ManagerFinalizedQuotations />}
            />
            <Route
              path="/manager/completed-orders"
              element={<ManagerCompletedOrders />}
            />
            <Route
              path="/manager/sales-report"
              element={<ManagerSalesReport />}
            />
            <Route path="/manager/salary" element={<EmployeeSalary />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/products" element={<EmployeeProducts />} />
            <Route
              path="/employee/createQuotation"
              element={<CreateQuotation />}
            />
            <Route
              path="/employee/quotations/ViewDraftQuotations"
              element={<ViewDraftQuotations />}
            />
            <Route
              path="/employee/quotations/finalize"
              element={<FinalizeQuotation />}
            />
            <Route
              path="/employee/quotations/finalized"
              element={<ViewFinalizedQuotations />}
            />
            <Route
              path="/employee/orders/ViewOrders"
              element={<ViewOrders />}
            />
          </Route>
        </Routes>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import PelaporDashboard from "@/pages/pelapor/PelaporDashboard";
import LaporanBaru from "@/pages/pelapor/LaporanBaru";
import LaporanDetail from "@/pages/pelapor/LaporanDetail";

import RelawanDashboard from "@/pages/relawan/RelawanDashboard";
import RelawanDaftar from "@/pages/relawan/RelawanDaftar";
import RelawanDetail from "@/pages/relawan/RelawanDetail";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLaporan from "@/pages/admin/AdminLaporan";
import AdminLaporanDetail from "@/pages/admin/AdminLaporanDetail";
import AdminRelawan from "@/pages/admin/AdminRelawan";
import AdminInventaris from "@/pages/admin/AdminInventaris";
import AdminPenugasan from "@/pages/admin/AdminPenugasan";

import DonaturDashboard from "@/pages/donatur/DonaturDashboard";
import Transparansi from "@/pages/Transparansi";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/transparansi" component={Transparansi} />

      {/* Donatur Routes — login required */}
      <Route path="/donatur">
        {(params) => <PrivateRoute component={DonaturDashboard} {...params} />}
      </Route>

      {/* Pelapor Routes — login required */}
      <Route path="/pelapor">
        {(params) => <PrivateRoute component={PelaporDashboard} {...params} />}
      </Route>
      <Route path="/pelapor/laporan-baru">
        {(params) => <PrivateRoute component={LaporanBaru} {...params} />}
      </Route>
      <Route path="/pelapor/laporan/:id">
        {(params) => <PrivateRoute component={LaporanDetail} {...params} />}
      </Route>

      {/* Relawan Routes — login required */}
      <Route path="/relawan">
        {(params) => <PrivateRoute component={RelawanDashboard} {...params} />}
      </Route>
      <Route path="/relawan/daftar">
        {(params) => <PrivateRoute component={RelawanDaftar} {...params} />}
      </Route>
      <Route path="/relawan/:id">
        {(params) => <PrivateRoute component={RelawanDetail} {...params} />}
      </Route>

      {/* Admin Routes — login required */}
      <Route path="/admin">
        {(params) => <PrivateRoute component={AdminDashboard} {...params} />}
      </Route>
      <Route path="/admin/laporan">
        {(params) => <PrivateRoute component={AdminLaporan} {...params} />}
      </Route>
      <Route path="/admin/laporan/:id">
        {(params) => <PrivateRoute component={AdminLaporanDetail} {...params} />}
      </Route>
      <Route path="/admin/relawan">
        {(params) => <PrivateRoute component={AdminRelawan} {...params} />}
      </Route>
      <Route path="/admin/inventaris">
        {(params) => <PrivateRoute component={AdminInventaris} {...params} />}
      </Route>
      <Route path="/admin/penugasan">
        {(params) => <PrivateRoute component={AdminPenugasan} {...params} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

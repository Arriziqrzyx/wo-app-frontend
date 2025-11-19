import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { token } = useSelector((s) => s.auth);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

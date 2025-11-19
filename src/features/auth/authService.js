import api from "../../utils/api";

const login = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

const switchOrganization = async (organization) => {
  const res = await api.post("/auth/switch-org", { organization });
  return res.data;
};



const authService = { login, switchOrganization };
export default authService;

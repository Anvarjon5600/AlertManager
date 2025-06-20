import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../store/Slice/Users.slice";
import { RootState, AppDispatch } from "../../store/store";

import './Home.css'
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import NutanixContent from "../../components/NutanixContent/NutanixContent";
import XClarityContent from "../../components/XClarityContent/XClarityContent";
import VmwareContent from "../../components/VmwareContent/VmwareContent";
import UsersContent from "../../components/UsersContent/UsersContent";

import {
  AppProvider,
  type Session,
  type Navigation,
} from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";

import Logo from "/public/icon.svg";
import Nutanix from "../../assets/icons/nutanix.ico";
import XClarity from "../../assets/icons/xclarity.ico";
import Vmware from "../../assets/icons/clipart925106.png";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const NAVIGATION: Navigation = [
  { kind: "header", title: "Platforms" },
  {
    segment: "nutanix",
    title: "Nutanix",
    icon: <img src={Nutanix} alt="Nutanix Icon" style={{ width: 25, height: 25 }} />,
  },
  {
    segment: "xclarity",
    title: "XClarity",
    icon: <img src={XClarity} alt="XClarity Icon" style={{ width: 25, height: 24 }} />,
  },
  {
    segment: "vmware",
    title: "VMware",
    icon: <img src={Vmware} alt="Vmware Icon" style={{ width: 25, height: 24 }} />,
  },
  { kind: "divider" },
  { segment: "users", title: "Users", icon: <ManageAccountsIcon /> },
];

const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: "data-toolpad-color-scheme" },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

function DemoPageContent({ pathname }: { pathname: string }) {
  switch (pathname) {
    case "/nutanix":
      return <NutanixContent />;
    case "/xclarity":
      return <XClarityContent />;
    case "/users":
      return <UsersContent />;
    case "/vmware":
      return <VmwareContent />;
    default:
      return (
        <Box
          sx={{
            py: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            backgroundColor: "background.default",
            minHeight: "100%",
          }}
        >
          <Typography>Dashboard content for {pathname}</Typography>
        </Box>
      );
  }
}

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <img src={Logo} alt="Logo" />
      <Typography variant="h5" fontWeight="550" color="hsl(210, 100%, 60%)">
        Alerts
      </Typography>
    </Stack>
  );
}

export default function DashboardLayoutAccount({ window }: { window?: () => Window }) {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const router = useDemoRouter("/dashboard");
  const demoWindow = window ? window() : undefined;

  // Получаем пользователей из Redux store
  const { users, loading } = useSelector((state: RootState) => state.user);

  // Загружаем пользователей только если их еще нет
  React.useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  // Получаем userId из localStorage
  const userId = localStorage.getItem("userId");
  const parsedUserId = userId ? Number(userId) : null;

  // Определяем текущего пользователя
  const currentUser = users.find((user) => user.id === parsedUserId) || null;

  // Храним сессию пользователя
  const [session, setSession] = React.useState<Session | null>(null);

  // Обновляем сессию при изменении пользователя
  React.useEffect(() => {
    if (currentUser) {
      setSession({
        user: {
          name: currentUser.name,
          email: currentUser.email,
          image: "",
        },
      });
    } else {
      setSession(null);
    }
  }, [currentUser]);

  // Функции входа и выхода
  const authentication = React.useMemo(
    () => ({
      signIn: () => { },
      signOut: () => {
        setSession(null);
        localStorage.removeItem("userId");
        localStorage.setItem("loggedIn", "false");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate("/login");
      },
    }),
    [navigate]
  );

  // Показываем загрузку, если данные еще не пришли
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout slots={{ appTitle: CustomAppTitle }}>
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

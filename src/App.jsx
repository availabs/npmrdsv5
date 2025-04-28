import { DmsSite, adminConfig } from "~/modules/dms/src";
import { withAuth } from "@availabs/ams";
import Auth from './pages/Auth';
import themes from "./themes";
import DamaRoutes from "~/pages/DataManager";
import { useFalcor } from "~/modules/avail-falcor"
import { useAuth } from "~/modules/ams/src"
import LayoutWrapper from './layout/layout';
import { API_HOST, AUTH_HOST } from './config'

Auth.forEach(f => {
  f.Component = f.element
  delete f.element
})

function App() {
  return (
    <DmsSite
      dmsConfig={
        adminConfig({
          app: 'npmrdsv5',
          type: 'dev2'
        })
      }
      API_HOST={API_HOST}
      authWrapper={withAuth}
      themes={themes}

      pgEnvs={['npmrds2']}
      routes={
        [
          ...LayoutWrapper(
            DamaRoutes({
              baseUrl: '/npmrdsv5',
              defaultPgEnv: "npmrds2",
              useAuth,
              useFalcor
            })
          ),
          ...Auth
        ]
      }
      />)
    }

export default App
import { DmsSite, adminConfig } from "~/modules/dms/src";
import { withAuth } from "@availabs/ams";
import Auth from './pages/Auth';
import themes from "./themes";
import DamaRoutes from "~/pages/DataManager";

Auth.forEach(f => {
  f.Component = f.element 
  delete f.element
})

function App() {
  return ( 
      <DmsSite
        dmsConfig = { 
          adminConfig({
            // app: 'dms-docs',
            // type: 'pattern-admin'
            app: 'npmrdsv5',
            type: 'dev2' 
          })
        }
        authWrapper={withAuth}
        themes={themes}
        pgEnvs={['npmrds2']}
        routes={[...DamaRoutes({
          baseUrl:'/npmrdsv5',
          defaultPgEnv : "npmrds2",
          // navSettings: authMenuConfig,
          // dataTypes: hazmitDataTypes,
          // useFalcor,
          // useAuth
        }),
      // Auth
      ...Auth]}
      />
  )
}

export default App